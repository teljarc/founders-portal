'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProjectCard from '@/components/ProjectCard';
import AddProjectForm from '@/components/AddProjectForm';
import type { Project } from '@/lib/types';

interface ProjectsPageClientProps {
  projects: Project[];
  userId: string;
  userName: string;
}

export default function ProjectsPageClient({ projects: initialProjects, userId, userName }: ProjectsPageClientProps) {
  const [projects, setProjects] = useState(initialProjects);
  const supabase = createClient();

  async function refetch() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl">Projekt</h1>
        <AddProjectForm userId={userId} userName={userName} onProjectAdded={refetch} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.length === 0 ? (
          <p className="text-text-secondary text-sm">Inga projekt ännu.</p>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} userId={userId} onDeleted={refetch} />
          ))
        )}
      </div>
    </div>
  );
}
