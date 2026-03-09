import { createClient } from '@/lib/supabase/server';
import IdeasPageClient from './IdeasPageClient';

export default async function IdeasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, votes(*), comments(id)')
    .order('created_at', { ascending: false });

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return (
    <IdeasPageClient
      ideas={ideas || []}
      userId={user.id}
      userName={userName}
    />
  );
}
