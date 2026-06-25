import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  HelpCircle,
  ChevronDown,
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

const accounts = [
  { id: '1', name: 'Redington MENA', status: 'active' },
  { id: '2', name: 'Redington Gulf', status: 'active' },
  { id: '3', name: 'Redington India', status: 'paused' },
];

export default function AppHeader() {
  const { toggleSidebar } = useCampaigns();
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border flex items-center h-14 px-4 gap-3 shrink-0">
      {/* Mobile hamburger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="hidden lg:flex shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* LinkedIn Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-foreground">
          Campaign Manager
        </span>
      </div>

      <div className="w-px h-6 bg-border mx-1 hidden md:block shrink-0" />

      {/* Account Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 px-2 py-1.5 h-auto text-sm font-medium hover:bg-secondary"
          >
            <span
              className="w-2 h-2 rounded-full bg-[hsl(var(--status-active))] shrink-0"
              aria-hidden
            />
            <span className="hidden sm:block max-w-[160px] truncate">
              {selectedAccount.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Advertising accounts
          </div>
          <DropdownMenuSeparator />
          {accounts.map(acc => (
            <DropdownMenuItem
              key={acc.id}
              onClick={() => setSelectedAccount(acc)}
              className="flex items-center gap-2"
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  acc.status === 'active'
                    ? 'bg-[hsl(var(--status-active))]'
                    : 'bg-[hsl(var(--status-paused))]'
                }`}
              />
              <span className="flex-1 truncate">{acc.name}</span>
              {selectedAccount.id === acc.id && (
                <span className="text-primary text-xs">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-primary font-medium">
            + Add account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1" />

      {/* Right icons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
          onClick={() => toast.info('No new notifications')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Help"
          onClick={() => toast.info('Help center coming soon')}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full overflow-hidden p-0 w-8 h-8"
              aria-label="User profile"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                RM
              </div>
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
