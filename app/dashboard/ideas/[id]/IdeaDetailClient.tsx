'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import VoteBar from '@/components/VoteBar';
import CommentThread from '@/components/CommentThread';
import { ArrowLeft, Trash2, Globe, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Idea, Vote, PublishedIdea, GuestVote, GuestComment } from '@/lib/types';
import Link from 'next/link';

function getUserColor(name: string | null): string {
  if (!name) return '#8a8a9a';
  const lower = name.toLowerCase();
  if (lower === 'magnus') return '#a8d8a8';
  if (lower === 'john') return '#a8c8f0';
  return '#8a8a9a';
}

interface IdeaDetailClientProps {
  idea: Idea & { votes: Vote[]; published_ideas: PublishedIdea[]; guest_votes: GuestVote[]; guest_comments: GuestComment[] };
  userId: string;
  userName: string;
}

export default function IdeaDetailClient({ idea, userId, userName }: IdeaDetailClientProps) {
  const [isPublished, setIsPublished] = useState(idea.published_ideas?.length > 0);
  const supabase = createClient();
  const router = useRouter();

  async function handleDelete() {
    if (idea.created_by !== userId) {
      toast.error('Du kan bara ta bort egna idéer');
      return;
    }
    if (!confirm('Vill du verkligen ta bort denna idé?')) return;

    const { error } = await supabase.from('ideas').delete().eq('id', idea.id);
    if (error) {
      toast.error('Kunde inte ta bort idé');
      return;
    }
    toast.success('Idé borttagen');
    router.push('/dashboard/ideas');
  }

  async function togglePublish() {
    if (isPublished) {
      await supabase.from('published_ideas').delete().eq('idea_id', idea.id);
      setIsPublished(false);
      toast.success('Idé avpublicerad');
    } else {
      await supabase.from('published_ideas').insert({ idea_id: idea.id, published_by: userId });
      setIsPublished(true);
      toast.success('Idé publicerad för gäster');
    }
  }

  const avgGuestScore = idea.guest_votes?.length
    ? (idea.guest_votes.reduce((sum, v) => sum + v.score, 0) / idea.guest_votes.length).toFixed(1)
    : null;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/ideas" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary mb-4 transition-colors">
        <ArrowLeft size={14} /> Tillbaka
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h1 className="text-2xl">{idea.title}</h1>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={togglePublish} title={isPublished ? 'Avpublicera' : 'Publicera för gäster'}>
              {isPublished ? <X size={14} /> : <Globe size={14} />}
            </Button>
            {idea.created_by === userId && (
              <Button variant="ghost" size="sm" onClick={handleDelete} title="Ta bort">
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {idea.description && (
          <p className="text-text-secondary mb-3">{idea.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.tags?.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Badge color={getUserColor(idea.created_by_name)}>{idea.created_by_name || 'Okänd'}</Badge>
          <span>{new Date(idea.created_at).toLocaleString('sv-SE')}</span>
        </div>
      </div>

      <div className="border-t border-border pt-4 mb-6">
        <VoteBar ideaId={idea.id} userId={userId} votes={idea.votes || []} />
      </div>

      {/* Guest votes section */}
      {(idea.guest_votes?.length > 0 || idea.guest_comments?.length > 0) && (
        <div className="border-t border-border pt-4 mb-6">
          <p className="text-xs text-text-secondary uppercase tracking-wider mb-3">Gäströster & kommentarer</p>
          {avgGuestScore && (
            <p className="text-sm text-text-primary mb-2">
              Genomsnittligt betyg: <span className="text-text-primary font-bold">{avgGuestScore}/5</span> ({idea.guest_votes.length} röster)
            </p>
          )}
          {idea.guest_comments?.length > 0 && (
            <div className="space-y-2 mt-3">
              {idea.guest_comments.map((gc) => (
                <div key={gc.id} className="border-l-2 border-border/50 pl-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-text-secondary">{gc.user_name}</span>
                    <span className="text-xs text-text-muted">{new Date(gc.created_at).toLocaleString('sv-SE')}</span>
                  </div>
                  <p className="text-sm text-text-primary">{gc.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border-t border-border pt-4">
        <CommentThread ideaId={idea.id} userId={userId} userName={userName} />
      </div>
    </div>
  );
}
