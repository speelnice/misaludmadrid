// src/app/admin/onboarding/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from('settings').select('value').eq('key', 'onboarding_completed').single();
  if (setting?.value === 'true') redirect('/admin');
  return <OnboardingWizard />;
}
