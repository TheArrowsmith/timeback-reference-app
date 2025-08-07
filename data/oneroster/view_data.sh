#!/bin/bash

# ==============================================================================
# view_data.sh
#
# Description:
#   This script queries and displays all OneRoster data from a TimeBack API 
#   instance in a formatted, readable way.
#
# Usage:
#   1. Set the JWT_TOKEN environment variable:
#      export JWT_TOKEN="your_jwt_token_here"
#   2. Run the script from any directory:
#      ./data/oneroster/view_data.sh
#
# Environment Variables:
#   - JWT_TOKEN (Required): The Bearer token for API authentication.
#   - DOMAIN (Optional): The base URL of the API. Defaults to
#     'http://localhost:8080'.
#
# ==============================================================================

# --- Load environment variables from .env.local ---
# Source .env.local if it exists to get JWT_TOKEN
if [ -f ".env.local" ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# --- Configuration and Setup ---

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

# Function to GET resources from the API.
get_resources() {
  local endpoint="$1"
  
  curl -sS --fail -X GET \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    "${BASE_URL}${endpoint}" 2>/dev/null || echo '{"error": "Failed to fetch"}'
}

# Function to print a section header
print_header() {
  local title="$1"
  echo
  echo "============================================"
  echo " $title"
  echo "============================================"
}

# Function to print organization details
print_orgs() {
  local orgs="$1"
  echo "$orgs" | jq -r '.orgs[] | select(.status == "active") | 
    "ID: \(.sourcedId)\nName: \(.name)\nType: \(.type)\nIdentifier: \(.identifier // "N/A")\nStatus: \(.status)\nLast Modified: \(.dateLastModified)\n"'
}

# Function to print academic session details
print_sessions() {
  local sessions="$1"
  echo "$sessions" | jq -r '.academicSessions[] | select(.status == "active") | 
    "ID: \(.sourcedId)\nTitle: \(.title)\nType: \(.type)\nSchool Year: \(.schoolYear)\nStart: \(.startDate)\nEnd: \(.endDate)\nStatus: \(.status)\nLast Modified: \(.dateLastModified)\n"'
}

# Function to print course details
print_courses() {
  local courses="$1"
  echo "$courses" | jq -r '.courses[] | select(.status == "active") | 
    "ID: \(.sourcedId)\nTitle: \(.title)\nCode: \(.courseCode)\nGrades: \(.grades | join(", "))\nSubjects: \(.subjects | join(", "))\nOrg ID: \(.org.sourcedId)\nStatus: \(.status)\nLast Modified: \(.dateLastModified)\n"'
}

# Function to print user details
print_users() {
  local users="$1"
  echo "$users" | jq -r '.users[] | select(.status == "active") | 
    "ID: \(.sourcedId)\nUsername: \(.username)\nEmail: \(.email)\nName: \(.givenName) \(.middleName // "") \(.familyName)\nRole: \(.role)\nIdentifier: \(.identifier // "N/A")\nGrades: \(.grades | join(", ") // "N/A")\nOrgs: \(.orgs | map(.sourcedId) | join(", "))\nEnabled: \(.enabledUser)\nStatus: \(.status)\nLast Modified: \(.dateLastModified)\n"'
}

# Function to print class details
print_classes() {
  local classes="$1"
  echo "$classes" | jq -r '.classes[] | select(.status == "active") | 
    "ID: \(.sourcedId)\nTitle: \(.title)\nCode: \(.classCode)\nType: \(.classType)\nGrades: \(.grades | join(", "))\nSubjects: \(.subjects | join(", "))\nCourse ID: \(.course.sourcedId)\nSchool ID: \(.school.sourcedId)\nTerm IDs: \(.terms | map(.sourcedId) | join(", "))\nStatus: \(.status)\nLast Modified: \(.dateLastModified)\n"'
}

# Function to print enrollment details
print_enrollments() {
  local enrollments="$1"
  echo "$enrollments" | jq -r '.enrollments[] | select(.status == "active") | 
    "ID: \(.sourcedId)\nUser ID: \(.user.sourcedId)\nClass ID: \(.class.sourcedId)\nSchool ID: \(.school.sourcedId)\nRole: \(.role)\nPrimary: \(.primary)\nBegin: \(.beginDate)\nEnd: \(.endDate)\nStatus: \(.status)\nLast Modified: \(.dateLastModified)\n"'
}

# --- Main Execution Logic ---

echo "OneRoster Data Viewer"
echo "====================="
echo "Domain: ${DOMAIN}"
echo "Time: $(date)"

# 1. Organizations
print_header "ORGANIZATIONS"
orgs=$(get_resources "/orgs")
if echo "$orgs" | jq -e '.orgs' > /dev/null 2>&1; then
  active_count=$(echo "$orgs" | jq '[.orgs[] | select(.status == "active")] | length')
  total_count=$(echo "$orgs" | jq '.orgs | length')
  echo "Active: $active_count | Total: $total_count"
  echo
  print_orgs "$orgs"
else
  echo "Error fetching organizations"
fi

# 2. Academic Sessions
print_header "ACADEMIC SESSIONS"
sessions=$(get_resources "/academicSessions")
if echo "$sessions" | jq -e '.academicSessions' > /dev/null 2>&1; then
  active_count=$(echo "$sessions" | jq '[.academicSessions[] | select(.status == "active")] | length')
  total_count=$(echo "$sessions" | jq '.academicSessions | length')
  echo "Active: $active_count | Total: $total_count"
  echo
  print_sessions "$sessions"
else
  echo "Error fetching academic sessions"
fi

# 3. Courses
print_header "COURSES"
courses=$(get_resources "/courses")
if echo "$courses" | jq -e '.courses' > /dev/null 2>&1; then
  active_count=$(echo "$courses" | jq '[.courses[] | select(.status == "active")] | length')
  total_count=$(echo "$courses" | jq '.courses | length')
  echo "Active: $active_count | Total: $total_count"
  echo
  print_courses "$courses"
else
  echo "Error fetching courses"
fi

# 4. Users
print_header "USERS"
users=$(get_resources "/users")
if echo "$users" | jq -e '.users' > /dev/null 2>&1; then
  active_count=$(echo "$users" | jq '[.users[] | select(.status == "active")] | length')
  total_count=$(echo "$users" | jq '.users | length')
  teacher_count=$(echo "$users" | jq '[.users[] | select(.status == "active" and .role == "teacher")] | length')
  student_count=$(echo "$users" | jq '[.users[] | select(.status == "active" and .role == "student")] | length')
  echo "Active: $active_count | Total: $total_count | Teachers: $teacher_count | Students: $student_count"
  echo
  print_users "$users"
else
  echo "Error fetching users"
fi

# 5. Classes
print_header "CLASSES"
classes=$(get_resources "/classes")
if echo "$classes" | jq -e '.classes' > /dev/null 2>&1; then
  active_count=$(echo "$classes" | jq '[.classes[] | select(.status == "active")] | length')
  total_count=$(echo "$classes" | jq '.classes | length')
  echo "Active: $active_count | Total: $total_count"
  echo
  print_classes "$classes"
else
  echo "Error fetching classes"
fi

# 6. Enrollments
print_header "ENROLLMENTS"
enrollments=$(get_resources "/enrollments")
if echo "$enrollments" | jq -e '.enrollments' > /dev/null 2>&1; then
  active_count=$(echo "$enrollments" | jq '[.enrollments[] | select(.status == "active")] | length')
  total_count=$(echo "$enrollments" | jq '.enrollments | length')
  teacher_enrollments=$(echo "$enrollments" | jq '[.enrollments[] | select(.status == "active" and .role == "teacher")] | length')
  student_enrollments=$(echo "$enrollments" | jq '[.enrollments[] | select(.status == "active" and .role == "student")] | length')
  echo "Active: $active_count | Total: $total_count | Teachers: $teacher_enrollments | Students: $student_enrollments"
  echo
  print_enrollments "$enrollments"
else
  echo "Error fetching enrollments"
fi

# Summary
print_header "SUMMARY"
echo "Data retrieval complete."
echo
echo "To see raw JSON for any resource, use:"
echo "  curl -H \"Authorization: Bearer \$JWT_TOKEN\" ${BASE_URL}/orgs"
echo "  curl -H \"Authorization: Bearer \$JWT_TOKEN\" ${BASE_URL}/academicSessions"
echo "  curl -H \"Authorization: Bearer \$JWT_TOKEN\" ${BASE_URL}/courses"
echo "  curl -H \"Authorization: Bearer \$JWT_TOKEN\" ${BASE_URL}/users"
echo "  curl -H \"Authorization: Bearer \$JWT_TOKEN\" ${BASE_URL}/classes"
echo "  curl -H \"Authorization: Bearer \$JWT_TOKEN\" ${BASE_URL}/enrollments"