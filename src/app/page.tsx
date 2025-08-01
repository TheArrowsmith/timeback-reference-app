'use client';

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const { user } = useAuth();
  
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