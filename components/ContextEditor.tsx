'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { toast } from 'sonner';
import type { ContextFile, ContextSlug } from '@/lib/types';

interface ContextEditorProps {
  userName: string;
}

const tabs: { slug: ContextSlug; label: string }[] = [
  { slug: 'claude', label: 'CLAUDE.md' },
  { slug: 'memory', label: 'MEMORY.md' },
  { slug: 'todo', label: 'TODO.md' },
  { slug: 'ideas', label: 'IDEAS.md' },
];

export default function ContextEditor({ userName }: ContextEditorProps) {
  const [activeTab, setActiveTab] = useState<ContextSlug>('claude');
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchContent() {
      const { data } = await supabase
        .from('context_files')
        .select('*')
        .eq('slug', activeTab)
        .single();

      if (data) {
        setContent(data.content);
        setSavedContent(data.content);
        setUpdatedBy(data.updated_by_name);
        setUpdatedAt(data.updated_at);
      } else {
        setContent('');
        setSavedContent('');
        setUpdatedBy(null);
        setUpdatedAt(null);
      }
    }

    fetchContent();

    const channel = supabase
      .channel(`context-${activeTab}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'context_files', filter: `slug=eq.${activeTab}` },
        (payload) => {
          const newData = payload.new as ContextFile;
          if (newData) {
            setSavedContent(newData.content);
            setContent(newData.content);
            setUpdatedBy(newData.updated_by_name);
            setUpdatedAt(newData.updated_at);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, supabase]);

  async function handleSave() {
    setLoading(true);

    const { error } = await supabase.from('context_files').upsert(
      {
        slug: activeTab,
        content,
        updated_by_name: userName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      toast.error('Kunde inte spara');
    } else {
      toast.success('Sparat!');
      setSavedContent(content);
    }
    setLoading(false);
  }

  function handleExport() {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab.toUpperCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasChanges = content !== savedContent;

  return (
    <div>
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {tabs.map(({ slug, label }) => (
          <button
            key={slug}
            onClick={() => setActiveTab(slug)}
            className={`px-3 py-2 text-xs uppercase tracking-wider transition-colors ${
              activeTab === slug
                ? 'text-text-primary border-b-2 border-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={20}
        className="font-mono text-sm"
        placeholder={`Skriv innehåll för ${activeTab.toUpperCase()}.md...`}
      />

      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-text-muted">
          {updatedBy && updatedAt && (
            <span>Senast redigerad av {updatedBy} — {new Date(updatedAt).toLocaleString('sv-SE')}</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>Exportera .md</Button>
          <Button size="sm" onClick={handleSave} disabled={loading || !hasChanges}>
            {loading ? 'Sparar...' : 'Spara'}
          </Button>
        </div>
      </div>
    </div>
  );
}
