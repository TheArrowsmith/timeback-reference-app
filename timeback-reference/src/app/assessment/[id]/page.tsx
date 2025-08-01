'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loadCompleteAssessmentTest } from '@/lib/api/qti-client';
import { QTIItem } from '@/components/qti/QTIItem';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Item {
  id: string;
  identifier: string;
  title: string;
  interactionType: string;
  sequence: number;
  xmlContent?: string;
}

interface Section {
  id: string;
  identifier: string;
  title: string;
  items: Item[];
}

interface TestPart {
  id: string;
  identifier: string;
  sections: Section[];
}

export default function AssessmentPage() {
  const params = useParams();
  const testId = params.id as string;
  const [testData, setTestData] = useState<{ testParts: TestPart[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTest() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await loadCompleteAssessmentTest(testId);
        setTestData(data);
      } catch (err) {
        console.error('Failed to load assessment:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assessment test');
      } finally {
        setLoading(false);
      }
    }

    loadTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!testData || !testData.testParts || testData.testParts.length === 0) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert>
          <AlertDescription>
            No test data available
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>
      
      <h1 className="text-3xl font-bold mb-8">Assessment Test: {testId}</h1>

      {testData.testParts.map((part, partIndex) => (
        <div key={part.id} className="mb-8">
          {part.sections.map((section, sectionIndex) => (
            <Card key={section.id} className="mb-6">
              <CardHeader>
                <CardTitle>
                  {section.title || `Section ${sectionIndex + 1}`}
                </CardTitle>
                <CardDescription>
                  {section.items.length} question{section.items.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={item.id} className="border-b pb-6 last:border-0 last:pb-0">
                    <QTIItem
                      id={item.id}
                      identifier={item.identifier}
                      title={item.title}
                      xmlContent={item.xmlContent || ''}
                      interactionType={item.interactionType}
                      index={itemIndex}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}