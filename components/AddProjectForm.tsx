'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { ProjectStatus } from '@/lib/types';

interface AddProjectFormProps {
  userId: string;
  userName: string;
  onProjectAdded?: () => void;
}

export default function AddProjectForm({ userId, userName, onProjectAdded }: AddProjectFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('idea');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const { error } = await supabase.from('projects').insert({
      name: name.trim(),
      description: description.trim() || null,
      url: url.trim() || null,
      status,
      created_by: userId,
      created_by_name: userName,
    });

    if (error) {
      toast.error('Kunde inte skapa projekt');
      setLoading(false);
      return;
    }

    toast.success('Projekt skapat!');
    setName('');
    setDescription('');
    setUrl('');
    setStatus('idea');
    setOpen(false);
    setLoading(false);
    onProjectAdded?.();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="secondary" size="sm" className="gap-1.5">
        <Plus size={14} /> Nytt projekt
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full border border-border bg-bg-secondary p-4 space-y-3">
      <Input placeholder="Namn" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      <Textarea placeholder="Beskrivning (valfritt)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      <Input placeholder="URL (valfritt)" value={url} onChange={(e) => setUrl(e.target.value)} />
      <div>
        <label className="block text-xs text-text-secondary mb-1 uppercase tracking-wider">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
          className="w-full bg-bg-tertiary border border-border text-text-primary px-3 py-2 text-sm font-mono focus:outline-none focus:border-text-secondary"
        >
          <option value="idea">Idea</option>
          <option value="building">Building</option>
          <option value="live">Live</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>{loading ? 'Skapar...' : 'Skapa'}</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Avbryt</Button>
      </div>
    </form>
  );
}
