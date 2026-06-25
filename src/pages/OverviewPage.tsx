import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Lightbulb,
  Image,
  CreditCard,
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/components/layouts/AppLayout';
import { useCampaigns } from '@/contexts/CampaignContext';
import { formatCurrency, formatNumber } from '@/data/mockData';

interface QuickLinkProps {
  icon: React.ElementType;
  label: string;
  path: string;
}

function QuickLink({ icon: Icon, label, path }: QuickLinkProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="flex flex-col items-center gap-2 p-4 rounded border border-border bg-card hover:bg-secondary hover:border-primary/30 transition-all duration-150 group"
    >
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10">
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </button>
  );
}

export default function OverviewPage() {
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();

  const activeCampaigns = campaigns.filter(c => c.status === 'Active');
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground text-balance">Overview</h1>
            <p className="text-sm text-muted-foreground">Redington MENA · Account #4892761</p>
          </div>
          <Button
            onClick={() => navigate('/create')}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            + Create campaign
          </Button>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active campaigns', value: String(activeCampaigns.length), icon: TrendingUp, sub: `of ${campaigns.length} total` },
            { label: 'Total spent', value: formatCurrency(totalSpent), icon: DollarSign, sub: 'All time' },
            { label: 'Impressions', value: formatNumber(totalImpressions), icon: Eye, sub: 'All campaigns' },
            { label: 'Avg. CTR', value: `${avgCtr.toFixed(2)}%`, icon: Users, sub: 'Click-through rate' },
          ].map(m => (
            <Card key={m.label} className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{m.label}</span>
                  <m.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold tabular-nums text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Quick links</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <QuickLink icon={LayoutDashboard} label="Campaigns" path="/" />
            <QuickLink icon={BarChart2} label="Measure" path="/" />
            <QuickLink icon={Lightbulb} label="Recommendations" path="/recommendations" />
            <QuickLink icon={Image} label="Content & assets" path="/assets" />
            <QuickLink icon={CreditCard} label="Billing" path="/billing" />
            <QuickLink icon={Settings} label="Settings" path="/settings" />
          </div>
        </div>

        {/* Recent campaigns */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent campaigns</h2>
            <button onClick={() => navigate('/')} className="text-xs text-primary hover:underline">
              View all
            </button>
          </div>
          <Card>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="table-header-cell text-left">Campaign</th>
                    <th className="table-header-cell text-left">Status</th>
                    <th className="table-header-cell text-right">Spent</th>
                    <th className="table-header-cell text-right">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.slice(0, 4).map(c => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer"
                      onClick={() => navigate(`/campaign/${c.id}`)}
                    >
                      <td className="table-body-cell">
                        <p className="text-sm font-medium text-primary hover:underline truncate max-w-[200px]">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.objective}</p>
                      </td>
                      <td className="table-body-cell">
                        <span className={`text-xs font-medium ${
                          c.status === 'Active' ? 'text-[hsl(var(--status-active))]' :
                          c.status === 'Paused' ? 'text-[hsl(var(--status-paused))]' :
                          'text-muted-foreground'
                        }`}>{c.status}</span>
                      </td>
                      <td className="table-body-cell text-right tabular-nums text-sm">{c.spent > 0 ? formatCurrency(c.spent) : '—'}</td>
                      <td className="table-body-cell text-right tabular-nums text-sm text-muted-foreground">{c.clicks > 0 ? formatNumber(c.clicks) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
