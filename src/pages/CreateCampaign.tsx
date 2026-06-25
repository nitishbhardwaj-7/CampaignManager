import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Target,
  Globe,
  Users,
  Heart,
  Play,
  FileText,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/components/layouts/AppLayout';
import { useCampaigns } from '@/contexts/CampaignContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Campaign, CampaignObjective } from '@/data/mockData';

const STEPS = ['Objective', 'Details', 'Budget & Schedule', 'Review'];

interface ObjectiveOption {
  id: CampaignObjective;
  label: string;
  desc: string;
  icon: React.ElementType;
}

const OBJECTIVES: ObjectiveOption[] = [
  { id: 'Brand Awareness', label: 'Brand Awareness', desc: 'Reach a professional audience and increase awareness.', icon: Globe },
  { id: 'Website Visits', label: 'Website Visits', desc: 'Drive traffic to your website or landing page.', icon: Target },
  { id: 'Engagement', label: 'Engagement', desc: 'Get more reactions, comments, and shares.', icon: Heart },
  { id: 'Video Views', label: 'Video Views', desc: 'Promote video content to your target audience.', icon: Play },
  { id: 'Lead Generation', label: 'Lead Generation', desc: 'Collect leads using native lead gen forms.', icon: FileText },
  { id: 'Website Conversions', label: 'Website Conversions', desc: 'Drive valuable actions on your website.', icon: Briefcase },
  { id: 'Job Applicants', label: 'Job Applicants', desc: 'Drive qualified professionals to apply for jobs.', icon: Users },
];

interface FormData {
  objective: CampaignObjective | '';
  name: string;
  audience: string;
  bidStrategy: string;
  totalBudget: string;
  dailyBudget: string;
  startDate: string;
  endDate: string;
}

const DEFAULT_FORM: FormData = {
  objective: '',
  name: '',
  audience: '',
  bidStrategy: 'Maximum Delivery',
  totalBudget: '5000',
  dailyBudget: '250',
  startDate: '2026-07-01',
  endDate: '2026-09-30',
};

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { addCampaign } = useCampaigns();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 0 && !form.objective) errs.objective = 'Please select a campaign objective.';
    if (step === 1) {
      if (!form.name.trim()) errs.name = 'Campaign name is required.';
      if (!form.audience.trim()) errs.audience = 'Target audience is required.';
    }
    if (step === 2) {
      if (!form.totalBudget || Number(form.totalBudget) <= 0) errs.totalBudget = 'Enter a valid budget.';
      if (!form.dailyBudget || Number(form.dailyBudget) <= 0) errs.dailyBudget = 'Enter a valid daily budget.';
      if (!form.startDate) errs.startDate = 'Start date is required.';
      if (!form.endDate) errs.endDate = 'End date is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep(s => s + 1);
  };
  const back = () => setStep(s => Math.max(0, s - 1));

  const handleSubmit = () => {
    const now = Date.now();
    const campaign: Campaign = {
      id: String(700000000000 + now % 1000000),
      name: form.name.trim(),
      objective: form.objective as CampaignObjective,
      status: 'Draft',
      isActive: false,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      budget: Number(form.totalBudget),
      dailyBudget: Number(form.dailyBudget),
      startDate: form.startDate,
      endDate: form.endDate,
      targetAudience: form.audience,
      bidStrategy: form.bidStrategy,
      adSetCount: 0,
      adCount: 0,
    };
    addCampaign(campaign);
    toast.success(`Campaign "${campaign.name}" created as Draft`);
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-full bg-background">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 bg-card border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Cancel and go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground text-balance">Create campaign</h1>
              <p className="text-xs text-muted-foreground">Redington MENA · Step {step + 1} of {STEPS.length}</p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                      i < step
                        ? 'bg-[hsl(var(--status-active))] text-white'
                        : i === step
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium hidden sm:block',
                      i === step ? 'text-primary' : i < step ? 'text-muted-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-px mx-3', i < step ? 'bg-[hsl(var(--status-active))]' : 'bg-border')} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto">
            {/* Step 0: Objective */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground text-balance mb-1">
                    What is your advertising objective?
                  </h2>
                  <p className="text-sm text-muted-foreground text-pretty">
                    Choose the goal that best describes what you want to achieve with this campaign.
                  </p>
                </div>
                {errors.objective && (
                  <p className="text-xs text-destructive">{errors.objective}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {OBJECTIVES.map(obj => {
                    const Icon = obj.icon;
                    const selected = form.objective === obj.id;
                    return (
                      <button
                        key={obj.id}
                        onClick={() => update('objective', obj.id)}
                        className={cn(
                          'flex items-start gap-3 p-4 rounded border-2 text-left transition-all duration-150',
                          selected
                            ? 'border-primary bg-[hsl(211,91%,97%)]'
                            : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'
                        )}
                      >
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          selected ? 'bg-primary/10' : 'bg-secondary'
                        )}>
                          <Icon className={cn('h-4 w-4', selected ? 'text-primary' : 'text-muted-foreground')} />
                        </div>
                        <div>
                          <p className={cn('text-sm font-semibold', selected ? 'text-primary' : 'text-foreground')}>
                            {obj.label}
                          </p>
                          <p className="text-xs text-muted-foreground text-pretty">{obj.desc}</p>
                        </div>
                        {selected && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-auto mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h2 className="text-base font-semibold text-foreground text-balance mb-1">Campaign details</h2>
                  <p className="text-sm text-muted-foreground">Configure your campaign targeting and naming.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="campaign-name" className="text-sm font-normal">
                    Campaign name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="campaign-name"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="e.g. Q3 2026 Brand Awareness"
                    className="border-border"
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="objective-display" className="text-sm font-normal">
                    Objective
                  </Label>
                  <Input
                    id="objective-display"
                    value={form.objective}
                    disabled
                    className="border-border bg-secondary text-muted-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="audience" className="text-sm font-normal">
                    Target audience <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="audience"
                    value={form.audience}
                    onChange={e => update('audience', e.target.value)}
                    placeholder="e.g. IT Decision Makers, UAE & Saudi Arabia"
                    className="border-border"
                  />
                  {errors.audience && <p className="text-xs text-destructive">{errors.audience}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bid-strategy" className="text-sm font-normal">
                    Bid strategy
                  </Label>
                  <select
                    id="bid-strategy"
                    value={form.bidStrategy}
                    onChange={e => update('bidStrategy', e.target.value)}
                    className="w-full h-9 rounded border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Maximum Delivery">Maximum Delivery</option>
                    <option value="Target Cost">Target Cost</option>
                    <option value="Manual Bidding">Manual Bidding</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Budget & Schedule */}
            {step === 2 && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h2 className="text-base font-semibold text-foreground text-balance mb-1">Budget & Schedule</h2>
                  <p className="text-sm text-muted-foreground">Set your campaign budget and run dates.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="total-budget" className="text-sm font-normal">
                      Total budget (USD) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="total-budget"
                      type="number"
                      min="1"
                      value={form.totalBudget}
                      onChange={e => update('totalBudget', e.target.value)}
                      className="border-border"
                    />
                    {errors.totalBudget && <p className="text-xs text-destructive">{errors.totalBudget}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="daily-budget" className="text-sm font-normal">
                      Daily budget (USD) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="daily-budget"
                      type="number"
                      min="1"
                      value={form.dailyBudget}
                      onChange={e => update('dailyBudget', e.target.value)}
                      className="border-border"
                    />
                    {errors.dailyBudget && <p className="text-xs text-destructive">{errors.dailyBudget}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="start-date" className="text-sm font-normal">
                      Start date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={form.startDate}
                      onChange={e => update('startDate', e.target.value)}
                      className="border-border"
                    />
                    {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="end-date" className="text-sm font-normal">
                      End date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={form.endDate}
                      onChange={e => update('endDate', e.target.value)}
                      className="border-border"
                    />
                    {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-5 max-w-lg">
                <div>
                  <h2 className="text-base font-semibold text-foreground text-balance mb-1">Review your campaign</h2>
                  <p className="text-sm text-muted-foreground">Please review the details before creating your campaign.</p>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    {[
                      { label: 'Campaign name', value: form.name },
                      { label: 'Objective', value: form.objective },
                      { label: 'Target audience', value: form.audience },
                      { label: 'Bid strategy', value: form.bidStrategy },
                      { label: 'Total budget', value: `$${Number(form.totalBudget).toLocaleString()}` },
                      { label: 'Daily budget', value: `$${Number(form.dailyBudget).toLocaleString()}` },
                      { label: 'Start date', value: form.startDate },
                      { label: 'End date', value: form.endDate },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-start gap-4 border-b border-border pb-2 last:border-0 last:pb-0">
                        <span className="text-sm text-muted-foreground shrink-0">{row.label}</span>
                        <span className="text-sm font-medium text-right">{row.value || '—'}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="p-3 bg-[hsl(38,92%,97%)] border border-[hsl(38,92%,80%)] rounded text-xs text-[hsl(38,70%,35%)]">
                  Your campaign will be created as a <strong>Draft</strong>. You can add ad sets and ads before activating it.
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={step === 0 ? () => navigate('/') : back}
                className="gap-2 border-border"
              >
                <ArrowLeft className="h-4 w-4" />
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>

              {step < STEPS.length - 1 ? (
                <Button
                  onClick={next}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Create campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
