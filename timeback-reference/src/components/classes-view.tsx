"use client";

import { useEffect, useState } from "react";
import { fetchClasses, fetchCourses, fetchOrganizations, fetchAcademicSessions, type Class, type Course, type Organization, type AcademicSession } from "@/lib/api/oneroster-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function ClassesView() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [classesData, coursesData, orgsData, sessionsData] = await Promise.all([
          fetchClasses(),
          fetchCourses(),
          fetchOrganizations(),
          fetchAcademicSessions()
        ]);
        setClasses(classesData.classes);
        setCourses(coursesData.courses);
        setOrganizations(orgsData.orgs);
        setAcademicSessions(sessionsData.academicSessions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCourseName = (sourcedId: string) => {
    const course = courses.find(c => c.sourcedId === sourcedId);
    return course?.title || "Unknown Course";
  };

  const getOrgName = (sourcedId: string) => {
    const org = organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  const getTermName = (sourcedId: string) => {
    const term = academicSessions.find(s => s.sourcedId === sourcedId);
    return term?.title || "Unknown Term";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Classes</h2>
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
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Classes</h2>
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
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Classes</h2>
      </div>
      
      <div className="grid gap-4">
        {classes.map((classItem) => (
          <Card key={classItem.sourcedId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{classItem.title}</CardTitle>
                <Badge variant={classItem.status === "active" ? "default" : "secondary"}>
                  {classItem.status}
                </Badge>
              </div>
              <CardDescription>Class Code: {classItem.classCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Course:</span> {getCourseName(classItem.course.sourcedId)}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {classItem.classType}
                </div>
                <div>
                  <span className="font-medium">Subjects:</span> {classItem.subjects.join(", ")}
                </div>
                <div>
                  <span className="font-medium">Grades:</span> {classItem.grades.join(", ")}
                </div>
                <div>
                  <span className="font-medium">School:</span> {getOrgName(classItem.school.sourcedId)}
                </div>
                <div>
                  <span className="font-medium">Terms:</span> {classItem.terms.map(t => getTermName(t.sourcedId)).join(", ")}
                </div>
                <div>
                  <span className="font-medium">Source ID:</span> {classItem.sourcedId}
                </div>
                <div className="text-xs text-muted-foreground">
                  Last modified: {new Date(classItem.dateLastModified).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}