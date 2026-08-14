import type { ReactNode } from "react";
import Sidebar from "@/components/layout/sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
