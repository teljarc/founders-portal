'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Vote, VoteType } from '@/lib/types';
import { toast } from 'sonner';

interface VoteBarProps {
  ideaId: string;
  userId: string;
  votes: Vote[];
}

const voteOptions: { type: VoteType; label: string; emoji: string }[] = [
  { type: 'must_build', label: 'Måste byggas', emoji: '🔥' },
  { type: 'interesting', label: 'Intressant', emoji: '👍' },
  { type: 'maybe', label: 'Kanske', emoji: '🤔' },
  { type: 'skip', label: 'Skip', emoji: '❌' },
];

export default function VoteBar({ ideaId, userId, votes: initialVotes }: VoteBarProps) {
  const [votes, setVotes] = useState(initialVotes);
  const supabase = createClient();

  const myVote = votes.find(v => v.user_id === userId);

  async function handleVote(voteType: VoteType) {
    const previousVotes = votes;

    // Optimistic update
    const updatedVotes = votes.filter(v => v.user_id !== userId);
    updatedVotes.push({ id: 'temp', idea_id: ideaId, user_id: userId, vote_type: voteType });
    setVotes(updatedVotes);

    const { error } = await supabase.from('votes').upsert(
      { idea_id: ideaId, user_id: userId, vote_type: voteType },
      { onConflict: 'idea_id,user_id' }
    );

    if (error) {
      toast.error('Kunde inte rösta');
      setVotes(previousVotes);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary uppercase tracking-wider">Rösta</p>
      <div className="flex flex-wrap gap-2">
        {voteOptions.map(({ type, label, emoji }) => {
          const count = votes.filter(v => v.vote_type === type).length;
          const isSelected = myVote?.vote_type === type;
          return (
            <button
              key={type}
              onClick={() => handleVote(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${
                isSelected
                  ? 'border-text-primary bg-bg-tertiary text-text-primary'
                  : 'border-border text-text-secondary hover:border-text-secondary'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
              {count > 0 && <span className="ml-1 text-text-muted">({count})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
