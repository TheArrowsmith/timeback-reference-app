import { coursesData, organizationsData } from "@/lib/oneroster-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CoursesView() {
  const getOrgName = (sourcedId: string) => {
    const org = organizationsData.organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Courses</h2>
      </div>
      
      <div className="grid gap-4">
        {coursesData.courses.map((course) => (
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