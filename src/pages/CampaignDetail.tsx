import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Play,
  Pause,
  BarChart2,
  Target,
  DollarSign,
  Users,
  MousePointer,
  Eye,
  TrendingUp,
  Calendar,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layouts/AppLayout';
import StatusBadge from '@/components/common/StatusBadge';
import { useCampaigns } from '@/contexts/CampaignContext';
import { formatCurrency, formatNumber, formatPercent } from '@/data/mockData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  highlight?: boolean;
}

function MetricCard({ label, value, icon: Icon, sub, highlight }: MetricCardProps) {
  return (
    <Card className={cn('h-full', highlight && 'border-primary/30')}>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {label}
          </span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, adSets, toggleCampaignActive } = useCampaigns();
  const [activeTab, setActiveTab] = useState<'overview' | 'adsets' | 'settings'>('overview');

  const campaign = useMemo(
    () => campaigns.find(c => c.id === id),
    [campaigns, id]
  );

  const campaignAdSets = useMemo(
    () => adSets.filter(a => a.campaignId === id),
    [adSets, id]
  );

  if (!campaign) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground mb-4">Campaign not found</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleToggle = () => {
    toggleCampaignActive(campaign.id);
    toast.success(campaign.isActive ? `"${campaign.name}" paused` : `"${campaign.name}" resumed`);
  };

  const budgetUsed = campaign.budget > 0 ? (campaign.spent / campaign.budget) * 100 : 0;

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full">
        {/* Breadcrumb & header */}
        <div className="px-6 pt-5 pb-4 bg-card border-b border-border">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary transition-colors"
            >
              Campaigns
            </button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {campaign.name}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground self-start"
              aria-label="Back to campaigns"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-foreground text-balance">
                  {campaign.name}
                </h1>
                <StatusBadge status={campaign.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                ID: {campaign.id} · {campaign.objective}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-border"
                onClick={() => toast.info('Edit campaign')}
              >
                <Edit className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                className={cn(
                  'h-8 text-xs gap-1.5',
                  campaign.isActive
                    ? 'bg-[hsl(220,9%,75%)] text-foreground hover:bg-[hsl(220,9%,68%)]'
                    : 'bg-[hsl(var(--status-active))] text-white hover:bg-[hsl(136,74%,25%)]'
                )}
                onClick={handleToggle}
              >
                {campaign.isActive
                  ? <><Pause className="h-3.5 w-3.5" /> Pause</>
                  : <><Play className="h-3.5 w-3.5" /> Resume</>
                }
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-0 mt-4 -mb-px">
            {[
              { id: 'overview' as const, label: 'Overview' },
              { id: 'adsets' as const, label: `Ad sets (${campaign.adSetCount})` },
              { id: 'settings' as const, label: 'Settings' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors duration-150
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 bg-background">
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-5xl">
              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Total Spent"
                  value={campaign.spent > 0 ? formatCurrency(campaign.spent) : '$0.00'}
                  icon={DollarSign}
                  sub={`of ${formatCurrency(campaign.budget)} budget`}
                  highlight
                />
                <MetricCard
                  label="Impressions"
                  value={campaign.impressions > 0 ? formatNumber(campaign.impressions) : '0'}
                  icon={Eye}
                  sub="Total reach"
                />
                <MetricCard
                  label="Clicks"
                  value={campaign.clicks > 0 ? formatNumber(campaign.clicks) : '0'}
                  icon={MousePointer}
                  sub={campaign.ctr > 0 ? `CTR: ${formatPercent(campaign.ctr)}` : 'No clicks yet'}
                />
                <MetricCard
                  label="Avg. CPC"
                  value={campaign.cpc > 0 ? formatCurrency(campaign.cpc) : '—'}
                  icon={TrendingUp}
                  sub="Cost per click"
                />
              </div>

              {/* Budget progress */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-balance">Budget & Pacing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Total budget</p>
                      <p className="text-base font-bold">{formatCurrency(campaign.budget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Daily budget</p>
                      <p className="text-base font-bold">{formatCurrency(campaign.dailyBudget)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                      <p className="text-base font-bold">
                        {formatCurrency(Math.max(0, campaign.budget - campaign.spent))}
                      </p>
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Budget used</span>
                      <span>{Math.round(budgetUsed)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, budgetUsed)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{formatCurrency(campaign.spent)} spent</span>
                      <span>{formatCurrency(campaign.budget)} total</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campaign info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-balance">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Objective', value: campaign.objective },
                      { label: 'Bid strategy', value: campaign.bidStrategy },
                      { label: 'Target audience', value: campaign.targetAudience },
                      { label: 'Ad sets', value: campaign.adSetCount.toString() },
                      { label: 'Total ads', value: campaign.adCount.toString() },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-start gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">{row.label}</span>
                        <span className="text-xs font-medium text-right">{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-balance">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'Start date', value: campaign.startDate },
                      { label: 'End date', value: campaign.endDate },
                      {
                        label: 'Duration',
                        value: (() => {
                          const start = new Date(campaign.startDate);
                          const end = new Date(campaign.endDate);
                          const days = Math.round((end.getTime() - start.getTime()) / 86400000);
                          return `${days} days`;
                        })(),
                      },
                      { label: 'Status', value: campaign.status },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-start gap-2">
                        <span className="text-xs text-muted-foreground shrink-0">{row.label}</span>
                        <span className="text-xs font-medium">{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'adsets' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Ad Sets ({campaignAdSets.length})</h2>
                <Button
                  size="sm"
                  className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => toast.info('Create ad set')}
                >
                  + Create ad set
                </Button>
              </div>

              {campaignAdSets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No ad sets found for this campaign
                </div>
              ) : (
                <div className="w-full overflow-x-auto bg-card border border-border rounded">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="table-header-cell text-left">Ad set</th>
                        <th className="table-header-cell text-left">Status</th>
                        <th className="table-header-cell text-right">Spent</th>
                        <th className="table-header-cell text-right">Impressions</th>
                        <th className="table-header-cell text-right">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaignAdSets.map(adSet => (
                        <tr key={adSet.id} className="border-b border-border hover:bg-secondary/30">
                          <td className="table-body-cell">
                            <p className="text-sm font-medium text-foreground">{adSet.name}</p>
                            <p className="text-xs text-muted-foreground">{adSet.id}</p>
                          </td>
                          <td className="table-body-cell">
                            <StatusBadge status={adSet.status} />
                          </td>
                          <td className="table-body-cell text-right tabular-nums">
                            {adSet.spent > 0 ? formatCurrency(adSet.spent) : '—'}
                          </td>
                          <td className="table-body-cell text-right tabular-nums text-muted-foreground">
                            {adSet.impressions > 0 ? formatNumber(adSet.impressions) : '—'}
                          </td>
                          <td className="table-body-cell text-right tabular-nums text-muted-foreground">
                            {adSet.clicks > 0 ? formatNumber(adSet.clicks) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-balance">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Campaign Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Campaign name', value: campaign.name },
                    { label: 'Campaign ID', value: campaign.id },
                    { label: 'Objective', value: campaign.objective },
                    { label: 'Bid strategy', value: campaign.bidStrategy },
                    { label: 'Total budget', value: formatCurrency(campaign.budget) },
                    { label: 'Daily budget', value: formatCurrency(campaign.dailyBudget) },
                    { label: 'Start date', value: campaign.startDate },
                    { label: 'End date', value: campaign.endDate },
                    { label: 'Target audience', value: campaign.targetAudience },
                  ].map(row => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                      <span className="text-sm font-medium text-right">{row.value}</span>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                      onClick={() => toast.info('Save settings')}
                    >
                      Save changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
