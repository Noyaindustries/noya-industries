import { DashboardUiProvider } from "@/components/dashboard/dashboardUiContext";
import { NoyaDashboard } from "@/components/dashboard/NoyaDashboard";

export default function DashboardPage() {
  return (
    <DashboardUiProvider>
      <NoyaDashboard />
    </DashboardUiProvider>
  );
}
