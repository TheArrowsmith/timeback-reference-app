'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users, AlertCircle, CheckCircle2, Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDataStatus } from "@/components/data-status-checker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const { user } = useAuth();
  const dataStatus = useDataStatus();
  
  // Test flag - set to true to always show the data loading message
  const ALWAYS_SHOW_DATA_STATUS = false;
  
  const showDataWarning = ALWAYS_SHOW_DATA_STATUS || (!dataStatus.loading && (!dataStatus.hasOneRosterData || !dataStatus.hasQtiData));
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">TimeBack Reference App</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Data Status Alert - Always shown */}
        <Alert className="mb-6" variant={dataStatus.error ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Welcome! Let's Get Started</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            {/* Data Status - Always shown */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Data Status:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {dataStatus.hasOneRosterData ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    OneRoster Data: {dataStatus.hasOneRosterData ? 'Loaded' : 'Not loaded'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {dataStatus.hasQtiData ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="text-sm">
                    QTI Assessment Data: {dataStatus.hasQtiData ? 'Loaded' : 'Not loaded'}
                  </span>
                </div>
              </div>
            </div>

            {/* Setup instructions - Only shown when data is missing */}
            {showDataWarning && (
              <>
                <p>
                  You're logged in, but you need to load some data to explore the TimeBack Reference App.
                </p>
                
                <div className="mt-3 p-4 bg-muted rounded-md space-y-3">
                  <p className="font-medium">Quick Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      Get a JWT token by running:
                      <div className="bg-background p-2 rounded font-mono text-sm mt-1 ml-5 flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        <code>bun run getlogintoken</code>
                      </div>
                    </li>
                    <li>
                      Load the sample data:
                      <div className="space-y-1 mt-1 ml-5">
                        <div className="bg-background p-2 rounded font-mono text-sm flex items-center gap-2">
                          <Terminal className="h-4 w-4" />
                          <code>data/oneroster/create_data.sh</code>
                        </div>
                        <div className="bg-background p-2 rounded font-mono text-sm flex items-center gap-2">
                          <Terminal className="h-4 w-4" />
                          <code>data/qti/upload_quiz.sh</code>
                        </div>
                      </div>
                    </li>
                    <li>Refresh this page to see your data!</li>
                  </ol>
                </div>
              </>
            )}
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Note: TimeBack backend must be running on port 8080</p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* QTI Assessment Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <CardTitle>QTI Assessments</CardTitle>
              </div>
              <CardDescription>
                Create, manage, and view QTI assessment tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                View and interact with QTI 3.0 assessment items including multiple choice, 
                free text response, and other interaction types.
              </p>
              <div className="flex gap-2">
                <Link href="/assessment">
                  <Button>
                    View Assessments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* OneRoster Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>OneRoster Management</CardTitle>
              </div>
              <CardDescription>
                Manage organizations, users, classes, and enrollments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Full CRUD operations for OneRoster entities including organizations, 
                academic sessions, courses, classes, users, and enrollments.
              </p>
              <div className="flex gap-2">
                <Link href="/oneroster">
                  <Button>
                    Open OneRoster Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Status Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Connected to API at http://localhost:8080</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Authenticated as: {user?.role || 'user'}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}