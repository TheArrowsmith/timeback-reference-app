"use client";

import { useState } from "react";
import { OrganizationsView } from "@/components/organizations-view";
import { AcademicSessionsView } from "@/components/academic-sessions-view";
import { CoursesView } from "@/components/courses-view";
import { ClassesView } from "@/components/classes-view";
import { UsersView } from "@/components/users-view";
import { EnrollmentsView } from "@/components/enrollments-view";
import { Button } from "@/components/ui/button";
import { Building2, Calendar, BookOpen, Users, User, UserPlus } from "lucide-react";

type ViewType = "organizations" | "academicSessions" | "courses" | "classes" | "users" | "enrollments";

export default function OneRosterPage() {
  const [currentView, setCurrentView] = useState<ViewType>("organizations");

  const navigationItems = [
    { id: "organizations" as ViewType, label: "Organizations", icon: Building2 },
    { id: "academicSessions" as ViewType, label: "Academic Sessions", icon: Calendar },
    { id: "courses" as ViewType, label: "Courses", icon: BookOpen },
    { id: "classes" as ViewType, label: "Classes", icon: Users },
    { id: "users" as ViewType, label: "Users", icon: User },
    { id: "enrollments" as ViewType, label: "Enrollments", icon: UserPlus },
  ];

  const renderView = () => {
    switch (currentView) {
      case "organizations":
        return <OrganizationsView />;
      case "academicSessions":
        return <AcademicSessionsView />;
      case "courses":
        return <CoursesView />;
      case "classes":
        return <ClassesView />;
      case "users":
        return <UsersView />;
      case "enrollments":
        return <EnrollmentsView />;
      default:
        return <OrganizationsView />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r bg-muted/10 min-h-screen p-6">
          <h1 className="text-2xl font-bold mb-8">OneRoster Data</h1>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentView(item.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>
        
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}