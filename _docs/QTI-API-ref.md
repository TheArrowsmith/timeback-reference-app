## Documentation: Retrieving a Complete QTI Quiz from the TimeBack API

### Overview

This document outlines the step-by-step process for a frontend application to retrieve all the necessary data to render a complete QTI assessment test, including its structure (parts, sections) and the content of all its questions (assessment items).

The API stores the test structure and the question content separately. The structure is stored relationally in the database for fast querying, while the detailed XML for each question is stored in S3. The retrieval process involves fetching the structure first, then using the information from that structure to fetch the content for each question.

### Prerequisite

To begin this process, your application **must have the unique UUID** of the `assessmentTest` you wish to retrieve. This is the `id` field (e.g., `"a1b2c3d4-e5f6-7890-1234-567890abcdef"`) returned by the API when the test was first created, not the human-readable `identifier` (e.g., `"gauntlet_ai_quiz"`).

### Step-by-Step Retrieval Flow

The process involves three main steps:

1.  **Fetch the Test Hierarchy:** Get the complete nested structure of the test, including all its parts, sections, and item references.
2.  **Fetch Individual Item Details:** For each item reference from the hierarchy, get its full metadata, which includes the crucial URL to its XML content.
3.  **Download Item XML Content:** Use the provided URL to download the raw XML for each question.

---

#### **Step 1: Fetch the Test Hierarchy**

Make a `GET` request to the `/test-parts` nested endpoint for the specific test. This single call provides the entire skeleton of your quiz.

*   **Endpoint:** `GET /ims/qti/v3p0/assessment-tests/{testId}/test-parts`
*   **Authentication:** Requires JWT Bearer Token.
*   **Description:** This is the most important endpoint for this workflow. It resolves all the relationships between the test, its parts, its sections, and its items in the database and returns them in a single, structured JSON response.

**Example Request:**
```bash
curl -X GET "http://localhost:8080/ims/qti/v3p0/assessment-tests/a1b2c3d4-e5f6-7890-1234-567890abcdef/test-parts" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Example JSON Response:**
```json
{
  "testParts": [
    {
      "id": "part-uuid-...",
      "identifier": "testPart1",
      "sections": [
        {
          "id": "section-uuid-...",
          "identifier": "section1",
          "title": "Quiz Questions",
          "items": [
            {
              "id": "item1-uuid-...", // <-- Use this ID for Step 2
              "identifier": "q1_multiple_choice",
              "title": "Gauntlet AI Location",
              "interactionType": "choice",
              "sequence": 0
            },
            {
              "id": "item2-uuid-...", // <-- Use this ID for Step 2
              "identifier": "q2_free_text",
              "title": "Austen's Last Name",
              "interactionType": "textEntry",
              "sequence": 1
            }
          ]
        }
      ]
    }
  ]
}
```

From this response, you now have the UUID (`id`) for every question in the quiz, in the correct order.

---

#### **Step 2: Fetch Individual Item Details & XML URL**

Iterate through the `items` array from the Step 1 response. For each item, make a `GET` request to its specific endpoint to retrieve its metadata.

*   **Endpoint:** `GET /ims/qti/v3p0/assessment-items/{itemId}`
*   **Authentication:** Requires JWT Bearer Token.
*   **Description:** This endpoint retrieves the metadata for a single assessment item, including the pre-signed S3 URL where its XML content is stored.

**Example Request (for the first item):**
```bash
curl -X GET "http://localhost:8080/ims/qti/v3p0/assessment-items/item1-uuid-..." \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Example JSON Response:**
```json
{
  "item": {
    "id": "item1-uuid-...",
    "identifier": "q1_multiple_choice",
    "title": "Gauntlet AI Location",
    "xmlUrl": "https://your-s3-bucket.s3.amazonaws.com/...", // <-- This is the URL you need
    "xmlHash": "sha256-hash-of-the-xml-content",
    // ... other metadata
  }
}
```
**Note:** It is recommended to perform these requests in parallel (e.g., using `Promise.all`) for better frontend performance.

---

#### **Step 3: Download Item XML Content**

For each item, take the `xmlUrl` you received in Step 2 and make a final `GET` request to that URL.

*   **Endpoint:** The `xmlUrl` value from the Step 2 response.
*   **Authentication:** **No `Authorization` header is needed.** The URL is pre-signed and contains temporary access credentials in its query parameters.
*   **Description:** This request downloads the raw XML content for the question directly from S3.

**Example Request:**
```bash
# The URL is the full value from the 'xmlUrl' field
curl -X GET "https://your-s3-bucket.s3.amazonaws.com/..."
```

**Example Response (Raw XML):**
```xml
<!-- Question 1: Multiple Choice Question -->
<assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p2" ...>
    ...
    <itemBody>
        <div>
            <p>What city is Gauntlet AI based in?</p>
            <choiceInteraction ...>
                <simpleChoice identifier="choice_austin">Austin, Texas</simpleChoice>
                <simpleChoice identifier="choice_paris">Paris, France</simpleChoice>
            </choiceInteraction>
        </div>
    </itemBody>
    ...
</assessmentItem>
```

---

### Final Assembled Data Structure for Frontend

After completing all the steps, the frontend should assemble the data into a single, comprehensive object that can be used to render the entire quiz. The final structure should look like this:

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "identifier": "gauntlet_ai_quiz",
  "title": "Gauntlet AI Quiz",
  "testParts": [
    {
      "id": "part-uuid-...",
      "identifier": "testPart1",
      "sections": [
        {
          "id": "section-uuid-...",
          "identifier": "section1",
          "title": "Quiz Questions",
          "items": [
            {
              "id": "item1-uuid-...",
              "identifier": "q1_multiple_choice",
              "title": "Gauntlet AI Location",
              "interactionType": "choice",
              "sequence": 0,
              "xmlContent": "<?xml version='1.0'...><assessmentItem>...</assessmentItem>"
            },
            {
              "id": "item2-uuid-...",
              "identifier": "q2_free_text",
              "title": "Austen's Last Name",
              "interactionType": "textEntry",
              "sequence": 1,
              "xmlContent": "<?xml version='1.0'...><assessmentItem>...</assessmentItem>"
            }
          ]
        }
      ]
    }
  ]
}
```
