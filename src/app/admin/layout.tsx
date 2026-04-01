import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import type { Profile } from '@/lib/types';

export const metadata = { title: 'Admin — MiSalud' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single();

  if (!profile || (profile as Profile).role !== 'admin') redirect('/login');

  return <AdminShell profile={profile as Profile}>{children}</AdminShell>;
}
