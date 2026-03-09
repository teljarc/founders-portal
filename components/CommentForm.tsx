'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notifyOtherFounders } from '@/lib/push/notify';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'sonner';
import type { Comment } from '@/lib/types';

interface CommentFormProps {
  ideaId: string;
  userId: string;
  userName: string;
  parentId?: string;
  onCommentAdded?: (comment: Comment) => void;
}

export default function CommentForm({ ideaId, userId, userName, parentId, onCommentAdded }: CommentFormProps) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);

    const { data, error } = await supabase.from('comments').insert({
      idea_id: ideaId,
      parent_id: parentId || null,
      user_id: userId,
      user_name: userName,
      body: body.trim(),
    }).select().single();

    if (error) {
      toast.error('Kunde inte kommentera');
      setLoading(false);
      return;
    }

    setBody('');
    setLoading(false);
    onCommentAdded?.(data as Comment);

    // Get idea title for notification
    try {
      const { data: idea } = await supabase.from('ideas').select('title').eq('id', ideaId).single();
      if (idea) {
        await notifyOtherFounders(userId, userName, 'new_comment', ideaId, idea.title);
      }
    } catch {
      // Non-critical
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <Textarea
        placeholder={parentId ? 'Skriv ett svar...' : 'Skriv en kommentar...'}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="flex-1"
      />
      <Button type="submit" size="sm" disabled={loading || !body.trim()} className="self-end sm:self-auto">
        {loading ? '...' : 'Skicka'}
      </Button>
    </form>
  );
}
