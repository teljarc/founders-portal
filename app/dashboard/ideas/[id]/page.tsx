import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import IdeaDetailClient from './IdeaDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function IdeaDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: idea } = await supabase
    .from('ideas')
    .select('*, votes(*), published_ideas(*), guest_votes(*), guest_comments(*)')
    .eq('id', id)
    .single();

  if (!idea) notFound();

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return (
    <IdeaDetailClient
      idea={idea}
      userId={user.id}
      userName={userName}
    />
  );
}
