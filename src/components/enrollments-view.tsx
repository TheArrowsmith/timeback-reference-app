"use client";

import { useEffect, useState } from "react";
import { fetchEnrollments, fetchUsers, fetchClasses, fetchOrganizations, type Enrollment, type User, type Class, type Organization } from "@/lib/api/oneroster-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function EnrollmentsView() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [enrollmentsData, usersData, classesData, orgsData] = await Promise.all([
          fetchEnrollments(),
          fetchUsers(),
          fetchClasses(),
          fetchOrganizations()
        ]);
        setEnrollments(enrollmentsData.enrollments);
        setUsers(usersData.users);
        setClasses(classesData.classes);
        setOrganizations(orgsData.orgs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getUserName = (sourcedId: string) => {
    const user = users.find(u => u.sourcedId === sourcedId);
    return user ? `${user.givenName} ${user.familyName}` : "Unknown User";
  };

  const getUserRole = (sourcedId: string) => {
    const user = users.find(u => u.sourcedId === sourcedId);
    return user?.role || "Unknown";
  };

  const getClassName = (sourcedId: string) => {
    const classItem = classes.find(c => c.sourcedId === sourcedId);
    return classItem?.title || "Unknown Class";
  };

  const getOrgName = (sourcedId: string) => {
    const org = organizations.find(o => o.sourcedId === sourcedId);
    return org?.name || "Unknown Organization";
  };

  const groupedEnrollments = enrollments.reduce((acc, enrollment) => {
    const className = getClassName(enrollment.class.sourcedId);
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(enrollment);
    return acc;
  }, {} as Record<string, typeof enrollments>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Enrollments</h2>
        </div>
        <div className="space-y-6">
          {[1, 2].map((groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
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
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Enrollments</h2>
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