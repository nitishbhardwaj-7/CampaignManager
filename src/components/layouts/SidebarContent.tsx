import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path?: string;
  external?: boolean;
  hasChildren?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Overview', path: '/overview' },
  { label: 'Plan', hasChildren: true },
  { label: 'Advertise', path: '/' },
  { label: 'Measure', hasChildren: true },
  { label: 'Recommendations', path: '/recommendations' },
  { label: 'Content & assets', hasChildren: true, path: '/assets' },
  { label: 'Billing', path: '/billing' },
  { label: 'Account settings', hasChildren: true, path: '/settings' },
  { label: 'Company page', external: true, path: 'https://linkedin.com' },
];

interface SidebarContentProps {
  onNavigate?: () => void;
  collapsed?: boolean;
}

export default function SidebarContent({ onNavigate, collapsed = false }: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdvertiseActive = () => {
    return (
      ['/', '/adsets', '/ads', '/create'].includes(location.pathname) ||
      location.pathname.startsWith('/campaign/')
    );
  };

  const isActive = (item: NavItem) => {
    if (item.label === 'Advertise') {
      return isAdvertiseActive();
    }
    if (item.label === 'Overview') {
      return location.pathname === '/overview';
    }
    return item.path && location.pathname === item.path;
  };

  const handleNav = (item: NavItem) => {
    if (item.external && item.path) {
      window.open(item.path, '_blank');
      return;
    }
    if (item.label === 'Advertise') {
      navigate('/');
      onNavigate?.();
      return;
    }
    if (item.path) {
      navigate(item.path);
      onNavigate?.();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#e0e0e0] select-none shrink-0">
      {/* Account Info Switcher */}
      {!collapsed && (
        <div className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-[#00000005] cursor-pointer transition-colors duration-150 shrink-0">
          {/* Logo Diamond/Shield */}
          <div className="w-8 h-8 rounded flex items-center justify-center bg-white shrink-0 overflow-hidden">
            <img src="/images/download-removebg-preview.png" alt="Redington logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-bold text-[#000000e0] leading-snug truncate">
              Redington MENA
            </h2>
            <div className="text-[12px] text-[#00000099] flex items-center gap-1 leading-none mt-0.5">
              <span>513550058</span>
              <span className="w-1 h-1 rounded-full bg-[#057642]" />
              <span className="text-[#057642] font-semibold">Active</span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-[#00000099] shrink-0" />
        </div>
      )}

      {/* Collapsed Account Icon */}
      {collapsed && (
        <div className="flex justify-center py-4 shrink-0">
          <div className="w-8 h-8 rounded flex items-center justify-center bg-white overflow-hidden">
            <img src="/images/download-removebg-preview.png" alt="Redington logo" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-2 space-y-0.5" aria-label="Main navigation">
        {navItems.map(item => {
          const active = isActive(item);

          return (
            <button
              key={item.label}
              onClick={() => handleNav(item)}
              className={cn(
                'w-full flex items-center justify-between text-left transition-all duration-150 py-2.5',
                collapsed ? 'justify-center px-2' : 'px-5',
                active
                  ? 'text-[#000000e0] font-semibold border-l-[3px] border-[#0A66C2] bg-transparent'
                  : 'text-[#00000099] font-medium hover:text-[#000000e0] hover:bg-[#00000005]'
              )}
              style={{
                paddingLeft: active && !collapsed ? '17px' : undefined, // offset left border
              }}
              title={collapsed ? item.label : undefined}
            >
              {!collapsed && (
                <>
                  <span className="text-[15px] tracking-tight">{item.label}</span>
                  {item.external && (
                    <ExternalLink className="h-3 w-3 text-[#00000099] shrink-0" />
                  )}
                  {item.hasChildren && !item.external && (
                    <ChevronDown className="h-4 w-4 text-[#00000099] shrink-0" />
                  )}
                </>
              )}
              {collapsed && (
                <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
