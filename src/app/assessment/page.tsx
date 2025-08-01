'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, BookOpen, Clock, FileText } from 'lucide-react';
import { fetchAssessmentTests } from '@/lib/api/qti-client';
import { useAuth } from '@/lib/auth/context';

interface AssessmentTest {
  id: string;
  identifier: string;
  title: string;
  testPartCount: number;
  itemCount: number;
  language: string;
  toolName?: string;
  toolVersion?: string;
  duration?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AssessmentListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const loadAssessments = async () => {
      try {
        setLoading(true);
        const response = await fetchAssessmentTests();
        setAssessments(response.tests);
      } catch (err) {
        console.error('Failed to load assessments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessments');
      } finally {
        setLoading(false);
      }
    };

    loadAssessments();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">QTI Assessments</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading assessments...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">QTI Assessments</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-destructive">Error: {error}</p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">QTI Assessments</h1>
                <p className="text-sm text-muted-foreground">Browse and select an assessment</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {assessments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No assessments found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      assessment.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {assessment.status}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{assessment.title}</CardTitle>
                  <CardDescription className="text-xs">
                    ID: {assessment.identifier}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{assessment.itemCount} items</span>
                    <span>{assessment.testPartCount} parts</span>
                  </div>
                  
                  {assessment.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(assessment.duration / 60)} minutes</span>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Language: {assessment.language}
                  </div>

                  <Link href={`/assessment/${assessment.id}`}>
                    <Button className="w-full">
                      View Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
