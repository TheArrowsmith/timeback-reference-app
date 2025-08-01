"use client";

import { useEffect, useState } from "react";
import { fetchUsers, fetchOrganizations, type User as UserType, type Organization } from "@/lib/api/oneroster-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, GraduationCap, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export function UsersView() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, orgsData] = await Promise.all([
          fetchUsers(),
          fetchOrganizations()
        ]);
        setUsers(usersData.users);
        setOrganizations(orgsData.orgs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const teachers = users.filter(user => user.role === "teacher");
  const students = users.filter(user => user.role === "student");

  const getOrgName = (sourcedId: string) => {
    const org = organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  const UserCard = ({ user }: { user: UserType }) => (
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Users</h2>
        </div>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
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
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Users</h2>
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
        <User className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Users</h2>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Users ({users.length})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teachers.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {users.map((user) => (
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