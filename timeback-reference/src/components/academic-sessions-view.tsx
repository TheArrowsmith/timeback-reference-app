import { academicSessionsData } from "@/lib/oneroster-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AcademicSessionsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Academic Sessions</h2>
      </div>
      
      <div className="grid gap-4">
        {academicSessionsData.academicSessions.map((session) => (
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