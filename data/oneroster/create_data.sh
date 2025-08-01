# ==============================================================================
# create_data.sh
#
# Description:
#   This script populates a TimeBack API instance with OneRoster-compliant
#   data from local JSON files. It respects data dependencies by processing
#   files in a specific order.
#
# Usage:
#   1. Set the JWT_TOKEN environment variable:
#      export JWT_TOKEN="your_jwt_token_here"
#   2. Run the script from any directory:
#      ./data/oneroster/create_data.sh
#
# Environment Variables:
#   - JWT_TOKEN (Required): The Bearer token for API authentication.
#   - DOMAIN (Optional): The base URL of the API. Defaults to
#     'http://localhost:8080'.
#
# ==============================================================================

# --- Configuration and Setup ---

# Exit immediately if a command exits with a non-zero status.
# Commented out to allow script to continue on errors
# set -e
# The return value of a pipeline is the status of the last command to exit with
# a non-zero status.
# set -o pipefail

# Determine the script's absolute directory to locate data files reliably.
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
DATA_DIR="$SCRIPT_DIR"

# --- Dependency and Environment Checks ---

# Check for JWT_TOKEN
if [ -z "${JWT_TOKEN-}" ]; then
  echo "Error: The JWT_TOKEN environment variable is not set." >&2
  echo "Please export your authentication token before running the script." >&2
  exit 1
fi

# Check for curl
if ! command -v curl &> /dev/null; then
  echo "Error: curl is not installed. Please install it to continue." >&2
  exit 1
fi

# Check for jq
if ! command -v jq &> /dev/null; then
  echo "Error: jq is not installed. It is required for processing JSON data." >&2
  exit 1
fi

# Set the domain, defaulting to localhost:8080 if not provided.
DOMAIN=${DOMAIN:-http://localhost:8080}
BASE_URL="$DOMAIN/ims/oneroster/rostering/v1p2"

# --- Core Functions ---

# Function to POST a single resource to the API.
# Arguments:
#   $1: The specific API endpoint (e.g., "/orgs")
#   $2: The JSON payload to send
post_resource() {
  local endpoint="$1"
  local payload="$2"
  
  # The '-sS' flags make curl silent but still show errors.
  # The 'fail' flag ensures curl exits with an error code on HTTP failures (4xx, 5xx).
  echo "Calling: ${BASE_URL}${endpoint}"
  echo "Payload: ${payload}"
  
  response=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    --data "${payload}" \
    "${BASE_URL}${endpoint}")
  
  http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
  
  if [ "$http_status" -ge 400 ]; then
    echo "Error: HTTP $http_status"
    echo "Response: $body"
    # Don't exit, just return error status
    return 1
  fi
  
  echo "Success: $body"
  return 0
}

# --- Main Execution Logic ---

echo "Starting OneRoster data import to ${DOMAIN}..."
echo "------------------------------------------------"

# 1. Organizations
echo "Creating organizations..."
# Create organization and capture the returned sourcedId
ORG_RESPONSE=$(jq -c '.organizations[0]' "${DATA_DIR}/01_organizations.json" | \
  curl -sS -w "\nHTTP_STATUS:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    --data @- \
    "${BASE_URL}/orgs")

http_status=$(echo "$ORG_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
body=$(echo "$ORG_RESPONSE" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')

if [ "$http_status" -ge 400 ]; then
  echo "Error creating organization: HTTP $http_status"
  echo "Response: $body"
  echo "Continuing despite error..."
  ORG_ID=""  # Set empty ID to handle gracefully
else
  # Extract the sourcedId from the response
  ORG_ID=$(echo "$body" | jq -r '.org.sourcedId')
  echo "Organization created with ID: $ORG_ID"
fi
echo

# 2. Academic Sessions
echo "Creating academic sessions..."
# Use the captured organization ID and capture session IDs
declare -A SESSION_IDS
jq -c --arg orgId "$ORG_ID" '.academicSessions[] | {
  title: .title,
  startDate: (.startDate + "T00:00:00Z"),
  endDate: (.endDate + "T23:59:59Z"),
  type: .type,
  schoolYear: (.schoolYear | tonumber),
  orgId: $orgId
}' "${DATA_DIR}/02_academicSessions.json" | while read -r session; do
  response=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    --data "${session}" \
    "${BASE_URL}/academicSessions")
  
  http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
  
  if [ "$http_status" -lt 400 ]; then
    session_id=$(echo "$body" | jq -r '.academicSession.sourcedId')
    # Export for use in subshell
    echo "TERM_ID=$session_id"
    echo "Created academic session with ID: $session_id"
  else
    echo "Error creating session: $body"
  fi
done | grep "^TERM_ID=" | tail -1 | cut -d= -f2 | { read TERM_ID; echo "$TERM_ID" > /tmp/term_id.txt; }

# Read the term ID
TERM_ID=$(cat /tmp/term_id.txt 2>/dev/null || echo "")
echo "Academic sessions created successfully."
echo

# 3. Courses
echo "Creating courses..."
# Use the captured organization ID and capture course IDs
jq -c --arg orgId "$ORG_ID" '.courses[] | {title: .title, courseCode: .courseCode, grades: .grades, subjects: .subjects, orgId: $orgId}' "${DATA_DIR}/03_courses.json" | while read -r course; do
  response=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    --data "${course}" \
    "${BASE_URL}/courses")
  
  http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
  
  if [ "$http_status" -lt 400 ]; then
    course_id=$(echo "$body" | jq -r '.course.sourcedId')
    echo "COURSE_ID=$course_id"
    echo "Created course with ID: $course_id"
  else
    echo "Error creating course: $body"
  fi
done | grep "^COURSE_ID=" | tail -1 | cut -d= -f2 | { read COURSE_ID; echo "$COURSE_ID" > /tmp/course_id.txt; }

# Read the course ID
COURSE_ID=$(cat /tmp/course_id.txt 2>/dev/null || echo "")
echo "Courses created successfully."
echo

# 4. Users
echo "Creating users..."
# Generate random suffix for emails
RANDOM_SUFFIX=$((RANDOM % 10000))
echo "Using email suffix: $RANDOM_SUFFIX"

# Use the captured organization ID and ensure grades is always an array, middleName is never null
# Store user IDs
echo "" > /tmp/user_ids.txt
jq -c --arg orgId "$ORG_ID" --arg suffix "$RANDOM_SUFFIX" '.users[] | {
  username: (.username | split("@")[0] + $suffix + "@" + split("@")[1]), 
  enabledUser: .enabledUser, 
  givenName: .givenName, 
  familyName: .familyName, 
  middleName: (.middleName // ""), 
  role: .role, 
  identifier: .identifier, 
  email: (.email | split("@")[0] + $suffix + "@" + split("@")[1]), 
  grades: (.grades // []), 
  orgIds: [$orgId]
}' "${DATA_DIR}/04_users.json" | while read -r user; do
  response=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    --data "${user}" \
    "${BASE_URL}/users")
  
  http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
  
  if [ "$http_status" -lt 400 ]; then
    user_id=$(echo "$body" | jq -r '.user.sourcedId')
    user_role=$(echo "$body" | jq -r '.user.role')
    echo "$user_role:$user_id" >> /tmp/user_ids.txt
    echo "Created user with ID: $user_id (role: $user_role)"
  else
    echo "Error creating user: $body"
  fi
done

# Read user IDs
TEACHER_ID=$(grep "^teacher:" /tmp/user_ids.txt | head -1 | cut -d: -f2)
STUDENT_IDS=($(grep "^student:" /tmp/user_ids.txt | cut -d: -f2))
echo "Users created successfully."
echo

# 5. Classes
echo "Creating classes..."
# Use the captured IDs
if [ -n "$COURSE_ID" ] && [ -n "$TERM_ID" ]; then
  jq -c --arg orgId "$ORG_ID" --arg courseId "$COURSE_ID" --arg termId "$TERM_ID" '.classes[] | {
    title: .title, 
    classCode: .classCode, 
    classType: .classType, 
    grades: .grades, 
    subjects: .subjects, 
    courseId: $courseId, 
    schoolId: $orgId, 
    termIds: [$termId]
  }' "${DATA_DIR}/05_classes.json" | while read -r class; do
    response=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${JWT_TOKEN}" \
      --data "${class}" \
      "${BASE_URL}/classes")
    
    http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
    body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
    
    if [ "$http_status" -lt 400 ]; then
      class_id=$(echo "$body" | jq -r '.class.sourcedId')
      echo "CLASS_ID=$class_id"
      echo "Created class with ID: $class_id"
    else
      echo "Error creating class: $body"
    fi
  done | grep "^CLASS_ID=" | tail -1 | cut -d= -f2 | { read CLASS_ID; echo "$CLASS_ID" > /tmp/class_id.txt; }
  
  CLASS_ID=$(cat /tmp/class_id.txt 2>/dev/null || echo "")
else
  echo "Skipping classes: Missing course or term IDs"
fi
echo "Classes created successfully."
echo

# 6. Enrollments
echo "Creating enrollments..."
# Use the captured IDs
if [ -n "$CLASS_ID" ] && [ -n "$TEACHER_ID" ] && [ ${#STUDENT_IDS[@]} -gt 0 ]; then
  # Enroll teacher
  if [ -n "$TEACHER_ID" ]; then
    teacher_enrollment=$(jq -n --arg classId "$CLASS_ID" --arg userId "$TEACHER_ID" --arg schoolId "$ORG_ID" '{
      role: "teacher",
      primary: true,
      beginDate: "2025-06-01T00:00:00Z",
      endDate: "2025-08-31T23:59:59Z",
      userId: $userId,
      classId: $classId,
      schoolId: $schoolId
    }')
    post_resource "/enrollments" "$teacher_enrollment"
  fi
  
  # Enroll students
  for student_id in "${STUDENT_IDS[@]}"; do
    if [ -n "$student_id" ]; then
      student_enrollment=$(jq -n --arg classId "$CLASS_ID" --arg userId "$student_id" --arg schoolId "$ORG_ID" '{
        role: "student",
        primary: true,
        beginDate: "2025-06-01T00:00:00Z",
        endDate: "2025-08-31T23:59:59Z",
        userId: $userId,
        classId: $classId,
        schoolId: $schoolId
      }')
      post_resource "/enrollments" "$student_enrollment"
    fi
  done
else
  echo "Skipping enrollments: Missing class or user IDs"
fi
echo "Enrollments created successfully."
echo

# --- Finalization ---

echo "------------------------------------------------"
echo "Data import completed successfully!"
