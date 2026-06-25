// Mock data for LinkedIn Ads Campaign Manager

export type CampaignStatus = 'Active' | 'Paused' | 'Draft' | 'Completed' | 'Archived';
export type CampaignObjective =
  | 'Brand Awareness'
  | 'Lead Generation'
  | 'Website Visits'
  | 'Engagement'
  | 'Video Views'
  | 'Job Applicants'
  | 'Website Conversions';

export interface Campaign {
  id: string;
  name: string;
  objective: CampaignObjective;
  status: CampaignStatus;
  isActive: boolean;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  bidStrategy: string;
  adSetCount: number;
  adCount: number;
}

export interface AdSet {
  id: string;
  campaignId: string;
  campaignName: string;
  name: string;
  status: CampaignStatus;
  isActive: boolean;
  spent: number;
  impressions: number;
  clicks: number;
  audience: string;
  budget: number;
  startDate: string;
  endDate: string;
}

export interface Ad {
  id: string;
  campaignId: string;
  adSetId: string;
  adSetName: string;
  campaignName: string;
  name: string;
  status: CampaignStatus;
  isActive: boolean;
  spent: number;
  impressions: number;
  clicks: number;
  format: string;
  headline: string;
  description: string;
  imageUrl: string;
}

export const mockCampaigns: Campaign[] = [
  {
    id: '701234567890',
    name: 'Q2 2026 Brand Awareness - MENA',
    objective: 'Brand Awareness',
    status: 'Active',
    isActive: true,
    spent: 4820.5,
    impressions: 312400,
    clicks: 2180,
    ctr: 0.7,
    cpc: 2.21,
    budget: 10000,
    dailyBudget: 500,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    targetAudience: 'IT Decision Makers, UAE & Saudi Arabia',
    bidStrategy: 'Maximum Delivery',
    adSetCount: 3,
    adCount: 9,
  },
  {
    id: '701234567891',
    name: 'Lead Gen - Enterprise Software',
    objective: 'Lead Generation',
    status: 'Active',
    isActive: true,
    spent: 11250.75,
    impressions: 189600,
    clicks: 4320,
    ctr: 2.28,
    cpc: 2.6,
    budget: 25000,
    dailyBudget: 1000,
    startDate: '2026-05-01',
    endDate: '2026-07-31',
    targetAudience: 'C-Suite, Technology Sector, 500+ employees',
    bidStrategy: 'Target Cost',
    adSetCount: 5,
    adCount: 15,
  },
  {
    id: '701234567892',
    name: 'Website Visits - Product Launch',
    objective: 'Website Visits',
    status: 'Paused',
    isActive: false,
    spent: 3100.0,
    impressions: 95200,
    clicks: 1840,
    ctr: 1.93,
    cpc: 1.68,
    budget: 8000,
    dailyBudget: 400,
    startDate: '2026-03-15',
    endDate: '2026-05-15',
    targetAudience: 'Marketing Professionals, B2B SaaS',
    bidStrategy: 'Maximum Delivery',
    adSetCount: 2,
    adCount: 6,
  },
  {
    id: '701234567893',
    name: 'Q3 Engagement Campaign',
    objective: 'Engagement',
    status: 'Draft',
    isActive: false,
    spent: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    budget: 5000,
    dailyBudget: 250,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    targetAudience: 'HR & Talent Acquisition, All Industries',
    bidStrategy: 'Maximum Delivery',
    adSetCount: 1,
    adCount: 3,
  },
  {
    id: '701234567894',
    name: 'Video Views - Thought Leadership',
    objective: 'Video Views',
    status: 'Completed',
    isActive: false,
    spent: 6750.25,
    impressions: 428900,
    clicks: 3210,
    ctr: 0.75,
    cpc: 2.1,
    budget: 7000,
    dailyBudget: 350,
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    targetAudience: 'Senior Leaders, Finance & Technology',
    bidStrategy: 'Maximum Delivery',
    adSetCount: 4,
    adCount: 12,
  },
];

export const mockAdSets: AdSet[] = [
  {
    id: 'as-1001',
    campaignId: '701234567890',
    campaignName: 'Q2 2026 Brand Awareness - MENA',
    name: 'UAE Decision Makers - Desktop',
    status: 'Active',
    isActive: true,
    spent: 1820.5,
    impressions: 120400,
    clicks: 840,
    audience: 'UAE IT Directors, Desktop',
    budget: 3500,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
  },
  {
    id: 'as-1002',
    campaignId: '701234567890',
    campaignName: 'Q2 2026 Brand Awareness - MENA',
    name: 'Saudi Arabia CxOs',
    status: 'Active',
    isActive: true,
    spent: 2100.0,
    impressions: 132000,
    clicks: 920,
    audience: 'Saudi Arabia C-Suite, All Devices',
    budget: 4000,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
  },
  {
    id: 'as-1003',
    campaignId: '701234567891',
    campaignName: 'Lead Gen - Enterprise Software',
    name: 'Retargeting - Website Visitors',
    status: 'Active',
    isActive: true,
    spent: 4250.75,
    impressions: 67300,
    clicks: 1820,
    audience: 'Website Visitors (30 days), Lookalike',
    budget: 9000,
    startDate: '2026-05-01',
    endDate: '2026-07-31',
  },
  {
    id: 'as-1004',
    campaignId: '701234567891',
    campaignName: 'Lead Gen - Enterprise Software',
    name: 'Cold Audience - Enterprise',
    status: 'Paused',
    isActive: false,
    spent: 3200.0,
    impressions: 52100,
    clicks: 980,
    audience: 'Enterprise Segment, 500+ employees',
    budget: 7000,
    startDate: '2026-05-01',
    endDate: '2026-07-31',
  },
  {
    id: 'as-1005',
    campaignId: '701234567892',
    campaignName: 'Website Visits - Product Launch',
    name: 'Product Launch Audience',
    status: 'Paused',
    isActive: false,
    spent: 3100.0,
    impressions: 95200,
    clicks: 1840,
    audience: 'Marketing Professionals, B2B SaaS',
    budget: 8000,
    startDate: '2026-03-15',
    endDate: '2026-05-15',
  },
];

export const mockAds: Ad[] = [
  {
    id: 'ad-2001',
    campaignId: '701234567890',
    adSetId: 'as-1001',
    adSetName: 'UAE Decision Makers - Desktop',
    campaignName: 'Q2 2026 Brand Awareness - MENA',
    name: 'Redington MENA - Innovation Ad v1',
    status: 'Active',
    isActive: true,
    spent: 920.5,
    impressions: 61200,
    clicks: 420,
    format: 'Single Image Ad',
    headline: 'Transform Your Business with Redington',
    description: 'Leading technology solutions for the modern enterprise.',
    imageUrl: '',
  },
  {
    id: 'ad-2002',
    campaignId: '701234567890',
    adSetId: 'as-1001',
    adSetName: 'UAE Decision Makers - Desktop',
    campaignName: 'Q2 2026 Brand Awareness - MENA',
    name: 'Redington MENA - Innovation Ad v2',
    status: 'Active',
    isActive: true,
    spent: 900.0,
    impressions: 59200,
    clicks: 420,
    format: 'Single Image Ad',
    headline: 'Empowering MENA Enterprises',
    description: 'Discover next-generation technology solutions.',
    imageUrl: '',
  },
  {
    id: 'ad-2003',
    campaignId: '701234567891',
    adSetId: 'as-1003',
    adSetName: 'Retargeting - Website Visitors',
    campaignName: 'Lead Gen - Enterprise Software',
    name: 'Lead Gen Form Ad - Enterprise',
    status: 'Active',
    isActive: true,
    spent: 2120.75,
    impressions: 34600,
    clicks: 910,
    format: 'Lead Gen Form',
    headline: 'Get a Free Enterprise Demo',
    description: 'Request your personalized enterprise software demo today.',
    imageUrl: '',
  },
  {
    id: 'ad-2004',
    campaignId: '701234567891',
    adSetId: 'as-1003',
    adSetName: 'Retargeting - Website Visitors',
    campaignName: 'Lead Gen - Enterprise Software',
    name: 'Lead Gen Form Ad - SMB',
    status: 'Paused',
    isActive: false,
    spent: 1450.0,
    impressions: 28700,
    clicks: 760,
    format: 'Lead Gen Form',
    headline: 'Grow Your Business with Our Software',
    description: 'Scale your operations with our proven platform.',
    imageUrl: '',
  },
  {
    id: 'ad-2005',
    campaignId: '701234567892',
    adSetId: 'as-1005',
    adSetName: 'Product Launch Audience',
    campaignName: 'Website Visits - Product Launch',
    name: 'Product Launch Carousel',
    status: 'Paused',
    isActive: false,
    spent: 3100.0,
    impressions: 95200,
    clicks: 1840,
    format: 'Carousel Ad',
    headline: 'Introducing Our Newest Product',
    description: 'Discover features built for modern marketing teams.',
    imageUrl: '',
  },
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
