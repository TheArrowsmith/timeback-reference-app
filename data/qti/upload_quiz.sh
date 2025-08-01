#!/bin/sh
set -euo pipefail # Exit on error, unset variable, or pipe failure

# --- Configuration ---
# Use DOMAIN env var if set, otherwise default to localhost:8080
API_URL="${DOMAIN:-http://localhost:8080}"

# --- Check for JWT_TOKEN ---
if [ -z "${JWT_TOKEN:-}" ]; then
  echo "Error: JWT_TOKEN environment variable is not set." >&2
  echo "Please set it with your access token: export JWT_TOKEN='your_token_here'" >&2
  exit 1
fi

# --- Determine script's own directory to reliably find XML files ---
# This makes the script work no matter where you call it from.
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
Q1_XML_PATH="$SCRIPT_DIR/q1_multiple_choice.xml"
Q2_XML_PATH="$SCRIPT_DIR/q2_free_text.xml"

# --- Check for required files ---
if ! [ -f "$Q1_XML_PATH" ]; then
    echo "Error: Cannot find required file: $Q1_XML_PATH" >&2
    exit 1
fi
if ! [ -f "$Q2_XML_PATH" ]; then
    echo "Error: Cannot find required file: $Q2_XML_PATH" >&2
    exit 1
fi

echo "✅ JWT Token found. Using API URL: $API_URL"
echo "Starting to create Gauntlet AI Quiz structure..."
echo "---"

# --- Helper function for making API calls and handling errors ---
api_call() {
    local method="$1"
    local path="$2"
    local payload="$3"
    
    local response
    response=$(curl -s -X "$method" "$API_URL$path" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d "$payload")

    # Check for API error
    if echo "$response" | jq -e '.error' > /dev/null; then
        echo "Error: API call failed for $method $path" >&2
        echo "$response" | jq . >&2
        exit 1
    fi
    
    echo "$response"
}

# --- Step 1: Create Assessment Item 1 (Multiple Choice) ---
echo "1/6: Creating Assessment Item 'q1_multiple_choice'..."
Q1_XML_ESCAPED=$(jq -sR . < "$Q1_XML_PATH")
ITEM1_PAYLOAD=$(cat <<EOF
{
  "identifier": "q1_multiple_choice",
  "title": "Gauntlet AI Location",
  "interactionType": "choice",
  "adaptive": false,
  "timeDependent": false,
  "xmlContent": ${Q1_XML_ESCAPED}
}
EOF
)
ITEM1_RESPONSE=$(api_call "POST" "/ims/qti/v3p0/assessment-items" "$ITEM1_PAYLOAD")
ITEM1_ID=$(echo "$ITEM1_RESPONSE" | jq -r '.item.id')
echo "  -> Created Item with ID: $ITEM1_ID"

# --- Step 2: Create Assessment Item 2 (Free Text) ---
echo "2/6: Creating Assessment Item 'q2_free_text'..."
Q2_XML_ESCAPED=$(jq -sR . < "$Q2_XML_PATH")
ITEM2_PAYLOAD=$(cat <<EOF
{
  "identifier": "q2_free_text",
  "title": "Austen's Last Name",
  "interactionType": "textEntry",
  "adaptive": false,
  "timeDependent": false,
  "xmlContent": ${Q2_XML_ESCAPED}
}
EOF
)
ITEM2_RESPONSE=$(api_call "POST" "/ims/qti/v3p0/assessment-items" "$ITEM2_PAYLOAD")
ITEM2_ID=$(echo "$ITEM2_RESPONSE" | jq -r '.item.id')
echo "  -> Created Item with ID: $ITEM2_ID"

# --- Step 3: Create the Assessment Test ---
echo "3/6: Creating Assessment Test 'gauntlet_ai_quiz'..."
TEST_PAYLOAD='{
  "identifier": "gauntlet_ai_quiz",
  "title": "Gauntlet AI Quiz"
}'
TEST_RESPONSE=$(api_call "POST" "/ims/qti/v3p0/assessment-tests" "$TEST_PAYLOAD")
TEST_ID=$(echo "$TEST_RESPONSE" | jq -r '.test.id')
echo "  -> Created Test with ID: $TEST_ID"

# --- Step 4: Create the Test Part ---
echo "4/6: Creating Test Part 'testPart1'..."
PART_PAYLOAD=$(cat <<EOF
{
  "assessmentTestId": "$TEST_ID",
  "identifier": "testPart1",
  "navigationMode": "linear",
  "submissionMode": "individual"
}
EOF
)
PART_RESPONSE=$(api_call "POST" "/ims/qti/v3p0/parts" "$PART_PAYLOAD")
PART_ID=$(echo "$PART_RESPONSE" | jq -r '.part.id')
echo "  -> Created Part with ID: $PART_ID"

# --- Step 5: Create the Assessment Section ---
echo "5/6: Creating Assessment Section 'section1'..."
SECTION_PAYLOAD=$(cat <<EOF
{
  "testPartId": "$PART_ID",
  "identifier": "section1",
  "title": "Quiz Questions",
  "visible": true
}
EOF
)
SECTION_RESPONSE=$(api_call "POST" "/ims/qti/v3p0/sections" "$SECTION_PAYLOAD")
SECTION_ID=$(echo "$SECTION_RESPONSE" | jq -r '.section.id')
echo "  -> Created Section with ID: $SECTION_ID"

# --- Step 6: Link Items to the Section ---
echo "6/6: Linking Items to Section..."
LINK_PAYLOAD=$(cat <<EOF
{
  "items": [
    { "assessmentItemId": "$ITEM1_ID", "sequence": 0 },
    { "assessmentItemId": "$ITEM2_ID", "sequence": 1 }
  ]
}
EOF
)
api_call "POST" "/ims/qti/v3p0/sections/$SECTION_ID/items" "$LINK_PAYLOAD" > /dev/null

echo ""
echo "🎉 Successfully created the complete Gauntlet AI Quiz structure."
echo "   Test ID: $TEST_ID"
