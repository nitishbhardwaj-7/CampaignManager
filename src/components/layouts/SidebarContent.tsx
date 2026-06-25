import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Megaphone,
  BarChart2,
  Lightbulb,
  Image,
  CreditCard,
  Settings,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  external?: boolean;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { label: 'Overview', icon: LayoutDashboard, path: '/' },
  {
    label: 'Plan',
    icon: Target,
    children: [
      { label: 'Audience insights', icon: Target },
      { label: 'Audience templates', icon: Target },
      { label: 'Conversion tracking', icon: Target },
    ],
  },
  {
    label: 'Advertise',
    icon: Megaphone,
    path: '/',
    children: [
      { label: 'Campaigns', icon: Megaphone, path: '/' },
      { label: 'Ad sets', icon: Megaphone, path: '/adsets' },
      { label: 'Ads', icon: Megaphone, path: '/ads' },
    ],
  },
  {
    label: 'Measure',
    icon: BarChart2,
    children: [
      { label: 'Reporting', icon: BarChart2 },
      { label: 'Conversion tracking', icon: BarChart2 },
    ],
  },
  { label: 'Recommendations', icon: Lightbulb, path: '/recommendations' },
  { label: 'Content & assets', icon: Image, path: '/assets' },
  { label: 'Billing', icon: CreditCard, path: '/billing' },
  { label: 'Account settings', icon: Settings, path: '/settings' },
  {
    label: 'Company page',
    icon: ExternalLink,
    external: true,
    path: 'https://linkedin.com',
  },
];

interface SidebarContentProps {
  onNavigate?: () => void;
  collapsed?: boolean;
}

export default function SidebarContent({ onNavigate, collapsed = false }: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string[]>(['Advertise']);

  const toggleExpand = (label: string) => {
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => path && location.pathname === path;

  const handleNav = (item: NavItem) => {
    if (item.external && item.path) {
      window.open(item.path, '_blank');
      return;
    }
    if (item.children) {
      toggleExpand(item.label);
      return;
    }
    if (item.path) {
      navigate(item.path);
      onNavigate?.();
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border overflow-y-auto">
      {/* Logo area on mobile */}
      <div className="h-14 flex items-center px-4 border-b border-sidebar-border shrink-0 lg:hidden">
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground">Campaign Manager</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          const isExpanded = expanded.includes(item.label);
          const hasChildren = !!item.children;

          return (
            <div key={item.label}>
              <button
                onClick={() => handleNav(item)}
                className={cn(
                  'sidebar-nav-item w-full text-left',
                  active && 'sidebar-nav-item-active',
                  collapsed && 'justify-center px-2'
                )}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.external && (
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                    {hasChildren && !item.external && (
                      isExpanded
                        ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                  </>
                )}
              </button>

              {/* Sub-items */}
              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border pl-3">
                  {item.children!.map(child => {
                    const childActive = isActive(child.path);
                    return (
                      <button
                        key={child.label}
                        onClick={() => {
                          if (child.path) {
                            navigate(child.path);
                            onNavigate?.();
                          }
                        }}
                        className={cn(
                          'w-full text-left text-sm py-1.5 px-2 rounded transition-colors duration-150',
                          childActive
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent'
                        )}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom account info */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border shrink-0">
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Redington MENA</p>
            <p>Account #4892761</p>
          </div>
        </div>
      )}
    </div>
  );
}
