import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function VotePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/vote/ideas');
  } else {
    redirect('/vote/login');
  }
}
