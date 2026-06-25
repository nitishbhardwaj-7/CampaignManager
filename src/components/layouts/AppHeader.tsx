import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  HelpCircle,
  Menu,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/contexts/CampaignContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SidebarContent from './SidebarContent';
import { toast } from 'sonner';

export default function AppHeader() {
  const { toggleSidebar } = useCampaigns();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border flex items-center h-12 px-4 gap-2 shrink-0">
      {/* Mobile hamburger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 text-foreground w-8 h-8"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop hamburger */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden lg:flex shrink-0 text-muted-foreground hover:text-foreground w-8 h-8"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* LinkedIn Branding */}
      <div className="flex items-center gap-2 shrink-0 ml-1">
        {/* LinkedIn "in" SVG Logo */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-[21px] w-[21px] fill-[#0A66C2] shrink-0">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        <span className="flex items-center gap-1.5 text-[15px]">
          <span className="font-semibold text-[#0A66C2]">Ads</span>
          <span className="text-muted-foreground font-light text-sm">|</span>
          <span className="text-[#0A66C2] font-normal tracking-tight">Campaign Manager</span>
        </span>
      </div>

      <div className="flex-1" />

      {/* Right icons */}
      <div className="flex items-center gap-3 shrink-0 mr-1">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground w-8 h-8"
          aria-label="Notifications"
          onClick={() => toast.info('No new notifications')}
        >
          <Bell className="h-5 w-5 text-[#000000e0]" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground w-8 h-8"
          aria-label="Help"
          onClick={() => toast.info('Help center coming soon')}
        >
          <HelpCircle className="h-5 w-5 text-[#000000e0]" />
        </Button>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full overflow-hidden p-0 w-8 h-8 border border-border"
              aria-label="User profile"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">Redington MENA</p>
              <p className="text-xs text-muted-foreground">admin@redington.com</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile settings</DropdownMenuItem>
            <DropdownMenuItem>Switch accounts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
