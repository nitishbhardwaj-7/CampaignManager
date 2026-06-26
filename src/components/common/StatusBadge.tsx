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
    className: 'bg-[#057642]/10 text-[#057642]',
    dot: 'bg-[#057642]',
  },
  Paused: {
    label: 'Paused',
    className: 'bg-[#0000000a] text-[#00000099]',
    dot: 'bg-[#00000060]',
  },
  Draft: {
    label: 'Draft',
    className: 'bg-[#f59e0b]/10 text-[#d97706]',
    dot: 'bg-[#d97706]',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-[#0a66c2]/10 text-[#0a66c2]',
    dot: 'bg-[#0a66c2]',
  },
  Archived: {
    label: 'Archived',
    className: 'bg-[#0000000a] text-[#00000099]',
    dot: 'bg-[#00000060]',
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

      {config.label}
    </span>
  );
}
