import { usersData, organizationsData } from "@/lib/oneroster-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, GraduationCap, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UsersView() {
  const teachers = usersData.users.filter(user => user.role === "teacher");
  const students = usersData.users.filter(user => user.role === "student");

  const getOrgName = (sourcedId: string) => {
    const org = organizationsData.organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  const UserCard = ({ user }: { user: any }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user.role === "teacher" ? <UserCheck className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
            <CardTitle>
              {user.givenName} {user.middleName ? user.middleName + " " : ""}{user.familyName}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant={user.enabledUser ? "default" : "secondary"}>
              {user.enabledUser ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">{user.role}</Badge>
          </div>
        </div>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Username:</span> {user.username}
          </div>
          <div>
            <span className="font-medium">Identifier:</span> {user.identifier}
          </div>
          {user.grades && (
            <div>
              <span className="font-medium">Grades:</span> {user.grades.join(", ")}
            </div>
          )}
          <div>
            <span className="font-medium">Organizations:</span> {user.orgs.map((org: any) => getOrgName(org.sourcedId)).join(", ")}
          </div>
          <div>
            <span className="font-medium">Source ID:</span> {user.sourcedId}
          </div>
          <div className="text-xs text-muted-foreground">
            Last modified: {new Date(user.dateLastModified).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Users</h2>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Users ({usersData.users.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {usersData.users.map((user) => (
            <UserCard key={user.sourcedId} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          {teachers.map((user) => (
            <UserCard key={user.sourcedId} user={user} />
          ))}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {students.map((user) => (
            <UserCard key={user.sourcedId} user={user} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}