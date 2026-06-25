import React, { useMemo, useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  ChevronRight,
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
import { formatCurrency, formatNumber, formatPercent } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type SortKey = 'name' | 'status' | 'spent' | 'impressions' | 'clicks';
type SortDir = 'asc' | 'desc';

export default function AdSetsPage() {
  const navigate = useNavigate();
  const {
    campaigns,
    adSets,
    selectedAdSetIds,
    toggleAdSetSelection,
    selectAllAdSets,
    clearAdSetSelection,
    toggleAdSetActive,
    deleteAdSets,
    selectedCampaignIds,
  } = useCampaigns();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return adSets;
    return adSets.filter(a =>
      a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );
  }, [adSets, search]);

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

  const allSelected = sorted.length > 0 && sorted.every(a => selectedAdSetIds.has(a.id));
  const someSelected = sorted.some(a => selectedAdSetIds.has(a.id));
  const selectedArr = Array.from(selectedAdSetIds);

  const handleSelectAll = () => {
    if (allSelected) clearAdSetSelection();
    else selectAllAdSets(sorted.map(a => a.id));
  };

  const handleDelete = () => {
    deleteAdSets(selectedArr);
    toast.success(`${selectedArr.length} ad set(s) deleted`);
    setDeleteOpen(false);
  };

  const handleExport = () => {
    const rows = [
      ['ID', 'Name', 'Campaign', 'Status', 'Spent', 'Impressions', 'Clicks'],
      ...sorted.map(a => [a.id, a.name, a.campaignName, a.status, a.spent.toFixed(2), a.impressions, a.clicks]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adsets_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Ad sets exported');
  };

  const selectedAdSetsList = sorted.filter(a => selectedAdSetIds.has(a.id));
  const totalSpent = selectedAdSetsList.reduce((sum, a) => sum + a.spent, 0);
  const totalImpressions = selectedAdSetsList.reduce((sum, a) => sum + a.impressions, 0);
  const totalClicks = selectedAdSetsList.reduce((sum, a) => sum + a.clicks, 0);

  const totalConversions = selectedAdSetsList.reduce((sum, a) => sum + Math.round(a.clicks * 0.08), 0);
  const totalLeads = selectedAdSetsList.reduce((sum, a) => sum + Math.round(Math.round(a.clicks * 0.08) * 0.7), 0);

  const aggregateCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const aggregateCpm = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
  const aggregateCpc = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const aggregateCostPerResult = totalConversions > 0 ? totalSpent / totalConversions : 0;
  const aggregateCostPerConversion = totalConversions > 0 ? totalSpent / totalConversions : 0;
  const aggregateCostPerLead = totalLeads > 0 ? totalSpent / totalLeads : 0;

  const campaignSelectedArr = Array.from(selectedCampaignIds);
  const hasCampaignSelection = campaignSelectedArr.length > 0;

  return (
    <AppLayout>
      <div className="flex flex-col h-full bg-white">
        {/* Page header (Tabs) */}
        <div className="px-4 pt-3 pb-0 bg-white border-b border-[#e0e0e0] shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b-0 -mb-px">
            {[
              { id: 'campaigns', label: 'Campaigns', path: '/' },
              { id: 'adsets', label: 'Ad sets', path: '/adsets' },
              { id: 'ads', label: 'Ads', path: '/ads' },
            ].map(tab => {
              const isActive = tab.id === 'adsets';

              // Determine dynamic label and badge
              let labelText = tab.label;
              let badge: React.ReactNode = null;

              if (tab.id === 'campaigns') {
                labelText = 'Campaigns';
                if (hasCampaignSelection) {
                  badge = (
                    <span className="text-xs bg-[#057642] text-white px-2.5 py-0.5 rounded-full font-semibold ml-2">
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
                if (selectedArr.length > 0) {
                  badge = (
                    <span className="text-xs bg-[#057642] text-white px-2.5 py-0.5 rounded-full font-semibold ml-2">
                      {selectedArr.length} selected
                    </span>
                  );
                } else {
                  const filteredAdSetsCount = hasCampaignSelection
                    ? adSets.filter(a => selectedCampaignIds.has(a.campaignId)).length
                    : adSets.length;
                  badge = (
                    <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-normal ml-2", hasCampaignSelection ? "text-[#00000099]" : "bg-[#0000000f] text-[#00000099]")}>
                      {hasCampaignSelection ? `${filteredAdSetsCount} total` : filteredAdSetsCount}
                    </span>
                  );
                }
              } else if (tab.id === 'ads') {
                labelText = hasCampaignSelection
                  ? `Ads for ${campaignSelectedArr.length} campaign${campaignSelectedArr.length > 1 ? 's' : ''}`
                  : 'Ads';
              }

              // Custom Star-in-folder icon SVG for Adsets & Ads
              if (tab.id === 'adsets' || tab.id === 'ads') {
                return (
                  <button
                    key={tab.id}
                    onClick={() => navigate(tab.path)}
                    className={`
                      relative flex items-center gap-2 px-4 py-3 text-[14px]
                      transition-colors duration-150 border-b-[3px] -mb-px
                      ${isActive
                        ? 'border-black text-[#000000e0] font-bold'
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
                    relative flex items-center gap-2 px-4 py-3 text-[14px]
                    transition-colors duration-150 border-b-[3px] -mb-px
                    ${isActive
                      ? 'border-black text-[#000000e0] font-bold'
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
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-2.5 bg-white border-b border-[#e0e0e0] shrink-0">
          {/* Create */}
          <button
            className="h-8 text-xs font-bold bg-[#0A66C2] hover:bg-[#004b8d] text-white px-4 rounded flex items-center gap-1.5 transition-colors"
            onClick={() => toast.info('Create ad set')}
          >
            Create
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {/* Bulk actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="h-8 text-xs font-bold bg-white border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/05 px-4 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                disabled={!someSelected}
              >
                Bulk actions
                <ChevronDown className="h-3.5 w-3.5 text-[#0A66C2]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => { toast.success(`${selectedArr.length} ad set(s) paused`); clearAdSetSelection(); }}>
                Pause selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { toast.success(`${selectedArr.length} ad set(s) resumed`); clearAdSetSelection(); }}>
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
                className="h-8 w-8 bg-white border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/05 rounded flex items-center justify-center transition-colors disabled:opacity-50 disabled:pointer-events-none"
                disabled={!someSelected}
                aria-label="Delete selected ad sets"
              >
                <Trash2 className="h-4 w-4 text-[#0A66C2]" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedArr.length} ad set(s)?</AlertDialogTitle>
                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex-1" />

          {/* Export */}
          <button
            className="h-8 text-xs font-semibold px-4 py-1.5 rounded-full border border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2]/05 transition-colors"
            onClick={handleExport}
          >
            Export
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-[#f8f9fa] border-b border-[#e0e0e0] shrink-0">
          {/* Search */}
          <input
            placeholder="Search by name or ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-[13px] border border-[#b2b2b2] hover:border-black focus:border-[#0A66C2] px-3 py-1.5 rounded w-[180px] focus:outline-none transition-colors"
            aria-label="Search ad sets"
          />
        </div>

        {/* Table */}
        <div className="flex-1 bg-[#f8f9fa] overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white h-full">
              <p className="text-muted-foreground text-sm mb-4">No ad sets found</p>
              <button
                className="h-8 text-xs font-bold bg-[#0A66C2] hover:bg-[#004b8d] text-white px-4 rounded transition-colors"
                onClick={() => toast.info('Create ad set')}
              >
                Create ad set
              </button>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto bg-white">
              <table className="w-full min-w-[1900px] border-collapse">
                <thead>
                  <tr className="border-b border-[#e0e0e0]">
                    {/* Checkbox column header - empty */}
                    <th className="w-12 bg-white border-b border-[#e0e0e0]" />
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-left cursor-pointer hover:text-black select-none min-w-[240px] whitespace-nowrap" onClick={() => handleSort('name')}>
                      <span className="inline-flex items-center gap-1">Ad set <SortIcon col="name" /></span>
                    </th>
                    <th className="w-20 px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-center whitespace-nowrap">Off/On</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-left cursor-pointer hover:text-black select-none whitespace-nowrap" onClick={() => handleSort('status')}>
                      <span className="inline-flex items-center gap-1">Status <SortIcon col="status" /></span>
                    </th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none whitespace-nowrap" onClick={() => handleSort('spent')}>
                      <span className="inline-flex items-center justify-end gap-1">Spent <SortIcon col="spent" /></span>
                    </th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Cost per result</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none whitespace-nowrap" onClick={() => handleSort('impressions')}>
                      <span className="inline-flex items-center justify-end gap-1">Impressions <SortIcon col="impressions" /></span>
                    </th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none whitespace-nowrap" onClick={() => handleSort('clicks')}>
                      <span className="inline-flex items-center justify-end gap-1">Clicks <SortIcon col="clicks" /></span>
                    </th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Average CTR</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Average CPM</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Average CPC</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Conversions</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Cost per conversion</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Leads</th>
                    <th className="px-4 py-3 bg-white text-xs font-bold text-[#000000e0] border-b border-[#e0e0e0] text-right whitespace-nowrap">Cost per lead</th>
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
                          onCheckedChange={() => clearAdSetSelection()}
                          aria-label="Clear selection"
                          className="mx-auto"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[13px] font-bold text-[#000000e0]">
                          {selectedArr.length} selected ad set{selectedArr.length > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-[#00000060] font-medium">-</td>
                      <td className="px-4 py-3.5 text-xs text-[#00000060] font-medium">-</td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {totalSpent > 0 ? formatCurrency(totalSpent) : (totalSpent === 0 ? '$0.00' : '-')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {aggregateCostPerResult > 0 ? formatCurrency(aggregateCostPerResult) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {totalImpressions > 0 ? formatNumber(totalImpressions) : (totalImpressions === 0 ? '0' : '-')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {totalClicks > 0 ? formatNumber(totalClicks) : (totalClicks === 0 ? '0' : '-')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {aggregateCtr > 0 ? formatPercent(aggregateCtr) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {aggregateCpm > 0 ? formatCurrency(aggregateCpm) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {aggregateCpc > 0 ? formatCurrency(aggregateCpc) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {totalConversions > 0 ? formatNumber(totalConversions) : (totalConversions === 0 ? '0' : '-')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {aggregateCostPerConversion > 0 ? formatCurrency(aggregateCostPerConversion) : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {totalLeads > 0 ? formatNumber(totalLeads) : (totalLeads === 0 ? '0' : '-')}
                      </td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-[#000000e0] tabular-nums">
                        {aggregateCostPerLead > 0 ? formatCurrency(aggregateCostPerLead) : '-'}
                      </td>
                      <td className="px-4 py-3.5" />
                    </tr>
                  )}

                  {sorted.map(adSet => {
                    const selected = selectedAdSetIds.has(adSet.id);
                    const conversions = Math.round(adSet.clicks * 0.08);
                    const leads = Math.round(conversions * 0.7);

                    const ctr = adSet.impressions > 0 ? (adSet.clicks / adSet.impressions) * 100 : 0;
                    const cpm = adSet.impressions > 0 ? (adSet.spent / adSet.impressions) * 1000 : 0;
                    const cpc = adSet.clicks > 0 ? adSet.spent / adSet.clicks : 0;
                    const costPerResult = conversions > 0 ? adSet.spent / conversions : 0;
                    const costPerConversion = conversions > 0 ? adSet.spent / conversions : 0;
                    const costPerLead = leads > 0 ? adSet.spent / leads : 0;

                    return (
                      <tr
                        key={adSet.id}
                        className={cn(
                          'border-b border-[#e0e0e0] transition-colors duration-100',
                          selected ? 'bg-[#eef3f8]' : 'bg-white hover:bg-[#00000005]'
                        )}
                      >
                        <td className="px-4 py-3.5 text-center w-12">
                          <Checkbox checked={selected} onCheckedChange={() => toggleAdSetSelection(adSet.id)} className="mx-auto" onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="text-[13px] font-bold text-[#0a66c2] truncate max-w-[280px]">{adSet.name}</p>
                          <p className="text-[11px] text-[#00000099] mt-0.5">{adSet.id} · {adSet.campaignName}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center w-20">
                          <CampaignToggle
                            checked={adSet.isActive}
                            onChange={() => { toggleAdSetActive(adSet.id); toast.success(adSet.isActive ? `"${adSet.name}" paused` : `"${adSet.name}" resumed`); }}
                          />
                        </td>
                        <td className="px-4 py-3.5"><StatusBadge status={adSet.status} /></td>
                        <td className="px-4 py-3.5 text-right font-medium text-[13px] text-[#000000e0] tabular-nums">
                          {adSet.spent > 0 ? formatCurrency(adSet.spent) : (adSet.spent === 0 ? '$0.00' : '-')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {costPerResult > 0 ? formatCurrency(costPerResult) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {adSet.impressions > 0 ? formatNumber(adSet.impressions) : (adSet.impressions === 0 ? '0' : '-')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {adSet.clicks > 0 ? formatNumber(adSet.clicks) : (adSet.clicks === 0 ? '0' : '-')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {ctr > 0 ? formatPercent(ctr) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {cpm > 0 ? formatCurrency(cpm) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {cpc > 0 ? formatCurrency(cpc) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {conversions > 0 ? formatNumber(conversions) : (conversions === 0 ? '0' : '-')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {costPerConversion > 0 ? formatCurrency(costPerConversion) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {leads > 0 ? formatNumber(leads) : (leads === 0 ? '0' : '-')}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                          {costPerLead > 0 ? formatCurrency(costPerLead) : '-'}
                        </td>
                        <td className="px-4 py-3.5 text-center w-12">
                          <button
                            className="h-6 w-6 rounded hover:bg-black/5 flex items-center justify-center text-[#00000099] hover:text-black focus:outline-none"
                            aria-label="View ad set"
                            onClick={() => toast.info(`View ad set: ${adSet.name}`)}
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
          <span className="text-xs text-[#00000099]">Showing {sorted.length} of {adSets.length} ad sets</span>
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
