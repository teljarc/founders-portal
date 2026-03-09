'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import IdeaCard from '@/components/IdeaCard';
import AddIdeaForm from '@/components/AddIdeaForm';
import type { Idea, Vote } from '@/lib/types';

interface IdeasPageClientProps {
  ideas: (Idea & { votes: Vote[]; comments: { id: string }[] })[];
  userId: string;
  userName: string;
}

export default function IdeasPageClient({ ideas: initialIdeas, userId, userName }: IdeasPageClientProps) {
  const [ideas, setIdeas] = useState(initialIdeas);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('ideas-list')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ideas' },
        async () => {
          // Refetch all ideas with votes and comments
          const { data } = await supabase
            .from('ideas')
            .select('*, votes(*), comments(id)')
            .order('created_at', { ascending: false });
          if (data) setIdeas(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleIdeaAdded() {
    const { data } = await supabase
      .from('ideas')
      .select('*, votes(*), comments(id)')
      .order('created_at', { ascending: false });
    if (data) setIdeas(data);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">Idéer</h1>
        <AddIdeaForm userId={userId} userName={userName} onIdeaAdded={handleIdeaAdded} />
      </div>

      <div className="space-y-3">
        {ideas.length === 0 ? (
          <p className="text-text-secondary text-sm">Inga idéer ännu. Skapa den första!</p>
        ) : (
          ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              votes={idea.votes || []}
              commentCount={idea.comments?.length || 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
