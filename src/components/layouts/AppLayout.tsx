import React from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import { useCampaigns } from '@/contexts/CampaignContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed } = useCampaigns();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main content column */}
      <div
        className="flex flex-col flex-1 min-w-0 overflow-x-hidden transition-all duration-250 ease-in-out"
      >
        <AppHeader />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
