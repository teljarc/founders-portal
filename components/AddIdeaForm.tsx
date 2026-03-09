'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notifyOtherFounders } from '@/lib/push/notify';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddIdeaFormProps {
  userId: string;
  userName: string;
  onIdeaAdded?: () => void;
}

export default function AddIdeaForm({ userId, userName, onIdeaAdded }: AddIdeaFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const { data, error } = await supabase.from('ideas').insert({
      title: title.trim(),
      description: description.trim() || null,
      tags,
      created_by: userId,
      created_by_name: userName,
    }).select().single();

    if (error) {
      toast.error('Kunde inte skapa idé');
      setLoading(false);
      return;
    }

    toast.success('Idé skapad!');

    // Notify other founders
    try {
      await notifyOtherFounders(userId, userName, 'new_idea', data.id, data.title);
    } catch {
      // Non-critical, ignore
    }

    setTitle('');
    setDescription('');
    setTagsInput('');
    setOpen(false);
    setLoading(false);
    onIdeaAdded?.();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="secondary" size="sm" className="gap-1.5">
        <Plus size={14} /> Ny idé
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full border border-border bg-bg-secondary p-4 space-y-3">
      <Input
        placeholder="Titel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus
      />
      <Textarea
        placeholder="Beskrivning (valfritt)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <Input
        placeholder="Taggar (komma-separerade)"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Skapar...' : 'Skapa idé'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Avbryt
        </Button>
      </div>
    </form>
  );
}
