'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { GuestVote, GuestComment } from '@/lib/types';

interface Props {
  idea: { id: string; title: string; description: string | null; tags: string[] };
  userId: string;
  userName: string;
  myVote: GuestVote | null;
  guestComments: GuestComment[];
  avgScore: string | null;
  totalVotes: number;
}

export default function GuestIdeaDetailClient({ idea, userId, userName, myVote: initialVote, guestComments: initialComments, avgScore: initialAvg, totalVotes: initialTotal }: Props) {
  const [score, setScore] = useState(initialVote?.score || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(initialComments);
  const [avgScore, setAvgScore] = useState(initialAvg);
  const [totalVotes, setTotalVotes] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleVote(newScore: number) {
    setScore(newScore);
    const { error } = await supabase.from('guest_votes').upsert(
      { idea_id: idea.id, user_id: userId, score: newScore },
      { onConflict: 'idea_id,user_id' }
    );
    if (error) {
      toast.error('Kunde inte rösta');
      return;
    }
    toast.success(`Du gav ${newScore}/5`);

    // Refetch average
    const { data: allVotes } = await supabase.from('guest_votes').select('score').eq('idea_id', idea.id);
    if (allVotes) {
      setAvgScore((allVotes.reduce((s, v) => s + v.score, 0) / allVotes.length).toFixed(1));
      setTotalVotes(allVotes.length);
    }
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || comment.length > 280) return;
    setLoading(true);

    const { data, error } = await supabase.from('guest_comments').insert({
      idea_id: idea.id,
      user_id: userId,
      user_name: userName,
      body: comment.trim(),
    }).select().single();

    if (error) {
      toast.error('Kunde inte kommentera');
      setLoading(false);
      return;
    }

    setComments(prev => [...prev, data as GuestComment]);
    setComment('');
    setLoading(false);
    toast.success('Kommentar skickad!');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link href="/vote/ideas" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft size={16} /> Tillbaka
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif text-slate-900 mb-2">{idea.title}</h1>
        {idea.description && <p className="text-slate-600 mb-4">{idea.description}</p>}

        <div className="flex flex-wrap gap-1.5 mb-6">
          {idea.tags?.map((tag) => (
            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>

        {/* Score section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-500 mb-3 uppercase tracking-wider">Betygsätt denna idé</p>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => handleVote(n)}
                className={`w-12 h-12 text-lg border rounded transition-colors ${
                  n <= score
                    ? 'bg-amber-100 border-amber-300 text-amber-600'
                    : 'border-slate-200 text-slate-300 hover:border-slate-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-400">
            {avgScore && <span>Genomsnitt: {avgScore}/5 ({totalVotes} röster)</span>}
          </div>
        </div>

        {/* Comment section */}
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-500 mb-3 uppercase tracking-wider">Kommentarer</p>

          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="border-l-2 border-slate-200 pl-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-slate-700">{c.user_name}</span>
                  <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString('sv-SE')}</span>
                </div>
                <p className="text-sm text-slate-600">{c.body}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-xs text-slate-400">Inga kommentarer ännu.</p>
            )}
          </div>

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Skriv en kort kommentar (max 280 tecken)..."
              maxLength={280}
              className="flex-1 border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-slate-400 text-slate-900"
            />
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="bg-slate-900 text-white px-4 py-2 text-sm rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Skicka
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
