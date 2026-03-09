'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function GuestLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim(), role: 'guest' },
        },
      });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success('Konto skapat! Du kan nu logga in.');
      setIsRegister(false);
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Inloggad!');
    router.push('/vote/ideas');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-slate-900 mb-2">Teljarc</h1>
          <p className="text-slate-500 text-sm">Hjälp oss välja nästa projekt</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          {isRegister && (
            <div>
              <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Namn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ditt namn"
                required={isRegister}
                className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-slate-400 text-slate-900"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.se"
              required
              className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-slate-400 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1 uppercase tracking-wider">Lösenord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-slate-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-slate-400 text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-2 text-sm rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : isRegister ? 'Registrera' : 'Logga in'}
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            {isRegister ? 'Har redan konto? Logga in' : 'Inget konto? Registrera dig'}
          </button>
        </form>
      </div>
    </div>
  );
}
