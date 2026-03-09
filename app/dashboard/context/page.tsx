import { createClient } from '@/lib/supabase/server';
import ContextEditor from '@/components/ContextEditor';

export default async function ContextPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  return (
    <div>
      <h1 className="text-2xl mb-6">Context-filer</h1>
      <ContextEditor userName={userName} />
    </div>
  );
}
