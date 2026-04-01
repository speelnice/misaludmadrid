import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const sb = await createClient();
  await sb.auth.signOut();
  const url = new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000');
  return NextResponse.redirect(url);
}
