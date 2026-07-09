import { Layout } from "@/components/custom/layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TopNav } from "@/components/top-nav";
import { UserNav } from "@/components/user-nav";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ChartsGrid } from "@/components/dashboard/charts-grid";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { Download } from "lucide-react";

const topNav = [
  {
    title: "Overview",
    href: "dashboard/overview",
    isActive: true,
  },
];

export default function Dashboard() {
  return (
    <Layout>
<Layout.Body>
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 min-h-[200vh]">
              <StatsGrid />
              <ChartsGrid />
              <MetricsGrid />
            </TabsContent>
          </Tabs>
        </div>
      </Layout.Body>
    </Layout>
  );
}