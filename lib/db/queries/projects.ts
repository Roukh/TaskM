import { db } from '../index';
import { projects } from '../schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { v4 as uuid } from 'uuid';

export async function getProjects(userId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(projects.createdAt);
}

export async function getProject(projectId: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProjectByApiKey(apiKey: string) {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.apiKey, apiKey))
    .limit(1);
  return rows[0] ?? null;
}

export async function createProject(data: {
  userId: string;
  name: string;
  repoPath: string;
  defaultBranch?: string;
  githubRepo?: string;
}) {
  const id = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);

  const apiKey = randomBytes(32).toString('hex');

  const rows = await db
    .insert(projects)
    .values({
      id: `${id}-${uuid().slice(0, 8)}`,
      userId: data.userId,
      name: data.name,
      repoPath: data.repoPath,
      defaultBranch: data.defaultBranch ?? 'main',
      githubRepo: data.githubRepo ?? null,
      apiKey,
    })
    .returning();

  return rows[0];
}

export async function updateProject(
  projectId: string,
  data: Partial<{
    name: string;
    repoPath: string;
    defaultBranch: string;
    githubRepo: string | null;
  }>
) {
  const rows = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();
  return rows[0] ?? null;
}
