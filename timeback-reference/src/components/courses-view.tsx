"use client";

import { useEffect, useState } from "react";
import { fetchCourses, fetchOrganizations, type Course, type Organization } from "@/lib/api/oneroster-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function CoursesView() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [coursesData, orgsData] = await Promise.all([
          fetchCourses(),
          fetchOrganizations()
        ]);
        setCourses(coursesData.courses);
        setOrganizations(orgsData.orgs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getOrgName = (sourcedId: string) => {
    const org = organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Courses</h2>
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
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full mt-2" />
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
          <BookOpen className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Courses</h2>
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
        <BookOpen className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Courses</h2>
      </div>
      
      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.sourcedId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{course.title}</CardTitle>
                <Badge variant={course.status === "active" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </div>
              <CardDescription>Course Code: {course.courseCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Subjects:</span> {course.subjects.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Grades:</span> {course.grades.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Organization:</span> {getOrgName(course.org.sourcedId)}
                </div>
                <div>
                  <span className="font-medium">Source ID:</span> {course.sourcedId}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last modified: {new Date(course.dateLastModified).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}