'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadCompleteAssessmentTest } from '@/lib/api/qti-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QTIItem } from '@/components/qti/QTIItem';
import { Skeleton } from '@/components/ui/skeleton';

interface TestPart {
  id: string;
  identifier: string;
  sections: Section[];
}

interface Section {
  id: string;
  identifier: string;
  title: string;
  items: Item[];
}

interface Item {
  id: string;
  identifier: string;
  title: string;
  interactionType: string;
  sequence: number;
  xmlContent?: string;
}

export default function AssessmentPage() {
  const params = useParams();
  // Use the actual test ID if no ID provided
  const testId = params.id as string || 'yJz5CMDznRfl';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<{ testParts: TestPart[] } | null>(null);

  useEffect(() => {
    async function loadTest() {
      try {
        setLoading(true);
        const data = await loadCompleteAssessmentTest(testId);
        setTestData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    }

    loadTest();
  }, [testId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Skeleton className="h-10 w-64 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!testData || testData.testParts.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">No assessment data found</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Assessment Test</h1>
      
      {testData.testParts.map((part) => (
        <div key={part.id} className="mb-8">
          {part.sections.map((section) => (
            <Card key={section.id} className="mb-6">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>
                  {section.items.length} question{section.items.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.items.map((item, index) => (
                  <QTIItem
                    key={item.id}
                    id={item.id}
                    identifier={item.identifier}
                    title={item.title}
                    xmlContent={item.xmlContent || ''}
                    interactionType={item.interactionType}
                    index={index}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}