import { db } from '../index';
import { memri, type MemriCategory } from '../schema';
import { eq, and, isNull, or } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export async function getMemriById(memriId: string) {
  const rows = await db
    .select()
    .from(memri)
    .where(eq(memri.id, memriId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getMemri(projectId: string, targetNodeId?: string) {
  if (targetNodeId) {
    // Return entries bound to this node + project-wide entries
    return db
      .select()
      .from(memri)
      .where(
        and(
          eq(memri.projectId, projectId),
          or(eq(memri.targetNodeId, targetNodeId), isNull(memri.targetNodeId))
        )
      )
      .orderBy(memri.createdAt);
  }

  return db
    .select()
    .from(memri)
    .where(eq(memri.projectId, projectId))
    .orderBy(memri.createdAt);
}

export async function createMemri(data: {
  projectId: string;
  category: MemriCategory;
  content: string;
  targetNodeId?: string | null;
}) {
  const rows = await db
    .insert(memri)
    .values({
      id: uuid(),
      projectId: data.projectId,
      category: data.category,
      content: data.content,
      targetNodeId: data.targetNodeId ?? null,
    })
    .returning();
  return rows[0];
}

export async function updateMemri(
  memriId: string,
  data: Partial<{ category: MemriCategory; content: string; targetNodeId: string | null }>
) {
  const rows = await db
    .update(memri)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(memri.id, memriId))
    .returning();
  return rows[0] ?? null;
}

export async function deleteMemri(memriId: string) {
  await db.delete(memri).where(eq(memri.id, memriId));
}
