import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db/queries/projects';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  repoPath: z.string().min(1),
  defaultBranch: z.string().optional(),
  githubRepo: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const projectList = await getProjects(session.user.id);
  return NextResponse.json(projectList);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await createProject({
    userId: session.user.id,
    ...parsed.data,
  });

  return NextResponse.json(project, { status: 201 });
}
