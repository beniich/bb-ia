import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/pages/Dashboard";
import { Integrations } from "@/pages/Integrations";
import { Workflows } from "@/pages/Workflows";
import { Executions } from "@/pages/Executions";
import { Designer } from "@/pages/Designer";
import RepairAssistant from "@/components/repair/RepairAssistant";

const pageConfig: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Overview of your automation platform" },
  "/integrations": { title: "Integrations", subtitle: "Connect your favorite apps" },
  "/workflows": { title: "Workflows", subtitle: "Manage your automation scenarios" },
  "/executions": { title: "Executions", subtitle: "Monitor workflow runs" },
  "/designer": { title: "Designer", subtitle: "Create diagrams and visual designs" },
  "/repair": { title: "Repair Assistant", subtitle: "L'IA qui répare, pas qui répond" },
  "/analytics": { title: "Analytics", subtitle: "Insights and reports" },
  "/team": { title: "Team", subtitle: "Manage team members" },
  "/api": { title: "API", subtitle: "Developer resources" },
  "/settings": { title: "Settings", subtitle: "Configure your workspace" },
  "/help": { title: "Help", subtitle: "Documentation and support" },
};

const Index = () => {
  const [currentPage, setCurrentPage] = useState("/");

  const renderPage = () => {
    switch (currentPage) {
      case "/":
        return <Dashboard />;
      case "/integrations":
        return <Integrations />;
      case "/workflows":
        return <Workflows />;
      case "/executions":
        return <Executions />;
      case "/designer":
        return <Designer />;
      case "/repair":
        return (
          <div className="p-6">
            <RepairAssistant />
          </div>
        );
      default:
        return (
          <div className="p-6 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {pageConfig[currentPage]?.title || "Page"}
              </h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          </div>
        );
    }
  };

  const config = pageConfig[currentPage] || { title: "AI Studio", subtitle: "" };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="ml-64 transition-all duration-300">
        <Header title={config.title} subtitle={config.subtitle} />
        <div className="animate-fade-in">{renderPage()}</div>
      </main>
    </div>
  );
};

export default Index;
