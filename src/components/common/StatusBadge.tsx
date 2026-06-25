import React from 'react';
import type { CampaignStatus } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

const statusConfig: Record<CampaignStatus, { label: string; className: string; dot: string }> = {
  Active: {
    label: 'Active',
    className: 'bg-[hsl(136,74%,90%)] text-[hsl(136,74%,25%)]',
    dot: 'bg-[hsl(var(--status-active))]',
  },
  Paused: {
    label: 'Paused',
    className: 'bg-[hsl(220,9%,92%)] text-[hsl(220,9%,40%)]',
    dot: 'bg-[hsl(var(--status-paused))]',
  },
  Draft: {
    label: 'Draft',
    className: 'bg-[hsl(38,92%,92%)] text-[hsl(38,70%,35%)]',
    dot: 'bg-[hsl(38,92%,50%)]',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-[hsl(211,91%,92%)] text-[hsl(211,91%,35%)]',
    dot: 'bg-primary',
  },
  Archived: {
    label: 'Archived',
    className: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.Paused;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />
      {config.label}
    </span>
  );
}
