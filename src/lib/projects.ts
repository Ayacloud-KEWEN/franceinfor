import 'server-only';
import { prisma } from './prisma';
import type { Project, ProjectStep } from '@prisma/client';

export type ProjectWithSteps = Project & { steps: ProjectStep[] };

export async function listProjects(): Promise<ProjectWithSteps[]> {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { steps: { orderBy: { createdAt: 'asc' } } },
    take: 100,
  });
}

export interface ExperienceStats {
  total: number;
  completed: number;
  cancelled: number;
  successRate: number | null; // completed / (completed + cancelled)
  avgDays: number | null;
  avgCostEur: number | null;
  commonProblems: { problem: string; count: number }[];
}

// Aggregate real-project outcomes into "Experience Intelligence". Optionally
// scoped to one playbook. Only completed projects feed the averages.
export async function experienceStats(playbookSlug?: string): Promise<ExperienceStats> {
  const where = playbookSlug ? { playbookSlug } : {};
  const projects = await prisma.project.findMany({
    where,
    include: { steps: { select: { problem: true } } },
  });

  const completed = projects.filter((p) => p.status === 'COMPLETED');
  const cancelled = projects.filter((p) => p.status === 'CANCELLED');

  const days = completed.map((p) => p.actualDays).filter((d): d is number => d != null);
  const costs = completed.map((p) => p.actualCostEur).filter((c): c is number => c != null);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

  const problemCounts = new Map<string, number>();
  for (const p of projects)
    for (const s of p.steps)
      if (s.problem?.trim()) {
        const key = s.problem.trim();
        problemCounts.set(key, (problemCounts.get(key) ?? 0) + 1);
      }
  const commonProblems = [...problemCounts.entries()]
    .map(([problem, count]) => ({ problem, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const decided = completed.length + cancelled.length;
  return {
    total: projects.length,
    completed: completed.length,
    cancelled: cancelled.length,
    successRate: decided ? Math.round((completed.length / decided) * 100) : null,
    avgDays: avg(days),
    avgCostEur: avg(costs),
    commonProblems,
  };
}
