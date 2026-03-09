'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface GuestIdea {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  created_at: string;
  avgScore: string | null;
  voteCount: number;
}

interface GuestIdeasClientProps {
  ideas: GuestIdea[];
  userName: string;
}

export default function GuestIdeasClient({ ideas, userName }: GuestIdeasClientProps) {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success('Utloggad');
    router.push('/vote/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-serif font-bold text-slate-900">Teljarc</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{userName}</span>
            <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-slate-600">Logga ut</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-serif text-slate-900 mb-1">Rösta på idéer</h1>
        <p className="text-sm text-slate-500 mb-6">Hjälp oss välja nästa projekt att bygga</p>

        <div className="space-y-3">
          {ideas.length === 0 ? (
            <p className="text-slate-500 text-sm">Inga publicerade idéer just nu.</p>
          ) : (
            ideas.map((idea) => (
              <Link key={idea.id} href={`/vote/ideas/${idea.id}`}>
                <div className="bg-white border border-slate-200 p-4 rounded-lg hover:shadow-sm transition-shadow cursor-pointer">
                  <h3 className="font-serif text-lg text-slate-900 mb-1">{idea.title}</h3>
                  {idea.description && (
                    <p className="text-slate-500 text-sm mb-2 line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {idea.tags?.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {idea.avgScore && <span>Snittbetyg: {idea.avgScore}/5</span>}
                    <span>{idea.voteCount} röster</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
