import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import GuestIdeaDetailClient from './GuestIdeaDetailClient';

export default async function GuestIdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/vote/login');

  // Check if idea is published
  const { data: published } = await supabase
    .from('published_ideas')
    .select('idea_id')
    .eq('idea_id', id)
    .single();

  if (!published) notFound();

  const { data: idea } = await supabase
    .from('ideas')
    .select('id, title, description, tags')
    .eq('id', id)
    .single();

  if (!idea) notFound();

  const { data: myVote } = await supabase
    .from('guest_votes')
    .select('*')
    .eq('idea_id', id)
    .eq('user_id', user.id)
    .single();

  const { data: guestComments } = await supabase
    .from('guest_comments')
    .select('*')
    .eq('idea_id', id)
    .order('created_at', { ascending: true });

  const { data: allVotes } = await supabase
    .from('guest_votes')
    .select('score')
    .eq('idea_id', id);

  const avgScore = allVotes?.length
    ? (allVotes.reduce((s, v) => s + v.score, 0) / allVotes.length).toFixed(1)
    : null;

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Guest';

  return (
    <GuestIdeaDetailClient
      idea={idea}
      userId={user.id}
      userName={userName}
      myVote={myVote}
      guestComments={guestComments || []}
      avgScore={avgScore}
      totalVotes={allVotes?.length || 0}
    />
  );
}
