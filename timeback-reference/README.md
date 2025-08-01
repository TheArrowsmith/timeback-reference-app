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

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API access:**
   - Open `src/lib/api/qti-client.ts`
   - Replace `YOUR_JWT_TOKEN_HERE` with your actual JWT token
   - Ensure the API is running at `http://localhost:8080`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Click "View Sample Assessment" or go directly to `/assessment/[YOUR-TEST-ID]`

## Project Structure

```
src/
├── app/
│   ├── assessment/[id]/page.tsx  # Dynamic assessment page
│   └── page.tsx                  # Home page
├── components/
│   ├── qti/
│   │   └── QTIItem.tsx          # QTI item renderer component
│   └── ui/                      # ShadCN UI components
└── lib/
    ├── api/
    │   └── qti-client.ts        # API client functions
    └── utils.ts                 # Utility functions
```

## API Integration

The application follows the three-step process outlined in the QTI API documentation:

1. **Fetch Test Hierarchy** - Gets the complete structure of the test
2. **Fetch Item Details** - Retrieves metadata for each assessment item
3. **Download Item XML** - Fetches the actual XML content for rendering

## Current Implementation

- Basic XML parsing and rendering for multiple choice and text entry questions
- The full TAO Item Runner QTI package is installed and ready for integration
- Questions are displayed in a read-only format (no submission functionality)

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **ShadCN UI** - Beautifully designed components
- **@oat-sa/tao-item-runner-qti** - TAO QTI Item Runner (ready for full integration)

## Next Steps

To fully integrate the TAO Item Runner:
1. Initialize the TAO Item Runner with the XML content
2. Replace the basic rendering with the full TAO rendering engine
3. Add response handling and submission functionality
4. Implement navigation between questions
5. Add timer and progress tracking features