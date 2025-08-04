# QTI Assessment Test Viewer

This Next.js application loads and renders QTI assessment tests from the TimeBack API.

## Features

- Loads QTI assessmentTest data from the TimeBack API (localhost:8080)
- Renders test structure with parts and sections
- Displays multiple choice questions with radio buttons
- Displays text entry questions with input fields
- Basic XML parsing and rendering (full TAO Item Runner integration ready)
- Responsive design with Tailwind CSS and ShadCN UI components

## Getting Started

The app is currently READ ONLY. It has a UI for you to pull and view data from TimeBack, but it doesn't provide a way to create or update Timeback data.

If you're running a local copy of TimeBack you'll need to add data

### Step 1: set up the backend and register

1. Clone the Timeback repo (it's a separate, private repository — ask AJ to add you)
1a. **Make sure you have the environment variables set in that project from the google doc that's pinned in the #alpha-school-apps slack channel**

2. Follow the instructions in that repo to set the app up.
2. Create an account and login:

    ```bash
    # run this within the Timeback repo, not the reference app repo.
    bun auth-helper.ts register test@example.com TestPassword123! 'Test User'

    # Check your email for the confirmation code:
    bun auth-helper.ts confirm test@example.com 123456

    # Login as the user you just created:
    bun auth-helper.ts login test@example.com TestPassword123!
    ```

    This creates a user on Superbuilders' AWS Cognito pool.

    If the login command (`bun auth-helper.ts login …`) is successful, it will print an access token and also save it to `.auth-token`. You'll need this later.

3. Follow the instructions in the Timeback repo to start its server, which runs on `localhost:8080` by default.

### Step 2: add sample data to the backend

Back in the reference app repo:

1. Take your auth token from step 1 and save it as an env var `JWT_TOKEN`:

    ```bash
    export JWT_TOKEN=<your-token>
    ```

2. Run these scripts to add sample QTI and OneRoster data:

    ```bash
    data/oneroster/create_data.sh
    data/qti/upload_quiz.sh
    ```

To be clear: this only adds the data to your local copy of Timeback.

### Step 3: view data in the sample app

1. **Install dependencies:**

    ```bash
    bun install
    ```

2. **Run the development server:**

    ```bash
    bun run dev
    ```

3. **Open the application:**
    - Navigate to [http://localhost:3000](http://localhost:3000)
    - Log in using the authentication form
    - Click the links to view assessments (QTI) or OneRoster data

## QTI

The application supports loading and rendering QTI (Question and Test Interoperability) assessments. It connects to the TimeBack API to fetch assessment data, including test hierarchies, item metadata, and XML content. The system parses QTI XML to display multiple choice and text entry questions in a user-friendly format.

## OneRoster

The application includes OneRoster integration for managing educational data. It supports viewing organizations, academic sessions, courses, classes, users, and enrollments through the TimeBack API's OneRoster endpoints.

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **ShadCN UI** - Beautifully designed components
- **@oat-sa/tao-item-runner-qti** - TAO QTI Item Runner (ready for full integration)
