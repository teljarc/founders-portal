'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Badge from '@/components/ui/Badge';
import CommentForm from '@/components/CommentForm';
import type { Comment } from '@/lib/types';

interface CommentThreadProps {
  ideaId: string;
  userId: string;
  userName: string;
}

function getUserColor(name: string): string {
  const lower = name.toLowerCase();
  if (lower === 'magnus') return '#a8d8a8';
  if (lower === 'john') return '#a8c8f0';
  return '#8a8a9a';
}

export default function CommentThread({ ideaId, userId, userName }: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchComments() {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });
      if (data) setComments(data);
    }

    fetchComments();

    const channel = supabase
      .channel(`comments-${ideaId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `idea_id=eq.${ideaId}` },
        (payload) => {
          setComments((prev) => {
            if (prev.some(c => c.id === (payload.new as Comment).id)) return prev;
            return [...prev, payload.new as Comment];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ideaId, supabase]);

  const topLevel = comments.filter(c => !c.parent_id);
  const replies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-secondary uppercase tracking-wider">
        Kommentarer ({comments.length})
      </p>

      <div className="space-y-3">
        {topLevel.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={replies(comment.id)}
            ideaId={ideaId}
            userId={userId}
            userName={userName}
          />
        ))}
      </div>

      <CommentForm ideaId={ideaId} userId={userId} userName={userName} onCommentAdded={(c) => {
        setComments(prev => {
          if (prev.some(existing => existing.id === c.id)) return prev;
          return [...prev, c];
        });
      }} />
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  ideaId,
  userId,
  userName,
}: {
  comment: Comment;
  replies: Comment[];
  ideaId: string;
  userId: string;
  userName: string;
}) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className="border-l-2 border-border pl-3">
      <div className="flex items-center gap-2 mb-1">
        <Badge color={getUserColor(comment.user_name)}>{comment.user_name}</Badge>
        <span className="text-xs text-text-muted">
          {new Date(comment.created_at).toLocaleString('sv-SE')}
        </span>
      </div>
      <p className="text-sm text-text-primary mb-1">{comment.body}</p>
      <button
        onClick={() => setShowReply(!showReply)}
        className="text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        Svara
      </button>

      {showReply && (
        <div className="mt-2">
          <CommentForm
            ideaId={ideaId}
            userId={userId}
            userName={userName}
            parentId={comment.id}
            onCommentAdded={() => setShowReply(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="mt-2 space-y-2 ml-3">
          {replies.map((reply) => (
            <div key={reply.id} className="border-l-2 border-border/50 pl-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge color={getUserColor(reply.user_name)}>{reply.user_name}</Badge>
                <span className="text-xs text-text-muted">
                  {new Date(reply.created_at).toLocaleString('sv-SE')}
                </span>
              </div>
              <p className="text-sm text-text-primary">{reply.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
