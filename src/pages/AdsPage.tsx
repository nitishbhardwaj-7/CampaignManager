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
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type SortKey = 'name' | 'status' | 'spent' | 'impressions' | 'clicks';
type SortDir = 'asc' | 'desc';

export default function AdsPage() {
  const navigate = useNavigate();
  const {
    ads,
    selectedAdIds,
    toggleAdSelection,
    selectAllAds,
    clearAdSelection,
    toggleAdActive,
    deleteAds,
  } = useCampaigns();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [deleteOpen, setDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ads;
    return ads.filter(a =>
      a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    );
  }, [ads, search]);

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

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div className="px-6 pt-5 pb-0 bg-card border-b border-border">
          <h1 className="text-lg font-semibold text-foreground mb-4">Advertise</h1>

          {/* Tabs */}
          <div className="flex items-center gap-0 -mb-px">
            {[
              { label: 'Campaigns', path: '/' },
              { label: 'Ad sets', path: '/adsets' },
              { label: 'Ads', path: '/ads' },
            ].map(tab => {
              const active = location.pathname === tab.path;
              return (
                <button
                  key={tab.label}
                  onClick={() => navigate(tab.path)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 ${
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-card border-b border-border">
          <Button
            className="h-8 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1 px-3"
            onClick={() => toast.info('Create ad')}
          >
            <Plus className="h-3.5 w-3.5" /> Create
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 text-xs gap-1 px-3 border-border" disabled={!someSelected}>
                Bulk actions <ChevronDown className="h-3 w-3" />
              </Button>
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

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 border-border text-muted-foreground hover:text-destructive" disabled={!someSelected}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
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
          <Button variant="outline" className="h-8 text-xs gap-1.5 px-3 border-border" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:block">Export</span>
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2 bg-card border-b border-border">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-8 text-xs pl-8 border-border"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 bg-card">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Image className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">No ads found</p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => toast.info('Create ad')}>
                <Plus className="h-4 w-4 mr-1.5" /> Create ad
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full min-w-[750px] border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="table-header-cell w-10 text-center">
                      <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} className="mx-auto" aria-label="Select all" />
                    </th>
                    <th className="table-header-cell text-left cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                      <span className="inline-flex items-center gap-1">Ad <SortIcon col="name" /></span>
                    </th>
                    <th className="table-header-cell text-center w-16">On/Off</th>
                    <th className="table-header-cell text-left cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>
                      <span className="inline-flex items-center gap-1">Status <SortIcon col="status" /></span>
                    </th>
                    <th className="table-header-cell text-left">Format</th>
                    <th className="table-header-cell text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('spent')}>
                      <span className="inline-flex items-center justify-end gap-1">Spent <SortIcon col="spent" /></span>
                    </th>
                    <th className="table-header-cell text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('impressions')}>
                      <span className="inline-flex items-center justify-end gap-1">Impressions <SortIcon col="impressions" /></span>
                    </th>
                    <th className="table-header-cell text-right cursor-pointer hover:text-foreground" onClick={() => handleSort('clicks')}>
                      <span className="inline-flex items-center justify-end gap-1">Clicks <SortIcon col="clicks" /></span>
                    </th>
                    <th className="table-header-cell w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(ad => {
                    const selected = selectedAdIds.has(ad.id);
                    return (
                      <tr key={ad.id} className={cn('border-b border-border transition-colors duration-150', selected ? 'bg-[hsl(211,91%,97%)]' : 'hover:bg-[hsl(216,17%,98%)]')}>
                        <td className="table-body-cell text-center w-10">
                          <Checkbox checked={selected} onCheckedChange={() => toggleAdSelection(ad.id)} className="mx-auto" onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="table-body-cell max-w-[220px]">
                          <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">{ad.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{ad.id} · {ad.adSetName}</p>
                        </td>
                        <td className="table-body-cell text-center">
                          <CampaignToggle
                            checked={ad.isActive}
                            onChange={() => { toggleAdActive(ad.id); toast.success(ad.isActive ? `"${ad.name}" paused` : `"${ad.name}" resumed`); }}
                          />
                        </td>
                        <td className="table-body-cell"><StatusBadge status={ad.status} /></td>
                        <td className="table-body-cell">
                          <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">{ad.format}</span>
                        </td>
                        <td className="table-body-cell text-right tabular-nums font-medium">{ad.spent > 0 ? formatCurrency(ad.spent) : '—'}</td>
                        <td className="table-body-cell text-right tabular-nums text-muted-foreground">{ad.impressions > 0 ? formatNumber(ad.impressions) : '—'}</td>
                        <td className="table-body-cell text-right tabular-nums text-muted-foreground">{ad.clicks > 0 ? formatNumber(ad.clicks) : '—'}</td>
                        <td className="table-body-cell">
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" aria-label="View ad" onClick={() => toast.info(`View ad: ${ad.name}`)}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center px-4 py-2 border-t border-border bg-[hsl(216,17%,98%)]">
            <span className="text-xs text-muted-foreground">Showing {sorted.length} of {ads.length} ads</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
