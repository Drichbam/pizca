import { Outlet, useLocation } from "react-router-dom";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

export function AppLayout() {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Desktop sidebar */}
      <DesktopSidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
