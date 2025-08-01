"use client";

import { useEffect, useState } from "react";
import { fetchAcademicSessions, type AcademicSession } from "@/lib/api/oneroster-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function AcademicSessionsView() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await fetchAcademicSessions();
        setSessions(data.academicSessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load academic sessions');
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Academic Sessions</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Academic Sessions</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Academic Sessions</h2>
      </div>
      
      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.sourcedId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{session.title}</CardTitle>
                <Badge variant={session.status === "active" ? "default" : "secondary"}>
                  {session.status}
                </Badge>
              </div>
              <CardDescription>School Year {session.schoolYear}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {session.type}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Source ID:</span> {session.sourcedId}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last modified: {new Date(session.dateLastModified).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}