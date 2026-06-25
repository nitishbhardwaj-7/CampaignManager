import React, { useMemo, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Plus,
  Search,
  Download,
  ChevronRight,
  Image,
  Folder,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
import StatusBadge from '@/components/common/StatusBadge';
import CampaignToggle from '@/components/common/CampaignToggle';
import AppLayout from '@/components/layouts/AppLayout';
import { useCampaigns } from '@/contexts/CampaignContext';
import { formatCurrency, formatNumber } from '@/data/mockData';
import { cn } from '@/lib/utils';
import DateRangePicker from '@/components/common/DateRangePicker';
import type { CampaignStatus } from '@/data/mockData';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type SortKey = 'name' | 'status' | 'spent' | 'impressions' | 'clicks';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS: Array<{ label: string; value: CampaignStatus | 'All' }> = [
  { label: 'All statuses', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Paused', value: 'Paused' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Archived', value: 'Archived' },
];

const COMPARE_OPTIONS = ['Previous period', 'Custom', 'None'] as const;

export default function AdsPage() {
  const navigate = useNavigate();
  const {
    campaigns,
    adSets,
    ads,
    selectedAdIds,
    toggleAdSelection,
    selectAllAds,
    clearAdSelection,
    toggleAdActive,
    deleteAds,
    selectedCampaignIds,
    selectedAdSetIds,
    filters,
    updateFilters,
  } = useCampaigns();

  const campaignSelectedArr = useMemo(() => Array.from(selectedCampaignIds), [selectedCampaignIds]);
  const hasCampaignSelection = campaignSelectedArr.length > 0;

  const adSetSelectedArr = useMemo(() => Array.from(selectedAdSetIds), [selectedAdSetIds]);
  const hasAdSetSelection = adSetSelectedArr.length > 0;

  const [search, setSearch] = useState('');
  const filterCount = (filters.status !== 'All' ? 1 : 0);
  const hasFilters = filters.status !== 'All' || search !== '';
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let res = ads;
    if (hasCampaignSelection) {
      res = res.filter(a => selectedCampaignIds.has(a.campaignId));
    }
    if (hasAdSetSelection) {
      res = res.filter(a => selectedAdSetIds.has(a.adSetId));
    }
    if (q) {
      res = res.filter(a =>
        a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
      );
    }
    if (filters.status !== 'All') {
      res = res.filter(a => a.status === filters.status);
    }
    return res;
  }, [ads, search, filters.status, selectedCampaignIds, hasCampaignSelection, selectedAdSetIds, hasAdSetSelection]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else if (sortKey === 'spent') cmp = a.spent - b.spent;
      else if (sortKey === 'impressions') cmp = a.impressions - b.impressions;
      else if (sortKey === 'clicks') cmp = a.clicks - b.clicks;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const allSelected = sorted.length > 0 && sorted.every(a => selectedAdIds.has(a.id));
  const someSelected = sorted.some(a => selectedAdIds.has(a.id));
  const selectedArr = Array.from(selectedAdIds);

  const handleSelectAll = () => {
    if (allSelected) clearAdSelection();
    else selectAllAds(sorted.map(a => a.id));
  };

  const handleDelete = () => {
    deleteAds(selectedArr);
    toast.success(`${selectedArr.length} ad(s) deleted`);
    setDeleteOpen(false);
  };

  const handleExport = () => {
    const rows = [
      ['ID', 'Name', 'Campaign', 'Ad Set', 'Status', 'Format', 'Spent', 'Impressions', 'Clicks'],
      ...sorted.map(a => [a.id, a.name, a.campaignName, a.adSetName, a.status, a.format, a.spent.toFixed(2), a.impressions, a.clicks]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ads_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Ads exported');
  };

  const selectedAdsList = sorted.filter(a => selectedAdIds.has(a.id));
  const totalSpent = selectedAdsList.reduce((sum, a) => sum + a.spent, 0);
  const totalImpressions = selectedAdsList.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = selectedAdsList.reduce((sum, a) => sum + a.clicks, 0);

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Page header (Tabs) */}
        <div className="px-4 pt-1 pb-0 bg-white border-b border-[#e0e0e0] shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b-0 -mb-px">
            {[
              { id: 'campaigns', label: 'Campaigns', path: '/' },
              { id: 'adsets', label: 'Ad sets', path: '/adsets' },
              { id: 'ads', label: 'Ads', path: '/ads' },
            ].map(tab => {
              const isActive = tab.id === 'ads';

              // Determine dynamic label and badge
              let labelText = tab.label;
              let badge: React.ReactNode = null;

              if (tab.id === 'campaigns') {
                labelText = 'Campaigns';
                if (hasCampaignSelection) {
                  badge = (
                    <span className="inline-flex items-center justify-center text-[11px] font-medium bg-[#2d6e4f] text-white px-4 py-[3px] rounded-full border border-[#1b4332] ml-2 select-none">
                      {campaignSelectedArr.length} selected
                    </span>
                  );
                } else {
                  badge = (
                    <span className="text-xs bg-[#0000000f] text-[#00000099] px-2.5 py-0.5 rounded-full font-normal ml-2">
                      {campaigns.length}
                    </span>
                  );
                }
              } else if (tab.id === 'adsets') {
                labelText = hasCampaignSelection
                  ? `Ad sets for ${campaignSelectedArr.length} campaign${campaignSelectedArr.length > 1 ? 's' : ''}`
                  : 'Ad sets';
                const filteredAdSetsCount = hasCampaignSelection
                  ? adSets.filter(a => selectedCampaignIds.has(a.campaignId)).length
                  : adSets.length;
                badge = hasCampaignSelection ? (
                  <span className="text-xs text-[#00000099] font-normal ml-2">
                    {filteredAdSetsCount} total
                  </span>
                ) : (
                  <span className="text-xs bg-[#0000000f] text-[#00000099] px-2.5 py-0.5 rounded-full font-normal ml-2">
                    {filteredAdSetsCount}
                  </span>
                );
              } else if (tab.id === 'ads') {
                if (hasAdSetSelection) {
                  labelText = `Ads for ${adSetSelectedArr.length} ad set${adSetSelectedArr.length > 1 ? 's' : ''}`;
                } else if (hasCampaignSelection) {
                  labelText = `Ads for ${campaignSelectedArr.length} campaign${campaignSelectedArr.length > 1 ? 's' : ''}`;
                } else {
                  labelText = 'Ads';
                }

                if (selectedArr.length > 0) {
                  badge = (
                    <span className="inline-flex items-center justify-center text-[11px] font-medium bg-[#2d6e4f] text-white px-4 py-[3px] rounded-full border border-[#1b4332] ml-2 select-none">
                      {selectedArr.length} selected
                    </span>
                  );
                } else {
                  let filteredAdsCount = ads.length;
                  if (hasAdSetSelection) {
                    filteredAdsCount = ads.filter(a => selectedAdSetIds.has(a.adSetId)).length;
                  } else if (hasCampaignSelection) {
                    filteredAdsCount = ads.filter(a => selectedCampaignIds.has(a.campaignId)).length;
                  }

                  badge = (hasAdSetSelection || hasCampaignSelection) ? (
                    <span className="text-xs text-[#00000099] font-normal ml-2">
                      {filteredAdsCount} total
                    </span>
                  ) : (
                    <span className="text-xs bg-[#0000000f] text-[#00000099] px-2.5 py-0.5 rounded-full font-normal ml-2">
                      {filteredAdsCount}
                    </span>
                  );
                }
              }

              // Custom Star-in-folder icon SVG for Adsets & Ads
              if (tab.id === 'adsets' || tab.id === 'ads') {
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.path)}
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
                  onClick={() => navigate(tab.path)}
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
                disabled={!someSelected}
              >
                Set status
                <ChevronDown className="h-3.5 w-3.5 text-[#00000099]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => {
                toast.success(`${selectedArr.length} ad(s) activated`);
                clearAdSelection();
              }}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast.success(`${selectedArr.length} ad(s) paused`);
                clearAdSelection();
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
                disabled={!someSelected}
              >
                Bulk actions
                <ChevronDown className="h-3.5 w-3.5 text-[#0A66C2]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => { toast.success(`${selectedArr.length} ad(s) paused`); clearAdSelection(); }}>
                Pause selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { toast.success(`${selectedArr.length} ad(s) resumed`); clearAdSelection(); }}>
                Resume selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
                Delete selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <button
                className="h-8 w-8 bg-[#00000008] text-[#00000099] hover:bg-[#0000000f] rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none"
                disabled={!someSelected}
                aria-label="Delete selected ads"
              >
                <Trash2 className="h-4 w-4 text-[#00000099]" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedArr.length} ad(s)?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-[13px] border border-[#0000004d] hover:border-black focus:border-[#0A66C2] px-3 rounded-[4px] w-[210px] focus:outline-none bg-white transition-colors shrink-0"
            aria-label="Search ads"
          />

          {/* Filter options layout */}
          <div className="flex flex-col gap-2 pt-1 flex-1">
            {/* Top row filters */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {/* Filters dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center text-[13px] text-[#000000e0] hover:underline focus:outline-none select-none">
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
                        onClick={() => {
                          setSearch('');
                          updateFilters({ status: 'All' });
                        }}
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
                  <button className="flex items-center text-[13px] text-[#000000e0] hover:underline focus:outline-none select-none">
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
                  <button className="flex items-center text-[13px] text-[#000000e0] hover:underline focus:outline-none select-none">
                    <span>Breakdown</span>
                    <svg className="h-3.5 w-3.5 text-[#00000099] shrink-0 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>None</DropdownMenuItem>
                  <DropdownMenuItem>Time</DropdownMenuItem>
                  <DropdownMenuItem>Demographics</DropdownMenuItem>
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
                  <button className="flex items-center text-[13px] text-[#000000e0] hover:underline focus:outline-none select-none">
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

        {/* Table */}
        <div className="flex-1 bg-[#f8f9fa] overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white h-full">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Image className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">No ads found</p>
              <button
                className="h-8 text-xs font-bold bg-[#0A66C2] hover:bg-[#004b8d] text-white px-4 rounded transition-colors"
                onClick={() => toast.info('Create ad')}
              >
                Create ad
              </button>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto bg-white">
              <table className="w-full min-w-[750px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e0e0e0]">
                    {/* Checkbox column header - empty */}
                    <th className="w-12 bg-white border-b border-[#e0e0e0]" />
                    <th className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-left cursor-pointer hover:text-black select-none" onClick={() => handleSort('name')}>
                      <span className="inline-flex items-center gap-1">Ad <SortIcon col="name" /></span>
                    </th>
                    <th className="w-20 px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-center">Off/On</th>
                    <th className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-left cursor-pointer hover:text-black select-none" onClick={() => handleSort('status')}>
                      <span className="inline-flex items-center gap-1">Status <SortIcon col="status" /></span>
                    </th>
                    <th className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-left">Format</th>
                    <th className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none" onClick={() => handleSort('spent')}>
                      <span className="inline-flex items-center justify-end gap-1">Spent <SortIcon col="spent" /></span>
                    </th>
                    <th className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none" onClick={() => handleSort('impressions')}>
                      <span className="inline-flex items-center justify-end gap-1">Impressions <SortIcon col="impressions" /></span>
                    </th>
                    <th className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none" onClick={() => handleSort('clicks')}>
                      <span className="inline-flex items-center justify-end gap-1">Clicks <SortIcon col="clicks" /></span>
                    </th>
                    <th className="w-12 bg-white border-b border-[#e0e0e0]" />
                  </tr>
                </thead>
                <tbody>
                  {/* Selected aggregate row */}
                  {selectedArr.length > 0 && (
                    <tr className="border-b border-[#e0e0e0] bg-[#f8f9fa]">
                      <td className="px-4 py-3.5 text-center">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => clearAdSelection()}
                          aria-label="Clear selection"
                          className="mx-auto"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-medium text-[#000000e0]">
                          {selectedArr.length} selected ad{selectedArr.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-[#00000060] font-medium">-</td>
                      <td className="px-4 py-3.5 text-xs text-[#00000060] font-medium">-</td>
                      <td className="px-4 py-3.5 text-xs text-[#00000060] font-medium">-</td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-medium text-[#000000e0] tabular-nums">
                        {formatCurrency(totalSpent)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-medium text-[#000000e0] tabular-nums">
                        {formatNumber(totalImpressions)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-medium text-[#000000e0] tabular-nums">
                        {formatNumber(totalClicks)}
                      </td>
                      <td className="px-4 py-3.5" />
                    </tr>
                  )}

                  {sorted.map(ad => {
                    const selected = selectedAdIds.has(ad.id);
                    return (
                      <tr
                        key={ad.id}
                        className={cn(
                          'border-b border-[#e0e0e0] transition-colors duration-100',
                          selected ? 'bg-[#eef3f8]' : 'bg-white hover:bg-[#00000005]'
                        )}
                      >
                        <td className="px-4 py-3.5 text-center w-12">
                          <Checkbox checked={selected} onCheckedChange={() => toggleAdSelection(ad.id)} className="mx-auto" onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="px-4 py-3.5 max-w-[220px]">
                          <p className="text-[13px] font-medium text-[#0a66c2] truncate max-w-[280px]">{ad.name}</p>
                          <p className="text-[11px] text-[#00000099] truncate mt-0.5">ID: {ad.id} · {ad.adSetName}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center w-20">
                          <CampaignToggle
                            checked={ad.isActive}
                            onChange={() => { toggleAdActive(ad.id); toast.success(ad.isActive ? `"${ad.name}" paused` : `"${ad.name}" resumed`); }}
                          />
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={ad.status} /></td>
                        <td className="px-4 py-3.5">
                          <span className="text-[11px] bg-secondary text-muted-foreground px-2 py-0.5 rounded">{ad.format}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-[13px] text-[#000000e0] tabular-nums">{ad.spent > 0 ? formatCurrency(ad.spent) : '—'}</td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">{ad.impressions > 0 ? formatNumber(ad.impressions) : '—'}</td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">{ad.clicks > 0 ? formatNumber(ad.clicks) : '—'}</td>
                        <td className="px-4 py-3.5 text-center w-12">
                          <button
                            className="h-6 w-6 rounded hover:bg-black/5 flex items-center justify-center text-[#00000099] hover:text-black focus:outline-none"
                            aria-label="View ad"
                            onClick={() => toast.info(`View ad: ${ad.name}`)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e0e0e0] bg-[#f8f9fa] shrink-0 mt-auto">
          <span className="text-xs text-[#00000099]">Showing {sorted.length} of {ads.length} ads</span>
          {someSelected && (
            <span className="text-xs text-[#004182] font-semibold">
              {selectedArr.length} selected
            </span>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
