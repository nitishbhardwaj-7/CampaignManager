import React from 'react';
import { useCampaigns } from '@/contexts/CampaignContext';
import SidebarContent from './SidebarContent';
import { cn } from '@/lib/utils';

export default function AppSidebar() {
  const { sidebarCollapsed } = useCampaigns();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 transition-all duration-250 ease-in-out',
        sidebarCollapsed ? 'w-14' : 'w-60'
      )}
    >
      <SidebarContent collapsed={sidebarCollapsed} />
    </aside>
  );
}
