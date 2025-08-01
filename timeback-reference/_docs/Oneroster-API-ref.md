### **API Documentation: Retrieving OneRoster v1.2 Data**

This document outlines how to retrieve educational data (organizations, courses, users, classes, and enrollments) from the TimeBack API. All data conforms to the IMS OneRoster v1.2 specification.

#### **Audience**
This documentation is intended for a Large Language Model (LLM) tasked with building a frontend application that displays this data.

### **1. Core Concepts**

#### **Base URL**

All API endpoints described below are relative to the following base URL:

```
http://localhost:8080/ims/oneroster/rostering/v1p2
```

#### **Authentication**

Every API request **must** include an authentication token. The token should be provided in the `Authorization` header as a Bearer token.

*   **Header:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

All examples below assume a valid JWT is available.

#### **Unique Identifier**

In the OneRoster specification, the primary identifier for a resource is the `sourcedId`. When an endpoint path includes an `{id}` (e.g., `/orgs/{id}`), you must use the resource's `sourcedId`.

---

### **2. Fetching Collections of Resources**

These endpoints retrieve the primary lists of data. They are the foundation for building list views in the UI.

#### **A. Fetching All Organizations**
Retrieves a list of all organizations (e.g., schools, districts).

*   **Method:** `GET`
*   **Endpoint:** `/orgs`
*   **Example Request:**
    ```bash
    curl -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/orgs"
    ```
*   **Response Structure:** An object containing an `orgs` key, which holds an array of organization objects.
    ```json
    {
      "orgs": [
        {
          "sourcedId": "org-omega-001",
          "name": "Omega School",
          "type": "school",
          // ... other fields
        }
      ]
    }
    ```

#### **B. Fetching All Users**
Retrieves a list of all people in the system (students, teachers, etc.).

*   **Method:** `GET`
*   **Endpoint:** `/users`
*   **Example Request:**
    ```bash
    curl -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/users"
    ```
*   **Response Structure:** An object containing a `users` key, which holds an array of user objects.

#### **C. Fetching All Courses**
Retrieves a list of all course curricula.

*   **Method:** `GET`
*   **Endpoint:** `/courses`
*   **Response Structure:** An object containing a `courses` key.

#### **D. Fetching All Classes**
Retrieves a list of all classes, which are instances of courses.

*   **Method:** `GET`
*   **Endpoint:** `/classes`
*   **Response Structure:** An object containing a `classes` key.

#### **E. Fetching All Enrollments**
Retrieves all enrollment records, which link users to classes.

*   **Method:** `GET`
*   **Endpoint:** `/enrollments`
*   **Response Structure:** An object containing an `enrollments` key.

#### **F. Fetching All Academic Sessions**
Retrieves all academic sessions (e.g., terms, semesters).

*   **Method:** `GET`
*   **Endpoint:** `/academicSessions`
*   **Response Structure:** An object containing an `academicSessions` key.

---

### **3. Fetching a Single Resource by ID**

To view the details of a specific item, use its `sourcedId` in the URL.

*   **Method:** `GET`
*   **Endpoint Pattern:** `/{resource_type}/{id}`
*   **Example (Get a specific school):**
    ```bash
    curl -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/orgs/org-omega-001"
    ```
*   **Response Structure:** An object containing a key named after the singular resource (e.g., `org`), which holds the single resource object.
    ```json
    {
      "org": {
        "sourcedId": "org-omega-001",
        "name": "Omega School",
        // ... other fields
      }
    }
    ```
This pattern applies to all resource types (`/users/{id}`, `/courses/{id}`, `/classes/{id}`, etc.).

---

### **4. Fetching Relational Data (Nested Endpoints)**

These endpoints are essential for understanding relationships between data, such as finding all the students in a particular class.

#### **A. Get All Classes for a Specific School**
*   **Use Case:** Displaying a list of all classes offered by a school.
*   **Method:** `GET`
*   **Endpoint:** `/schools/{id}/classes` (Note: `/schools` is an alias for `/orgs` where `type='school'`)
*   **Example Request:**
    ```bash
    curl -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/schools/org-omega-001/classes"
    ```
*   **Response Structure:** An object containing a `classes` key with an array of class objects belonging to that school.

#### **B. Get All Students in a Specific Class**
*   **Use Case:** Displaying the roster for a class.
*   **Method:** `GET`
*   **Endpoint:** `/classes/{id}/students`
*   **Example Request:**
    ```bash
    curl -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/classes/class-ai-freshmen-001/students"
    ```
*   **Response Structure:** An object containing a `users` key with an array of student user objects.

#### **C. Get All Teachers for a Specific Class**
*   **Use Case:** Identifying the instructor(s) for a class.
*   **Method:** `GET`
*   **Endpoint:** `/classes/{id}/teachers`
*   **Example Request:**
    ```bash
    curl -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/classes/class-ai-freshmen-001/teachers"
    ```
*   **Response Structure:** An object containing a `users` key with an array of teacher user objects.

#### **D. Get All Classes for a Specific User (Student or Teacher)**
*   **Use Case:** Building a student's or teacher's schedule.
*   **Method:** `GET`
*   **Endpoint:** `/users/{id}/classes`
*   **Example Request (for student "Bill Student"):**
    ```bash
    curl -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/users/user-student-001/classes"
    ```
*   **Response Structure:** An object containing a `classes` key with an array of class objects the user is enrolled in.

---

### **5. Advanced Retrieval: Filtering and Pagination**

For performance and building dynamic UIs, use query parameters to filter and paginate results.

#### **A. Pagination**
Control the number of results returned per request.

*   `limit`: The maximum number of items to return (e.g., `limit=10`).
*   `offset`: The starting point for the items to return (e.g., `offset=20`).
*   **Example (Get the second page of users, with 10 users per page):**
    ```bash
    curl -G -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      --data-urlencode "limit=10" \
      --data-urlencode "offset=10" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/users"
    ```

#### **B. Filtering**
Retrieve a subset of resources based on field values. The filter string must be URL-encoded.

*   `filter`: A string defining the filter predicate (e.g., `filter="role='student'"`).
*   **Note:** The field and the value within the filter string must be enclosed in single quotes.
*   **Example (Get only users with the role 'student'):**
    ```bash
    curl -G -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      --data-urlencode "filter=role='student'" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/users"
    ```
*   **Example (Get only classes with the classType 'scheduled'):**
    ```bash
    curl -G -X GET \
      -H "Authorization: Bearer $JWT_TOKEN" \
      --data-urlencode "filter=classType='scheduled'" \
      "http://localhost:8080/ims/oneroster/rostering/v1p2/classes"
    ```
