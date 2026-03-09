'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ExternalLink, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  userId: string;
  onDeleted?: () => void;
}

const statusColors: Record<string, { color: string; label: string }> = {
  live: { color: '#4ade80', label: 'Live' },
  building: { color: '#facc15', label: 'Building' },
  idea: { color: '#8a8a9a', label: 'Idea' },
};

function getUserColor(name: string | null): string {
  if (!name) return '#8a8a9a';
  const lower = name.toLowerCase();
  if (lower === 'magnus') return '#a8d8a8';
  if (lower === 'john') return '#a8c8f0';
  return '#8a8a9a';
}

export default function ProjectCard({ project, userId, onDeleted }: ProjectCardProps) {
  const supabase = createClient();
  const status = statusColors[project.status] || statusColors.idea;

  async function handleDelete() {
    if (project.created_by !== userId) {
      toast.error('Du kan bara ta bort egna projekt');
      return;
    }
    if (!confirm('Ta bort projektet?')) return;

    const { error } = await supabase.from('projects').delete().eq('id', project.id);
    if (error) {
      toast.error('Kunde inte ta bort');
      return;
    }
    toast.success('Projekt borttaget');
    onDeleted?.();
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-serif text-lg">{project.name}</h3>
        <Badge color={status.color}>{status.label}</Badge>
      </div>
      {project.description && (
        <p className="text-text-secondary text-sm mb-3">{project.description}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Badge color={getUserColor(project.created_by_name)}>{project.created_by_name || 'Okänd'}</Badge>
          <span>{new Date(project.created_at).toLocaleDateString('sv-SE')}</span>
        </div>
        <div className="flex gap-1">
          {project.url && (
            <a href={/^https?:\/\//i.test(project.url) ? project.url : `https://${project.url}`} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm"><ExternalLink size={14} /></Button>
            </a>
          )}
          {project.created_by === userId && (
            <Button variant="ghost" size="sm" onClick={handleDelete}><Trash2 size={14} /></Button>
          )}
        </div>
      </div>
    </Card>
  );
}
