export const organizationsData = {
  "organizations": [
    {
      "sourcedId": "org-omega-001",
      "name": "Omega School",
      "type": "school",
      "identifier": "OMEGA-HS-001"
    }
  ]
};

export const academicSessionsData = {
  "academicSessions": [
    {
      "sourcedId": "term-summer-2025",
      "status": "active", 
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "title": "Summer 2025",
      "startDate": "2025-06-01",
      "endDate": "2025-08-31",
      "type": "term",
      "schoolYear": "2025"
    }
  ]
};

export const coursesData = {
  "courses": [
    {
      "sourcedId": "course-ai-dev-001",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z", 
      "title": "AI Development for Dummies",
      "courseCode": "AIDEV101",
      "grades": ["9"],
      "subjects": ["Computer Science"],
      "org": {
        "href": "/orgs/org-omega-001",
        "sourcedId": "org-omega-001",
        "type": "org"
      }
    }
  ]
};

export const usersData = {
  "users": [
    {
      "sourcedId": "user-teacher-001",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "username": "chad.gptee@omega.edu",
      "enabledUser": true,
      "givenName": "Chad",
      "familyName": "Tee",
      "middleName": "G.P.",
      "role": "teacher",
      "identifier": "T001",
      "email": "chad.gptee@omega.edu",
      "orgs": [
        {
          "href": "/orgs/org-omega-001",
          "sourcedId": "org-omega-001",
          "type": "org"
        }
      ]
    },
    {
      "sourcedId": "user-student-001", 
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "username": "bill.student@omega.edu",
      "enabledUser": true,
      "givenName": "Bill",
      "familyName": "Student",
      "role": "student",
      "identifier": "S001",
      "email": "bill.student@omega.edu",
      "grades": ["9"],
      "orgs": [
        {
          "href": "/orgs/org-omega-001",
          "sourcedId": "org-omega-001",
          "type": "org"
        }
      ]
    },
    {
      "sourcedId": "user-student-002",
      "status": "active", 
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "username": "bob.student@omega.edu",
      "enabledUser": true,
      "givenName": "Bob",
      "familyName": "Student", 
      "role": "student",
      "identifier": "S002",
      "email": "bob.student@omega.edu",
      "grades": ["9"],
      "orgs": [
        {
          "href": "/orgs/org-omega-001",
          "sourcedId": "org-omega-001",
          "type": "org"
        }
      ]
    },
    {
      "sourcedId": "user-student-003",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z", 
      "username": "ben.student@omega.edu",
      "enabledUser": true,
      "givenName": "Ben",
      "familyName": "Student",
      "role": "student", 
      "identifier": "S003",
      "email": "ben.student@omega.edu",
      "grades": ["9"],
      "orgs": [
        {
          "href": "/orgs/org-omega-001",
          "sourcedId": "org-omega-001",
          "type": "org"
        }
      ]
    }
  ]
};

export const classesData = {
  "classes": [
    {
      "sourcedId": "class-ai-freshmen-001",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "title": "AI Freshmen",
      "classCode": "AIDEV101-A",
      "classType": "scheduled",
      "grades": ["9"],
      "subjects": ["Computer Science"],
      "course": {
        "href": "/courses/course-ai-dev-001",
        "sourcedId": "course-ai-dev-001",
        "type": "course"
      },
      "school": {
        "href": "/orgs/org-omega-001",
        "sourcedId": "org-omega-001", 
        "type": "org"
      },
      "terms": [
        {
          "href": "/academicSessions/term-summer-2025",
          "sourcedId": "term-summer-2025",
          "type": "academicSession"
        }
      ]
    }
  ]
};

export const enrollmentsData = {
  "enrollments": [
    {
      "sourcedId": "enrollment-teacher-001",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "role": "teacher",
      "primary": true,
      "beginDate": "2025-06-01",
      "endDate": "2025-08-31",
      "user": {
        "href": "/users/user-teacher-001",
        "sourcedId": "user-teacher-001",
        "type": "user"
      },
      "class": {
        "href": "/classes/class-ai-freshmen-001", 
        "sourcedId": "class-ai-freshmen-001",
        "type": "class"
      },
      "school": {
        "href": "/orgs/org-omega-001",
        "sourcedId": "org-omega-001",
        "type": "org"
      }
    },
    {
      "sourcedId": "enrollment-student-001",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "role": "student",
      "beginDate": "2025-06-01",
      "endDate": "2025-08-31", 
      "user": {
        "href": "/users/user-student-001",
        "sourcedId": "user-student-001",
        "type": "user"
      },
      "class": {
        "href": "/classes/class-ai-freshmen-001",
        "sourcedId": "class-ai-freshmen-001", 
        "type": "class"
      },
      "school": {
        "href": "/orgs/org-omega-001",
        "sourcedId": "org-omega-001",
        "type": "org"
      }
    },
    {
      "sourcedId": "enrollment-student-002",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "role": "student",
      "beginDate": "2025-06-01",
      "endDate": "2025-08-31",
      "user": {
        "href": "/users/user-student-002",
        "sourcedId": "user-student-002",
        "type": "user"
      },
      "class": {
        "href": "/classes/class-ai-freshmen-001",
        "sourcedId": "class-ai-freshmen-001",
        "type": "class"
      },
      "school": {
        "href": "/orgs/org-omega-001",
        "sourcedId": "org-omega-001",
        "type": "org"
      }
    },
    {
      "sourcedId": "enrollment-student-003",
      "status": "active",
      "dateLastModified": "2025-07-31T10:00:00.000Z",
      "role": "student", 
      "beginDate": "2025-06-01",
      "endDate": "2025-08-31",
      "user": {
        "href": "/users/user-student-003",
        "sourcedId": "user-student-003",
        "type": "user"
      },
      "class": {
        "href": "/classes/class-ai-freshmen-001",
        "sourcedId": "class-ai-freshmen-001",
        "type": "class"
      },
      "school": {
        "href": "/orgs/org-omega-001",
        "sourcedId": "org-omega-001",
        "type": "org"
      }
    }
  ]
};