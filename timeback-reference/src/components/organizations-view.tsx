import { organizationsData } from "@/lib/oneroster-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export function OrganizationsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Organizations</h2>
      </div>
      
      <div className="grid gap-4">
        {organizationsData.organizations.map((org) => (
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
                <div>
                  <span className="font-medium">Identifier:</span> {org.identifier}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}