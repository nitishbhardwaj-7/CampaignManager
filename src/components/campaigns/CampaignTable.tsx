import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
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
import { useCampaigns } from '@/contexts/CampaignContext';
import { formatCurrency, formatNumber, type Campaign } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SortKey = 'name' | 'status' | 'spent' | 'impressions' | 'clicks';
type SortDir = 'asc' | 'desc';

export default function CampaignTable() {
  const {
    campaigns,
    filters,
    selectedCampaignIds,
    toggleCampaignSelection,
    selectAllCampaigns,
    clearCampaignSelection,
    toggleCampaignActive,
    deleteCampaigns,
    bulkPause,
    bulkResume,
  } = useCampaigns();

  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Filter campaigns
  const filtered = useMemo(() => {
    let list = [...campaigns];
    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
      );
    }
    if (filters.status !== 'All') {
      list = list.filter(c => c.status === filters.status);
    }
    return list;
  }, [campaigns, filters.search, filters.status]);

  // Sort
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
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const allSelected =
    sorted.length > 0 && sorted.every(c => selectedCampaignIds.has(c.id));
  const someSelected = sorted.some(c => selectedCampaignIds.has(c.id));

  const handleSelectAll = () => {
    if (allSelected) clearCampaignSelection();
    else selectAllCampaigns(sorted.map(c => c.id));
  };

  const selectedArr = Array.from(selectedCampaignIds);
  const selectedCampaignsList = sorted.filter(c => selectedCampaignIds.has(c.id));
  const totalSpent = selectedCampaignsList.reduce((sum, c) => sum + c.spent, 0);
  const totalImpressions = selectedCampaignsList.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = selectedCampaignsList.reduce((sum, c) => sum + c.clicks, 0);

  const handleDelete = () => {
    deleteCampaigns(selectedArr);
    toast.success(`${selectedArr.length} campaign(s) deleted`);
    setDeleteOpen(false);
  };

  const handleBulkPause = () => {
    bulkPause(selectedArr);
    toast.success(`${selectedArr.length} campaign(s) paused`);
  };

  const handleBulkResume = () => {
    bulkResume(selectedArr);
    toast.success(`${selectedArr.length} campaign(s) resumed`);
  };

  // Export CSV
  const handleExport = () => {
    const rows = [
      ['ID', 'Name', 'Objective', 'Status', 'Spent', 'Impressions', 'Clicks', 'CTR', 'CPC'],
      ...sorted.map(c => [
        c.id, c.name, c.objective, c.status,
        c.spent.toFixed(2), c.impressions, c.clicks,
        c.ctr.toFixed(2) + '%', c.cpc.toFixed(2),
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const d = new Date();
    a.download = `campaigns_export_${d.toISOString().slice(0,10).replace(/-/g,'')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Campaign data exported');
  };

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Trash2 className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">No campaigns found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {filters.search
            ? `No results for "${filters.search}". Try a different search term.`
            : 'Create your first campaign to get started.'}
        </p>
        <Button
          onClick={() => navigate('/create')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Create campaign
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#f4f7fa] border-b border-[#d8e2ee] shrink-0">
          <span className="inline-flex items-center justify-center text-[11px] font-medium bg-[#2d6e4f] text-white px-4 py-[3px] rounded-full border border-[#1b4332] select-none">
            {selectedArr.length} selected
          </span>
          <div className="h-4 w-px bg-[#d8e2ee] mx-1" />
          <button 
            className="text-xs font-medium text-[#0A66C2] hover:underline px-2 py-1"
            onClick={handleBulkPause}
          >
            Pause
          </button>
          <button 
            className="text-xs font-medium text-[#0A66C2] hover:underline px-2 py-1"
            onClick={handleBulkResume}
          >
            Resume
          </button>
          <button 
            className="text-xs font-medium text-[#0A66C2] hover:underline px-2 py-1"
            onClick={handleExport}
          >
            Export
          </button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <button
                className="text-xs font-medium text-red-600 hover:underline px-2 py-1"
              >
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {selectedArr.length} campaign(s)?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The selected campaigns and their associated ad sets
                  and ads will be permanently deleted.
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
          <button
            className="text-xs font-medium text-[#0A66C2] hover:underline px-2 py-1"
            onClick={clearCampaignSelection}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="w-full max-w-full overflow-x-auto bg-white">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-[#e0e0e0]">
              {/* Checkbox column header - empty */}
              <th className="w-12 bg-white border-b border-[#e0e0e0]" />

              {/* Campaign name */}
              <th
                className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-left cursor-pointer hover:text-black select-none"
                onClick={() => handleSort('name')}
              >
                <span className="inline-flex items-center gap-1">
                  Campaign <SortIcon col="name" />
                </span>
              </th>

              {/* Toggle */}
              <th className="w-20 px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-center">
                Off/On
              </th>

              {/* Status */}
              <th
                className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-left cursor-pointer hover:text-black select-none"
                onClick={() => handleSort('status')}
              >
                <span className="inline-flex items-center gap-1">
                  Status <SortIcon col="status" />
                </span>
              </th>

              {/* Spent */}
              <th
                className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none"
                onClick={() => handleSort('spent')}
              >
                <span className="inline-flex items-center justify-end gap-1">
                  Spent <SortIcon col="spent" />
                </span>
              </th>

              {/* Impressions */}
              <th
                className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none"
                onClick={() => handleSort('impressions')}
              >
                <span className="inline-flex items-center justify-end gap-1">
                  Impressions <SortIcon col="impressions" />
                </span>
              </th>

              {/* Clicks */}
              <th
                className="px-4 py-3 bg-white text-xs font-medium text-[#000000e0] border-b border-[#e0e0e0] text-right cursor-pointer hover:text-black select-none"
                onClick={() => handleSort('clicks')}
              >
                <span className="inline-flex items-center justify-end gap-1">
                  Clicks <SortIcon col="clicks" />
                </span>
              </th>

              {/* Actions */}
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
                    onCheckedChange={() => clearCampaignSelection()}
                    aria-label="Clear campaign selection"
                    className="mx-auto"
                  />
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-[13px] font-medium text-[#000000e0]">
                    {selectedArr.length} selected campaign{selectedArr.length > 1 ? 's' : ''}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-center text-xs text-[#00000060] font-medium">
                  -
                </td>
                <td className="px-4 py-3.5 text-xs text-[#00000060] font-medium">
                  -
                </td>
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

            {sorted.map(campaign => {
              const selected = selectedCampaignIds.has(campaign.id);
              return (
                <tr
                  key={campaign.id}
                  className={cn(
                    'border-b border-[#e0e0e0] transition-colors duration-100',
                    selected ? 'bg-[#eef3f8]' : 'bg-white hover:bg-[#00000005]'
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3.5 text-center w-12">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                      aria-label={`Select ${campaign.name}`}
                      className="mx-auto"
                      onClick={e => e.stopPropagation()}
                    />
                  </td>

                  {/* Campaign name */}
                  <td className="px-4 py-3.5 max-w-xs">
                    <button
                      className="text-left group focus:outline-none"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      <span className="text-[13px] font-medium text-[#0a66c2] group-hover:underline block truncate max-w-[280px]">
                        {campaign.name}
                      </span>
                      <span className="text-[11px] text-[#00000099] block mt-0.5">
                        {campaign.id} · {campaign.objective}
                      </span>
                    </button>
                  </td>

                  {/* Toggle */}
                  <td className="px-4 py-3.5 text-center w-20">
                    <CampaignToggle
                      checked={campaign.isActive}
                      onChange={() => {
                        toggleCampaignActive(campaign.id);
                        toast.success(
                          campaign.isActive
                            ? `"${campaign.name}" paused`
                            : `"${campaign.name}" resumed`
                        );
                      }}
                      ariaLabel={campaign.isActive ? 'Pause campaign' : 'Resume campaign'}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <StatusBadge status={campaign.status} />
                  </td>

                  {/* Spent */}
                  <td className="px-4 py-3.5 text-right font-medium text-[13px] text-[#000000e0] tabular-nums">
                    {campaign.spent > 0 ? formatCurrency(campaign.spent) : '—'}
                  </td>

                  {/* Impressions */}
                  <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                    {campaign.impressions > 0 ? formatNumber(campaign.impressions) : '—'}
                  </td>

                  {/* Clicks */}
                  <td className="px-4 py-3.5 text-right text-[13px] text-[#00000099] tabular-nums">
                    {campaign.clicks > 0 ? formatNumber(campaign.clicks) : '—'}
                  </td>

                  {/* Row action */}
                  <td className="px-4 py-3.5 text-center w-12">
                    <button
                      className="h-6 w-6 rounded hover:bg-black/5 flex items-center justify-center text-[#00000099] hover:text-black focus:outline-none"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                      aria-label="View campaign details"
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

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#e0e0e0] bg-[#f8f9fa] shrink-0 mt-auto">
        <span className="text-xs text-[#00000099]">
          Showing {sorted.length} of {campaigns.length} campaigns
        </span>
        {someSelected && (
          <span className="text-xs text-[#004182] font-semibold">
            {selectedArr.length} selected
          </span>
        )}
      </div>
    </div>
  );
}
