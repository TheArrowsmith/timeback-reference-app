"use client";

import { useEffect, useState } from "react";
import { fetchOrganizations, type Organization } from "@/lib/api/oneroster-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationsView() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const data = await fetchOrganizations();
        setOrganizations(data.orgs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations');
      } finally {
        setLoading(false);
      }
    }
    loadOrganizations();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Organizations</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
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
          <Building2 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Organizations</h2>
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
        <Building2 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Organizations</h2>
      </div>
      
      <div className="grid gap-4">
        {organizations.map((org) => (
          <Card key={org.sourcedId}>
            <CardHeader>
              <CardTitle>{org.name}</CardTitle>
              <CardDescription>Type: {org.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Source ID:</span> {org.sourcedId}
                </div>
                {org.identifier && (
                  <div>
                    <span className="font-medium">Identifier:</span> {org.identifier}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}