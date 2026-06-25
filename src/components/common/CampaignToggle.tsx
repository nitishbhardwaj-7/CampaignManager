import React from 'react';
import { cn } from '@/lib/utils';

interface CampaignToggleProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function CampaignToggle({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: CampaignToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? (checked ? 'Pause campaign' : 'Resume campaign')}
      disabled={disabled}
      onClick={e => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out focus:outline-none',
        checked
          ? 'bg-[#057642]'
          : 'bg-[#00000060]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow',
          'transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  );
}
