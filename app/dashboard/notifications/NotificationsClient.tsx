'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import Link from 'next/link';
import type { Notification } from '@/lib/types';

interface NotificationsClientProps {
  notifications: Notification[];
  userId: string;
}

export default function NotificationsClient({ notifications: initial, userId }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initial);
  const supabase = createClient();

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function markAllAsRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('Alla markerade som lästa');
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  function getNotificationText(n: Notification) {
    const name = n.triggered_by_name || 'Någon';
    const ideaTitle = n.ideas?.title || 'en idé';
    if (n.type === 'new_idea') return `${name} la till en ny idé: ${ideaTitle}`;
    if (n.type === 'new_comment') return `${name} kommenterade på: ${ideaTitle}`;
    return `${name} gjorde något`;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h1 className="text-2xl">Notifikationer</h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Markera alla som lästa ({unreadCount})
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <p className="text-text-secondary text-sm">Inga notifikationer.</p>
        ) : (
          notifications.map((n) => (
            <Link key={n.id} href={`/dashboard/ideas/${n.idea_id}`} onClick={() => !n.read && markAsRead(n.id)}>
              <Card className={`cursor-pointer hover:border-text-secondary/30 transition-colors ${!n.read ? 'border-l-2 border-l-red-500' : 'opacity-60'}`}>
                <p className="text-sm">{getNotificationText(n)}</p>
                <p className="text-xs text-text-muted mt-1">
                  {new Date(n.created_at).toLocaleString('sv-SE')}
                </p>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
