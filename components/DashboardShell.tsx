'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Lightbulb, FolderKanban, TrendingUp, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import NotificationBell from '@/components/NotificationBell';
import { toast } from 'sonner';
import { useEffect } from 'react';

const navItems = [
  { href: '/dashboard/ideas', label: 'Idéer', icon: Lightbulb },
  { href: '/dashboard/projects', label: 'Projekt', icon: FolderKanban },
  { href: '/dashboard/pipeline', label: 'Pipeline', icon: TrendingUp },
  { href: '/dashboard/context', label: 'Context', icon: FileText },
];

interface DashboardShellProps {
  userId: string;
  userName: string;
  children: React.ReactNode;
}

export default function DashboardShell({ userId, userName, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast.success('Utloggad');
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard/ideas">
            <Image src="/teljarc-logo-header.png" alt="Teljarc" width={180} height={36} priority />
          </Link>
          <div className="flex items-center gap-3">
            <NotificationBell userId={userId} />
            <span className="text-xs text-text-secondary hidden sm:inline">{userName}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Logga ut">
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </header>
      <nav className="border-b border-border bg-bg-secondary/50">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs uppercase tracking-wider transition-colors ${
                pathname.startsWith(href)
                  ? 'text-text-primary border-b-2 border-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
