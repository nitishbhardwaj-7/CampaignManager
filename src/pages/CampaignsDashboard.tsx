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
} from 'lucide-react';
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
    selectedCampaignIds,
    deleteCampaigns,
    clearCampaignSelection,
  } = useCampaigns();

  const [activeTab, setActiveTab] = useState<TabId>('campaigns');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const selectedArr = Array.from(selectedCampaignIds);
  const hasFilters =
    filters.status !== 'All' || filters.search !== '';

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    clearCampaignSelection();
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
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div className="px-6 pt-5 pb-0 bg-card border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">Advertise</h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 border-b-0 -mb-px">
            {[
              { id: 'campaigns' as TabId, label: 'Campaigns', count: campaigns.length },
              { id: 'adsets' as TabId, label: 'Ad sets', count: null },
              { id: 'ads' as TabId, label: 'Ads', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                  transition-colors duration-150 border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}
                `}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-normal">
                    {tab.count}
                  </span>
                )}
                {tab.id === 'campaigns' && selectedArr.length > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-normal">
                    {selectedArr.length} selected
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-card border-b border-border">
          {/* Create */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1 px-3">
                <Plus className="h-3.5 w-3.5" />
                Create
                <ChevronDown className="h-3 w-3 ml-0.5" />
              </Button>
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

          {/* Bulk actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 text-xs gap-1 px-3 border-border"
                disabled={selectedArr.length === 0}
              >
                Bulk actions
                <ChevronDown className="h-3 w-3" />
              </Button>
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
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                disabled={selectedArr.length === 0}
                aria-label="Delete selected campaigns"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
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

          <div className="w-px h-5 bg-border mx-0.5 shrink-0" />

          {/* Performance chart */}
          <Button variant="outline" className="h-8 text-xs gap-1.5 px-3 border-border" onClick={() => toast.info('Performance chart coming soon')}>
            <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:block">Performance chart</span>
          </Button>

          {/* Demographics */}
          <Button variant="outline" className="h-8 text-xs gap-1.5 px-3 border-border" onClick={() => toast.info('Professional demographics coming soon')}>
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden md:block">Professional demographics</span>
          </Button>

          <div className="flex-1" />

          {/* Export */}
          <Button
            variant="outline"
            className="h-8 text-xs gap-1.5 px-3 border-border"
            onClick={handleExport}
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:block">Export</span>
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-card border-b border-border">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or ID"
              value={filters.search}
              onChange={e => updateFilters({ search: e.target.value })}
              className="h-8 text-xs pl-8 border-border"
              aria-label="Search campaigns"
            />
          </div>

          {/* Filters dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`h-8 text-xs gap-1.5 px-3 border-border ${hasFilters ? 'border-primary text-primary' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {hasFilters && (
                  <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
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
              <Button variant="outline" className="h-8 text-xs gap-1.5 px-3 border-border">
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden sm:block">Performance</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Performance</DropdownMenuItem>
              <DropdownMenuItem>Breakdown</DropdownMenuItem>
              <DropdownMenuItem>Delivery</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1 hidden md:block" />

          {/* Date range */}
          <DateRangePicker
            value={filters.dateRange}
            onChange={range => updateFilters({ dateRange: range })}
          />

          {/* Compare */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 text-xs gap-1.5 px-3 border-border">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="hidden md:block">{filters.compareMode}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
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

          {/* Period range (comparison) */}
          {filters.compareMode !== 'None' && (
            <DateRangePicker
              value={filters.compareRange}
              onChange={range => updateFilters({ compareRange: range })}
              label="Period"
              className="text-muted-foreground"
            />
          )}
        </div>

        {/* Campaign table */}
        <div className="flex-1 bg-card">
          <CampaignTable />
        </div>
      </div>
    </AppLayout>
  );
}
