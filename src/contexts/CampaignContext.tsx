import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Campaign, AdSet, Ad, CampaignStatus } from '@/data/mockData';
import { mockCampaigns, mockAdSets, mockAds } from '@/data/mockData';

interface DateRange {
  from: string;
  to: string;
}

interface CampaignFilters {
  search: string;
  status: CampaignStatus | 'All';
  dateRange: DateRange;
  compareRange: DateRange;
  compareMode: 'Previous period' | 'Custom' | 'None';
}

interface CampaignContextValue {
  campaigns: Campaign[];
  adSets: AdSet[];
  ads: Ad[];
  filters: CampaignFilters;
  selectedCampaignIds: Set<string>;
  selectedAdSetIds: Set<string>;
  selectedAdIds: Set<string>;
  sortColumn: string;
  sortDirection: 'asc' | 'desc' | null;
  sidebarCollapsed: boolean;
  // Actions
  updateFilters: (updates: Partial<CampaignFilters>) => void;
  toggleCampaignActive: (id: string) => void;
  toggleCampaignSelection: (id: string) => void;
  selectAllCampaigns: (ids: string[]) => void;
  clearCampaignSelection: () => void;
  toggleAdSetActive: (id: string) => void;
  toggleAdSetSelection: (id: string) => void;
  selectAllAdSets: (ids: string[]) => void;
  clearAdSetSelection: () => void;
  toggleAdActive: (id: string) => void;
  toggleAdSelection: (id: string) => void;
  selectAllAds: (ids: string[]) => void;
  clearAdSelection: () => void;
  deleteCampaigns: (ids: string[]) => void;
  deleteAdSets: (ids: string[]) => void;
  deleteAds: (ids: string[]) => void;
  addCampaign: (campaign: Campaign) => void;
  setSortColumn: (col: string, dir: 'asc' | 'desc' | null) => void;
  toggleSidebar: () => void;
  bulkPause: (ids: string[]) => void;
  bulkResume: (ids: string[]) => void;
}

const defaultDateRange: DateRange = { from: '2026-05-07', to: '2026-06-05' };
const defaultCompareRange: DateRange = { from: '2026-04-07', to: '2026-05-06' };

const defaultFilters: CampaignFilters = {
  search: '',
  status: 'All',
  dateRange: defaultDateRange,
  compareRange: defaultCompareRange,
  compareMode: 'Previous period',
};

const CampaignContext = createContext<CampaignContextValue | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [adSets, setAdSets] = useState<AdSet[]>(mockAdSets);
  const [ads, setAds] = useState<Ad[]>(mockAds);
  const [filters, setFilters] = useState<CampaignFilters>(defaultFilters);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());
  const [selectedAdSetIds, setSelectedAdSetIds] = useState<Set<string>>(new Set());
  const [selectedAdIds, setSelectedAdIds] = useState<Set<string>>(new Set());
  const [sortColumn, setSortCol] = useState<string>('');
  const [sortDirection, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const updateFilters = useCallback((updates: Partial<CampaignFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleCampaignActive = useCallback((id: string) => {
    setCampaigns(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, isActive: !c.isActive, status: !c.isActive ? 'Active' : 'Paused' }
          : c
      )
    );
  }, []);

  const toggleCampaignSelection = useCallback((id: string) => {
    setSelectedCampaignIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllCampaigns = useCallback((ids: string[]) => {
    setSelectedCampaignIds(new Set(ids));
  }, []);

  const clearCampaignSelection = useCallback(() => {
    setSelectedCampaignIds(new Set());
  }, []);

  const toggleAdSetActive = useCallback((id: string) => {
    setAdSets(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, isActive: !a.isActive, status: !a.isActive ? 'Active' : 'Paused' }
          : a
      )
    );
  }, []);

  const toggleAdSetSelection = useCallback((id: string) => {
    setSelectedAdSetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllAdSets = useCallback((ids: string[]) => {
    setSelectedAdSetIds(new Set(ids));
  }, []);

  const clearAdSetSelection = useCallback(() => {
    setSelectedAdSetIds(new Set());
  }, []);

  const toggleAdActive = useCallback((id: string) => {
    setAds(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, isActive: !a.isActive, status: !a.isActive ? 'Active' : 'Paused' }
          : a
      )
    );
  }, []);

  const toggleAdSelection = useCallback((id: string) => {
    setSelectedAdIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllAds = useCallback((ids: string[]) => {
    setSelectedAdIds(new Set(ids));
  }, []);

  const clearAdSelection = useCallback(() => {
    setSelectedAdIds(new Set());
  }, []);

  const deleteCampaigns = useCallback((ids: string[]) => {
    setCampaigns(prev => prev.filter(c => !ids.includes(c.id)));
    setSelectedCampaignIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const deleteAdSets = useCallback((ids: string[]) => {
    setAdSets(prev => prev.filter(a => !ids.includes(a.id)));
    setSelectedAdSetIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const deleteAds = useCallback((ids: string[]) => {
    setAds(prev => prev.filter(a => !ids.includes(a.id)));
    setSelectedAdIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  }, []);

  const addCampaign = useCallback((campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev]);
  }, []);

  const setSortColumn = useCallback((col: string, dir: 'asc' | 'desc' | null) => {
    setSortCol(col);
    setSortDir(dir);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const bulkPause = useCallback((ids: string[]) => {
    setCampaigns(prev =>
      prev.map(c => ids.includes(c.id) ? { ...c, isActive: false, status: 'Paused' } : c)
    );
    setSelectedCampaignIds(new Set());
  }, []);

  const bulkResume = useCallback((ids: string[]) => {
    setCampaigns(prev =>
      prev.map(c => ids.includes(c.id) ? { ...c, isActive: true, status: 'Active' } : c)
    );
    setSelectedCampaignIds(new Set());
  }, []);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        adSets,
        ads,
        filters,
        selectedCampaignIds,
        selectedAdSetIds,
        selectedAdIds,
        sortColumn,
        sortDirection,
        sidebarCollapsed,
        updateFilters,
        toggleCampaignActive,
        toggleCampaignSelection,
        selectAllCampaigns,
        clearCampaignSelection,
        toggleAdSetActive,
        toggleAdSetSelection,
        selectAllAdSets,
        clearAdSetSelection,
        toggleAdActive,
        toggleAdSelection,
        selectAllAds,
        clearAdSelection,
        deleteCampaigns,
        deleteAdSets,
        deleteAds,
        addCampaign,
        setSortColumn,
        toggleSidebar,
        bulkPause,
        bulkResume,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaigns must be used within CampaignProvider');
  return ctx;
}
