import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ChevronDown,
  Trash2,
  BarChart2,
  Users,
  Download,
  Search,
  Filter,
  Columns,
  SlidersHorizontal,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCampaigns } from '@/contexts/CampaignContext';
import DateRangePicker from '@/components/common/DateRangePicker';
import CampaignTable from '@/components/campaigns/CampaignTable';
import AppLayout from '@/components/layouts/AppLayout';
import { toast } from 'sonner';
import type { CampaignStatus } from '@/data/mockData';

const STATUS_OPTIONS: Array<{ label: string; value: CampaignStatus | 'All' }> = [
  { label: 'All statuses', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Paused', value: 'Paused' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Archived', value: 'Archived' },
];

const COMPARE_OPTIONS = ['Previous period', 'Custom', 'None'] as const;

type TabId = 'campaigns' | 'adsets' | 'ads';

export default function CampaignsDashboard() {
  const navigate = useNavigate();
  const {
    filters,
    updateFilters,
    campaigns,
    adSets,
    ads,
    selectedCampaignIds,
    selectedAdSetIds,
    deleteCampaigns,
    clearCampaignSelection,
    clearAdSetSelection,
  } = useCampaigns();

  const [activeTab, setActiveTab] = useState<TabId>('campaigns');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedArr = Array.from(selectedCampaignIds);
  const adSetSelectedArr = Array.from(selectedAdSetIds);
  const hasAdSetSelection = adSetSelectedArr.length > 0;
  const hasFilters =
    filters.status !== 'All' || filters.search !== '';
  const filterCount = filters.status !== 'All' ? 1 : 0;

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab === 'adsets') navigate('/adsets');
    else if (tab === 'ads') navigate('/ads');
  };

  const handleDelete = () => {
    deleteCampaigns(selectedArr);
    toast.success(`${selectedArr.length} campaign(s) deleted`);
    setDeleteOpen(false);
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Objective', 'Status', 'Spent', 'Impressions', 'Clicks'];
    const rows = campaigns.map(c => [
      c.id, c.name, c.objective, c.status,
      c.spent.toFixed(2), c.impressions, c.clicks,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported campaigns as CSV');
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Page header (Tabs) */}
        <div className="px-4 pt-1 pb-0 bg-white border-b border-[#e0e0e0] shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b-0 -mb-px">
            {[
              { id: 'campaigns' as TabId, label: 'Campaigns' },
              { id: 'adsets' as TabId, label: 'Ad sets' },
              { id: 'ads' as TabId, label: 'Ads' },
            ].map(tab => {
              const isActive = activeTab === tab.id;

              // Determine dynamic label and badge
              let labelText = tab.label;
              let badge: React.ReactNode = null;

              const isSelected = selectedArr.length > 0;

              if (tab.id === 'campaigns') {
                labelText = 'Campaigns';
                if (isSelected) {
                  badge = (
                    <span className="inline-flex items-center justify-center text-[11px] font-medium bg-[#2d6e4f] text-white px-4 py-[3px] rounded-full border border-[#1b4332] ml-2 select-none">
                      {selectedArr.length} selected
                    </span>
                  );
                } else {
                  badge = (
                    <span className="text-xs text-[#00000099] font-normal ml-2">
                      {campaigns.length} total
                    </span>
                  );
                }
              } else if (tab.id === 'adsets') {
                labelText = isSelected
                  ? `Ad sets for ${selectedArr.length} campaign${selectedArr.length > 1 ? 's' : ''}`
                  : 'Ad sets';
                const filteredAdSetsCount = isSelected
                  ? adSets.filter(a => selectedCampaignIds.has(a.campaignId)).length
                  : adSets.length;
                badge = isSelected ? (
                  <span className="text-xs text-[#00000099] font-normal ml-2">
                    {filteredAdSetsCount} total
                  </span>
                ) : (
                  <span className="text-xs text-[#00000099] font-normal ml-2">
                    {filteredAdSetsCount} total
                  </span>
                );
              } else if (tab.id === 'ads') {
                if (hasAdSetSelection) {
                  labelText = `Ads for ${adSetSelectedArr.length} ad set${adSetSelectedArr.length > 1 ? 's' : ''}`;
                } else if (isSelected) {
                  labelText = `Ads for ${selectedArr.length} campaign${selectedArr.length > 1 ? 's' : ''}`;
                } else {
                  labelText = 'Ads';
                }

                let filteredAdsCount = ads.length;
                if (hasAdSetSelection) {
                  filteredAdsCount = ads.filter(a => selectedAdSetIds.has(a.adSetId)).length;
                } else if (isSelected) {
                  filteredAdsCount = ads.filter(a => selectedCampaignIds.has(a.campaignId)).length;
                }

                badge = (hasAdSetSelection || isSelected) ? (
                  <span className="text-xs text-[#00000099] font-normal ml-2">
                    {filteredAdsCount} total
                  </span>
                ) : (
                  <span className="text-xs text-[#00000099] font-normal ml-2">
                    {filteredAdsCount} total
                  </span>
                );
              }

              // Custom Star-in-folder icon SVG for Adsets & Ads
              if (tab.id === 'adsets' || tab.id === 'ads') {
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      relative flex items-center gap-2 px-8 py-3 text-[15px]
                      transition-colors duration-150 border-b-[3px] -mb-px
                      ${isActive
                        ? 'border-black text-[#000000e0] font-semibold'
                        : 'border-transparent text-[#00000099] hover:text-[#000000e0] font-medium'}
                    `}
                  >
                    <svg className={cn("h-4 w-4 shrink-0", isActive ? "text-[#000000e0]" : "text-[#00000099]")} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-4.75 9.94L13 14.5l-2.25 1.44.68-2.61-2.06-1.78 2.68-.23L13 8.88l1.13 2.44 2.68.23-2.06 1.78.68 2.61z" />
                    </svg>
                    <span>{labelText}</span>
                    {badge}
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    relative flex items-center gap-2 px-8 py-3 text-[15px]
                    transition-colors duration-150 border-b-[3px] -mb-px
                    ${isActive
                      ? 'border-black text-[#000000e0] font-semibold'
                      : 'border-transparent text-[#00000099] hover:text-[#000000e0] font-medium'}
                  `}
                >
                  <Folder className={cn("h-4 w-4 shrink-0", isActive ? "text-[#000000e0]" : "text-[#00000099]")} />
                  <span>{labelText}</span>
                  {badge}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-white border-b border-[#e0e0e0] shrink-0">
          {/* Create */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 text-[13px] font-medium bg-[#0A66C2] hover:bg-[#004b8d] text-white px-4 rounded-full flex items-center gap-1 transition-colors">
                Create
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => navigate('/create')}>
                Campaign
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/adsets')}>
                Ad set
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/ads')}>
                Ad
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Set Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 text-[13px] font-medium bg-[#00000008] text-[#00000099] hover:bg-[#0000000f] px-4 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                disabled={selectedArr.length === 0}
              >
                Set status
                <ChevronDown className="h-3.5 w-3.5 text-[#00000099]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => {
                toast.success(`${selectedArr.length} campaign(s) activated`);
                clearCampaignSelection();
              }}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.success(`${selectedArr.length} campaign(s) paused`);
                clearCampaignSelection();
              }}>
                Paused
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 text-[13px] font-medium bg-white border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/05 px-4 rounded-full flex items-center gap-1 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                disabled={selectedArr.length === 0}
              >
                Bulk actions
                <ChevronDown className="h-3.5 w-3.5 text-[#0A66C2]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => {
                toast.success(`${selectedArr.length} campaign(s) paused`);
                clearCampaignSelection();
              }}>
                Pause selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.success(`${selectedArr.length} campaign(s) resumed`);
                clearCampaignSelection();
              }}>
                Resume selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <button
                className="h-8 w-8 bg-[#00000008] text-[#00000099] hover:bg-[#0000000f] rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none"
                disabled={selectedArr.length === 0}
                aria-label="Delete selected campaigns"
              >
                <Trash2 className="h-4 w-4 text-[#00000099]" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete selected campaigns?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete {selectedArr.length} campaign(s). This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex-1" />

          {/* Performance chart */}
          <button
            className="h-8 text-[13px] font-medium px-4 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/05 transition-colors"
            onClick={() => toast.info('Performance chart coming soon')}
          >
            Performance chart
          </button>

          {/* Demographics */}
          <button
            className="h-8 text-[13px] font-medium px-4 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/05 transition-colors"
            onClick={() => toast.info('Professional demographics coming soon')}
          >
            Professional demographics
          </button>

          {/* Export */}
          <button
            className="h-8 text-[13px] font-medium px-4 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/05 transition-colors"
            onClick={handleExport}
          >
            Export
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-start gap-4 px-4 py-2.5 bg-white border-b border-[#e0e0e0] shrink-0">
          {/* Search */}
          <input
            placeholder="Search by name, ID, or type"
            value={filters.search}
            onChange={e => updateFilters({ search: e.target.value })}
            className="h-8 text-[13px] border border-[#0000004d] hover:border-black focus:border-[#0A66C2] px-3 rounded-[4px] w-[210px] focus:outline-none bg-white transition-colors shrink-0"
            aria-label="Search campaigns"
          />

          {/* Filter options layout */}
          <div className="flex flex-col gap-2 pt-1 flex-1">
            {/* Top row filters */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              {/* Filters dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-xs text-[#000000e0] hover:underline focus:outline-none select-none">
                    <span>Filters{filterCount > 0 ? <span className="font-medium">({filterCount})</span> : ''}</span>
                    <svg className="h-3.5 w-3.5 text-[#00000099] shrink-0 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </div>
                  {STATUS_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => updateFilters({ status: opt.value })}
                      className="flex items-center justify-between"
                    >
                      {opt.label}
                      {filters.status === opt.value && (
                        <span className="text-primary text-xs">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                  {hasFilters && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => updateFilters({ status: 'All', search: '' })}
                        className="text-primary"
                      >
                        Clear all filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Columns */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-xs text-[#000000e0] hover:underline focus:outline-none select-none">
                    <span>Columns: <span className="font-semibold">Performance</span></span>
                    <svg className="h-3.5 w-3.5 text-[#00000099] shrink-0 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Performance</DropdownMenuItem>
                  <DropdownMenuItem>Breakdown</DropdownMenuItem>
                  <DropdownMenuItem>Delivery</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Breakdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-xs text-[#000000e0] hover:underline focus:outline-none select-none">
                    <span>Breakdown: <span className="font-semibold">Conversions</span></span>
                    <svg className="h-3.5 w-3.5 text-[#00000099] shrink-0 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[220px] p-0 py-2 shadow-lg rounded-sm border border-[#0000001f]">
                  {['Conversions', 'On/Off Network', 'Carousel', 'Impression Device Type', 'Placement', 'Event Stage'].map(option => (
                    <DropdownMenuItem 
                      key={option}
                      className={cn(
                        "px-4 py-2.5 text-sm rounded-none focus:bg-[#0000000a] cursor-pointer",
                        option === 'Conversions' ? "font-semibold border-l-[3px] border-black pl-[13px]" : "pl-4"
                      )}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                  <div className="h-px bg-[#0000001f] my-1" />
                  <DropdownMenuItem className="px-4 py-2.5 text-sm rounded-none focus:bg-[#0000000a] cursor-pointer pl-4">
                    Clear
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Date range */}
              <DateRangePicker
                value={filters.dateRange}
                onChange={range => updateFilters({ dateRange: range })}
                label="Time range"
                plain
              />

              {/* Compare */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-xs text-[#000000e0] hover:underline focus:outline-none select-none">
                    <span>Compare: <span className="font-semibold">{filters.compareMode}</span></span>
                    <svg className="h-3.5 w-3.5 text-[#00000099] shrink-0 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {COMPARE_OPTIONS.map(opt => (
                    <DropdownMenuItem
                      key={opt}
                      onClick={() => updateFilters({ compareMode: opt })}
                      className="flex items-center justify-between"
                    >
                      {opt}
                      {filters.compareMode === opt && (
                        <span className="text-primary text-xs ml-4">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bottom row filters */}
            {filters.compareMode !== 'None' && (
              <div className="flex items-center">
                <DateRangePicker
                  value={filters.compareRange}
                  onChange={range => updateFilters({ compareRange: range })}
                  label="Period range"
                  plain
                />
              </div>
            )}
          </div>
        </div>

        {/* Campaign table */}
        <div className="flex-1 bg-[#f8f9fa] overflow-y-auto">
          <CampaignTable />
        </div>
      </div>
    </AppLayout>
  );
}
