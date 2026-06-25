import React from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <AppHeader />
      <div className="flex flex-1 min-h-0 w-full">
        <AppSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
