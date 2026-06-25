import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layouts/AppLayout';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const navigate = useNavigate();
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Construction className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2 text-balance">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm text-pretty">
          {description ?? 'This section is coming soon. Check back later for updates.'}
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Back to Campaigns
        </Button>
      </div>
    </AppLayout>
  );
}
