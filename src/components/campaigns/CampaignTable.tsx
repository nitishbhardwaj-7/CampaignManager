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
    <div className="flex flex-col">
      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(211,91%,97%)] border-b border-[hsl(211,91%,85%)]">
          <span className="text-sm font-medium text-primary">
            {selectedArr.length} selected
          </span>
          <div className="h-4 w-px bg-border mx-1" />
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleBulkPause}>
            Pause
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleBulkResume}>
            Resume
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleExport}>
            Export
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
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
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={clearCampaignSelection}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="w-full max-w-full overflow-x-auto bg-card">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              {/* Checkbox */}
              <th className="table-header-cell w-10 text-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all campaigns"
                  className="mx-auto"
                />
              </th>

              {/* Campaign name */}
              <th
                className="table-header-cell text-left cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('name')}
              >
                <span className="inline-flex items-center gap-1">
                  Campaign <SortIcon col="name" />
                </span>
              </th>

              {/* Toggle */}
              <th className="table-header-cell text-center w-16">On/Off</th>

              {/* Status */}
              <th
                className="table-header-cell text-left cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('status')}
              >
                <span className="inline-flex items-center gap-1">
                  Status <SortIcon col="status" />
                </span>
              </th>

              {/* Spent */}
              <th
                className="table-header-cell text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('spent')}
              >
                <span className="inline-flex items-center justify-end gap-1">
                  Spent <SortIcon col="spent" />
                </span>
              </th>

              {/* Impressions */}
              <th
                className="table-header-cell text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('impressions')}
              >
                <span className="inline-flex items-center justify-end gap-1">
                  Impressions <SortIcon col="impressions" />
                </span>
              </th>

              {/* Clicks */}
              <th
                className="table-header-cell text-right cursor-pointer hover:text-foreground select-none"
                onClick={() => handleSort('clicks')}
              >
                <span className="inline-flex items-center justify-end gap-1">
                  Clicks <SortIcon col="clicks" />
                </span>
              </th>

              {/* Actions */}
              <th className="table-header-cell w-8" />
            </tr>
          </thead>

          <tbody>
            {sorted.map(campaign => {
              const selected = selectedCampaignIds.has(campaign.id);
              return (
                <tr
                  key={campaign.id}
                  className={cn(
                    'border-b border-border transition-colors duration-150',
                    selected ? 'bg-[hsl(211,91%,97%)]' : 'hover:bg-[hsl(216,17%,98%)]'
                  )}
                >
                  {/* Checkbox */}
                  <td className="table-body-cell text-center w-10">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleCampaignSelection(campaign.id)}
                      aria-label={`Select ${campaign.name}`}
                      className="mx-auto"
                      onClick={e => e.stopPropagation()}
                    />
                  </td>

                  {/* Campaign name */}
                  <td className="table-body-cell max-w-xs">
                    <button
                      className="text-left group"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      <span className="text-sm font-semibold text-primary group-hover:underline block truncate max-w-[240px]">
                        {campaign.name}
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        {campaign.id} · {campaign.objective}
                      </span>
                    </button>
                  </td>

                  {/* Toggle */}
                  <td className="table-body-cell text-center">
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
                  <td className="table-body-cell">
                    <StatusBadge status={campaign.status} />
                  </td>

                  {/* Spent */}
                  <td className="table-body-cell text-right font-medium tabular-nums">
                    {campaign.spent > 0 ? formatCurrency(campaign.spent) : '—'}
                  </td>

                  {/* Impressions */}
                  <td className="table-body-cell text-right tabular-nums text-muted-foreground">
                    {campaign.impressions > 0 ? formatNumber(campaign.impressions) : '—'}
                  </td>

                  {/* Clicks */}
                  <td className="table-body-cell text-right tabular-nums text-muted-foreground">
                    {campaign.clicks > 0 ? formatNumber(campaign.clicks) : '—'}
                  </td>

                  {/* Row action */}
                  <td className="table-body-cell">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                      aria-label="View campaign details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-[hsl(216,17%,98%)]">
        <span className="text-xs text-muted-foreground">
          Showing {sorted.length} of {campaigns.length} campaigns
        </span>
        {someSelected && (
          <span className="text-xs text-primary font-medium">
            {selectedArr.length} selected
          </span>
        )}
      </div>
    </div>
  );
}
