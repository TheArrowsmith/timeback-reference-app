import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">QTI Assessment Viewer</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the QTI Assessment Test Viewer</CardTitle>
          <CardDescription>
            This application loads and renders QTI assessment tests from the TimeBack API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Click the link below to view a sample assessment test. You can replace the ID in the URL
            with any valid assessment test ID.
          </p>
          
          <Link 
            href="/assessment/yJz5CMDznRfl" 
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))'
            }}
          >
            View Sample Assessment
          </Link>
          
          <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: 'hsl(var(--muted))'}}>
            <p className="text-sm" style={{color: 'hsl(var(--muted-foreground))'}}>
              <strong>Note:</strong> Make sure the API is running at <code>localhost:8080</code> and 
              update the JWT token in <code>src/lib/api/qti-client.ts</code> before testing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}