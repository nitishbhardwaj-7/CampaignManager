import React from 'react';
import CampaignsDashboard from './pages/CampaignsDashboard';
import CampaignDetail from './pages/CampaignDetail';
import AdSetsPage from './pages/AdSetsPage';
import AdsPage from './pages/AdsPage';
import CreateCampaign from './pages/CreateCampaign';
import OverviewPage from './pages/OverviewPage';
import PlaceholderPage from './pages/PlaceholderPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Campaigns Dashboard',
    path: '/',
    element: <CampaignsDashboard />,
    public: true,
  },
  {
    name: 'Campaign Detail',
    path: '/campaign/:id',
    element: <CampaignDetail />,
    public: true,
  },
  {
    name: 'Ad Sets',
    path: '/adsets',
    element: <AdSetsPage />,
    public: true,
  },
  {
    name: 'Ads',
    path: '/ads',
    element: <AdsPage />,
    public: true,
  },
  {
    name: 'Create Campaign',
    path: '/create',
    element: <CreateCampaign />,
    public: true,
  },
  {
    name: 'Overview',
    path: '/overview',
    element: <OverviewPage />,
    public: true,
  },
  {
    name: 'Recommendations',
    path: '/recommendations',
    element: <PlaceholderPage title="Recommendations" description="AI-powered recommendations to optimize your campaign performance." />,
    public: true,
  },
  {
    name: 'Content & Assets',
    path: '/assets',
    element: <PlaceholderPage title="Content & Assets" description="Manage your creative assets, images, and ad content here." />,
    public: true,
  },
  {
    name: 'Billing',
    path: '/billing',
    element: <PlaceholderPage title="Billing" description="Manage your payment methods, invoices, and billing details." />,
    public: true,
  },
  {
    name: 'Account Settings',
    path: '/settings',
    element: <PlaceholderPage title="Account Settings" description="Configure your account preferences and team access." />,
    public: true,
  },
];
