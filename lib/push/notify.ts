'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import webpush from '@/lib/push/vapid';

export async function sendPushNotification(
  targetUserId: string,
  title: string,
  body: string,
  url?: string
) {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', targetUserId);

  if (!subscriptions?.length) return;

  const payload = JSON.stringify({ title, body, url: url || '/dashboard/ideas' });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(sub.subscription as unknown as webpush.PushSubscription, payload)
    )
  );

  // Clean up expired subscriptions
  for (let i = 0; i < results.length; i++) {
    if (results[i].status === 'rejected') {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('subscription', JSON.stringify(subscriptions[i].subscription));
    }
  }
}

export async function notifyOtherFounders(
  currentUserId: string,
  currentUserName: string,
  type: 'new_idea' | 'new_comment',
  ideaId: string,
  ideaTitle: string
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Get all founders except current user via admin API
  const { data: { users } } = await admin.auth.admin.listUsers();
  const otherFounderIds = users
    .filter(u => u.id !== currentUserId && u.user_metadata?.role === 'founder')
    .map(u => u.id);

  if (!otherFounderIds.length) return;

  const title = type === 'new_idea' ? 'Ny idé!' : 'Ny kommentar!';
  const body = type === 'new_idea'
    ? `${currentUserName} la till: ${ideaTitle}`
    : `${currentUserName} kommenterade på: ${ideaTitle}`;

  for (const userId of otherFounderIds) {
    // Always create in-app notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      idea_id: ideaId,
      triggered_by_name: currentUserName,
    });

    // Send push notification if subscription exists
    await sendPushNotification(userId, title, body, `/dashboard/ideas/${ideaId}`);
  }
}
