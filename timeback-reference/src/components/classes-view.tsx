import { classesData, coursesData, organizationsData, academicSessionsData } from "@/lib/oneroster-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ClassesView() {
  const getCourseName = (sourcedId: string) => {
    const course = coursesData.courses.find(c => c.sourcedId === sourcedId);
    return course?.title || "Unknown Course";
  };

  const getOrgName = (sourcedId: string) => {
    const org = organizationsData.organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  const getTermName = (sourcedId: string) => {
    const term = academicSessionsData.academicSessions.find(s => s.sourcedId === sourcedId);
    return term?.title || "Unknown Term";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Classes</h2>
      </div>
      
      <div className="grid gap-4">
        {classesData.classes.map((classItem) => (
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