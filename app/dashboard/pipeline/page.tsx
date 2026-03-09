import { createClient } from '@/lib/supabase/server';
import PipelinePageClient from './PipelinePageClient';

export default async function PipelinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ideas } = await supabase
    .from('ideas')
    .select('*, votes(*)');

  return <PipelinePageClient ideas={ideas || []} />;
}
