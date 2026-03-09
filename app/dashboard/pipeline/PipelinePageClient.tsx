'use client';

import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';
import type { Idea, Vote, VoteType } from '@/lib/types';
import Link from 'next/link';

interface PipelinePageClientProps {
  ideas: (Idea & { votes: Vote[] })[];
}

const voteLabels: Record<VoteType, string> = {
  must_build: '🔥 Måste byggas',
  interesting: '👍 Intressant',
  maybe: '🤔 Kanske',
  skip: '❌ Skip',
};

export default function PipelinePageClient({ ideas }: PipelinePageClientProps) {
  // Score: must_build=3, interesting=2, maybe=1, skip=-1
  const scoreMap: Record<VoteType, number> = {
    must_build: 3,
    interesting: 2,
    maybe: 1,
    skip: -1,
  };

  const ranked = [...ideas]
    .map((idea) => {
      const score = (idea.votes || []).reduce((sum, v) => sum + (scoreMap[v.vote_type] || 0), 0);
      return { ...idea, score };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div>
      <h1 className="text-2xl mb-6">Pipeline</h1>

      <div className="space-y-3">
        {ranked.length === 0 ? (
          <p className="text-text-secondary text-sm">Inga idéer att ranka ännu.</p>
        ) : (
          ranked.map((idea, index) => (
            <Link key={idea.id} href={`/dashboard/ideas/${idea.id}`}>
              <Card className={`hover:border-text-secondary/30 transition-colors cursor-pointer ${index === 0 ? 'border-text-primary/30' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-text-muted text-lg font-mono w-8 shrink-0">
                      {index === 0 ? '▲' : `#${index + 1}`}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg">{idea.title}</h3>
                        {index === 0 && (
                          <Badge color="#ff6b35">TOPPTIPS</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(idea.votes || []).map((vote) => {
                          // Find the user who voted - we need user info
                          return (
                            <span key={vote.id} className="text-xs text-text-muted">
                              {voteLabels[vote.vote_type]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <TrendingUp size={14} className="text-text-muted" />
                    <span className="text-sm font-mono text-text-secondary">{idea.score}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      <div className="border-t border-border mt-8 pt-6">
        <h2 className="text-lg mb-2">Målbild</h2>
        <p className="text-text-secondary text-sm">
          Hitta den idé som båda brinner för och som har störst potential.
          Rösta, diskutera och satsa — tillsammans.
        </p>
      </div>
    </div>
  );
}
