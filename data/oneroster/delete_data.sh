#!/bin/bash

# ==============================================================================
# delete_data.sh
#
# Description:
#   This script deletes all OneRoster data from a TimeBack API instance.
#   It queries existing resources and deletes them in reverse dependency order.
#
# Usage:
#   1. Set the JWT_TOKEN environment variable:
#      export JWT_TOKEN="your_jwt_token_here"
#   2. Run the script from any directory:
#      ./data/oneroster/delete_data.sh
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

# Exit immediately if a command exits with a non-zero status.
set -e
# The return value of a pipeline is the status of the last command to exit with
# a non-zero status.
set -o pipefail

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
    "${BASE_URL}${endpoint}"
}

# Function to DELETE a single resource from the API.
delete_resource() {
  local endpoint="$1"
  local resource_id="$2"
  
  echo "Deleting: ${BASE_URL}${endpoint}/${resource_id}"
  
  response=$(curl -sS -w "\nHTTP_STATUS:%{http_code}" -X DELETE \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    "${BASE_URL}${endpoint}/${resource_id}")
  
  http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d: -f2)
  body=$(echo "$response" | sed -n '1,/HTTP_STATUS:/p' | sed '$d')
  
  echo "HTTP Status: $http_status"
  if [ -n "$body" ]; then
    echo "Response body: $body"
  fi
  
  if [ "$http_status" -eq 200 ] || [ "$http_status" -eq 204 ]; then
    echo "Success: Marked for deletion"
    return 0
  elif [ "$http_status" -eq 404 ]; then
    echo "Already deleted or not found"
    return 0
  else
    echo "Error: HTTP $http_status - deletion may have failed"
    return 1
  fi
}

# --- Main Execution Logic ---

echo "Starting OneRoster data deletion from ${DOMAIN}..."
echo "------------------------------------------------"
echo "NOTE: OneRoster uses soft deletes - resources will be marked as 'tobedeleted'"
echo "      rather than being permanently removed from the database."
echo ""
echo "WARNING: This will mark ALL active OneRoster data for deletion!"
echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
sleep 5

# Delete in reverse order of dependencies

# 6. Enrollments (depends on users, classes, and organizations)
echo
echo "Deleting enrollments..."
enrollments=$(get_resources "/enrollments" 2>/dev/null || echo '{"enrollments":[]}')
# Filter out already soft-deleted items (status = "tobedeleted")
active_count=$(echo "$enrollments" | jq '[.enrollments[] | select(.status != "tobedeleted")] | length')
if [ "$active_count" -gt 0 ]; then
  echo "$enrollments" | jq -r '.enrollments[] | select(.status != "tobedeleted") | .sourcedId' | while read -r id; do
    delete_resource "/enrollments" "$id" || true
  done
  echo "Marked $active_count enrollments for deletion."
else
  echo "No active enrollments found."
fi

# 5. Classes (depends on courses, organizations, and academic sessions)
echo
echo "Deleting classes..."
classes=$(get_resources "/classes" 2>/dev/null || echo '{"classes":[]}')
active_count=$(echo "$classes" | jq '[.classes[] | select(.status != "tobedeleted")] | length')
if [ "$active_count" -gt 0 ]; then
  echo "$classes" | jq -r '.classes[] | select(.status != "tobedeleted") | .sourcedId' | while read -r id; do
    delete_resource "/classes" "$id" || true
  done
  echo "Marked $active_count classes for deletion."
else
  echo "No active classes found."
fi

# 4. Users (depends on organizations)
echo
echo "Deleting users..."
users=$(get_resources "/users" 2>/dev/null || echo '{"users":[]}')
active_count=$(echo "$users" | jq '[.users[] | select(.status != "tobedeleted")] | length')
if [ "$active_count" -gt 0 ]; then
  echo "$users" | jq -r '.users[] | select(.status != "tobedeleted") | .sourcedId' | while read -r id; do
    delete_resource "/users" "$id" || true
  done
  echo "Marked $active_count users for deletion."
else
  echo "No active users found."
fi

# 3. Courses (depends on organizations)
echo
echo "Deleting courses..."
courses=$(get_resources "/courses" 2>/dev/null || echo '{"courses":[]}')
active_count=$(echo "$courses" | jq '[.courses[] | select(.status != "tobedeleted")] | length')
if [ "$active_count" -gt 0 ]; then
  echo "$courses" | jq -r '.courses[] | select(.status != "tobedeleted") | .sourcedId' | while read -r id; do
    delete_resource "/courses" "$id" || true
  done
  echo "Marked $active_count courses for deletion."
else
  echo "No active courses found."
fi

# 2. Academic Sessions (depends on organizations)
echo
echo "Deleting academic sessions..."
sessions=$(get_resources "/academicSessions" 2>/dev/null || echo '{"academicSessions":[]}')
active_count=$(echo "$sessions" | jq '[.academicSessions[] | select(.status != "tobedeleted")] | length')
if [ "$active_count" -gt 0 ]; then
  echo "$sessions" | jq -r '.academicSessions[] | select(.status != "tobedeleted") | .sourcedId' | while read -r id; do
    delete_resource "/academicSessions" "$id" || true
  done
  echo "Marked $active_count academic sessions for deletion."
else
  echo "No active academic sessions found."
fi

# 1. Organizations (no dependencies)
echo
echo "Deleting organizations..."
orgs=$(get_resources "/orgs" 2>/dev/null || echo '{"orgs":[]}')
active_count=$(echo "$orgs" | jq '[.orgs[] | select(.status != "tobedeleted")] | length')
if [ "$active_count" -gt 0 ]; then
  echo "$orgs" | jq -r '.orgs[] | select(.status != "tobedeleted") | .sourcedId' | while read -r id; do
    delete_resource "/orgs" "$id" || true
  done
  echo "Marked $active_count organizations for deletion."
else
  echo "No active organizations found."
fi

# --- Finalization ---

echo
echo "------------------------------------------------"
echo "Data deletion completed!"