import { createClient } from '@/lib/supabase/server';
import NotificationsClient from './NotificationsClient';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, ideas(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return <NotificationsClient notifications={notifications || []} userId={user.id} />;
}
