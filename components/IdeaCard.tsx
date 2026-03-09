'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Flame, MessageSquare } from 'lucide-react';
import type { Idea, Vote } from '@/lib/types';

interface IdeaCardProps {
  idea: Idea;
  votes: Vote[];
  commentCount: number;
}

function getUserColor(name: string | null): string {
  if (!name) return '#8a8a9a';
  const lower = name.toLowerCase();
  if (lower === 'magnus') return '#a8d8a8';
  if (lower === 'john') return '#a8c8f0';
  return '#8a8a9a';
}

export default function IdeaCard({ idea, votes, commentCount }: IdeaCardProps) {
  const positiveVotes = votes.filter(v => v.vote_type === 'must_build' || v.vote_type === 'interesting').length;
  const isHot = positiveVotes >= 2;

  const voteCounts = {
    must_build: votes.filter(v => v.vote_type === 'must_build').length,
    interesting: votes.filter(v => v.vote_type === 'interesting').length,
    maybe: votes.filter(v => v.vote_type === 'maybe').length,
    skip: votes.filter(v => v.vote_type === 'skip').length,
  };

  return (
    <Link href={`/dashboard/ideas/${idea.id}`}>
      <Card className="hover:border-text-secondary/30 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-lg leading-tight">{idea.title}</h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isHot && (
              <Badge color="#ff6b35" className="gap-1">
                <Flame size={10} /> HOT
              </Badge>
            )}
          </div>
        </div>

        {idea.description && (
          <p className="text-text-secondary text-sm mb-3 line-clamp-2">{idea.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.tags?.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <Badge color={getUserColor(idea.created_by_name)}>
              {idea.created_by_name || 'Okänd'}
            </Badge>
            <span>{new Date(idea.created_at).toLocaleDateString('sv-SE')}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquare size={12} /> {commentCount}
            </span>
            <span className="text-text-secondary">
              🔥{voteCounts.must_build} 👍{voteCounts.interesting} 🤔{voteCounts.maybe} ❌{voteCounts.skip}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
