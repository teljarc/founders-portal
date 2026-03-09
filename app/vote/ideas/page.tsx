import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import GuestIdeasClient from './GuestIdeasClient';

interface IdeaWithVotes {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  created_at: string;
  guest_votes: { score: number }[];
}

export default async function GuestIdeasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/vote/login');

  const { data: publishedIdeas } = await supabase
    .from('published_ideas')
    .select('idea_id, ideas(id, title, description, tags, created_at, guest_votes(score))')
    .order('published_at', { ascending: false });

  const ideas = publishedIdeas?.map(pi => {
    const idea = pi.ideas as unknown as IdeaWithVotes;
    return {
      ...idea,
      avgScore: idea?.guest_votes?.length
        ? (idea.guest_votes.reduce((s: number, v: { score: number }) => s + v.score, 0) / idea.guest_votes.length).toFixed(1)
        : null,
      voteCount: idea?.guest_votes?.length || 0,
    };
  }) || [];

  return <GuestIdeasClient ideas={ideas} userName={user.user_metadata?.name || user.email?.split('@')[0] || 'Guest'} />;
}
