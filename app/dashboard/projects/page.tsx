import { createClient } from '@/lib/supabase/server';
import ProjectsPageClient from './ProjectsPageClient';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return <ProjectsPageClient projects={projects || []} userId={user.id} userName={userName} />;
}
