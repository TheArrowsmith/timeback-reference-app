import { enrollmentsData, usersData, classesData, organizationsData } from "@/lib/oneroster-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EnrollmentsView() {
  const getUserName = (sourcedId: string) => {
    const user = usersData.users.find(u => u.sourcedId === sourcedId);
    return user ? `${user.givenName} ${user.familyName}` : "Unknown User";
  };

  const getUserRole = (sourcedId: string) => {
    const user = usersData.users.find(u => u.sourcedId === sourcedId);
    return user?.role || "Unknown";
  };

  const getClassName = (sourcedId: string) => {
    const classItem = classesData.classes.find(c => c.sourcedId === sourcedId);
    return classItem?.title || "Unknown Class";
  };

  const getOrgName = (sourcedId: string) => {
    const org = organizationsData.organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  const groupedEnrollments = enrollmentsData.enrollments.reduce((acc, enrollment) => {
    const className = getClassName(enrollment.class.sourcedId);
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(enrollment);
    return acc;
  }, {} as Record<string, typeof enrollmentsData.enrollments>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Enrollments</h2>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedEnrollments).map(([className, enrollments]) => (
          <div key={className} className="space-y-4">
            <h3 className="text-lg font-semibold">{className}</h3>
            <div className="grid gap-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.sourcedId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{getUserName(enrollment.user.sourcedId)}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={enrollment.status === "active" ? "default" : "secondary"}>
                          {enrollment.status}
                        </Badge>
                        <Badge variant="outline">{enrollment.role}</Badge>
                        {enrollment.primary && (
                          <Badge variant="secondary">Primary</Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {getUserRole(enrollment.user.sourcedId)} in {className}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Duration:</span> {new Date(enrollment.beginDate).toLocaleDateString()} - {new Date(enrollment.endDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">School:</span> {getOrgName(enrollment.school.sourcedId)}
                      </div>
                      <div>
                        <span className="font-medium">Source ID:</span> {enrollment.sourcedId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last modified: {new Date(enrollment.dateLastModified).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}