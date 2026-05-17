'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { discoveryAnswers } from '@/lib/db/schema';
import type { DiscoveryAnswer } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const answerSchema = z.object({
   projectId: z.string().min(1),
   questionId: z.string().uuid(),
   answer: z.string().max(2000),
});

export async function upsertDiscoveryAnswer(
   input: z.infer<typeof answerSchema>
): Promise<{ answer: DiscoveryAnswer } | { error: string }> {
   const parsed = answerSchema.safeParse(input);
   if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

   const { projectId, questionId, answer } = parsed.data;
   const now = new Date();

   try {
      const existing = await db
         .select()
         .from(discoveryAnswers)
         .where(
            and(
               eq(discoveryAnswers.projectId, projectId),
               eq(discoveryAnswers.questionId, questionId)
            )
         )
         .limit(1);

      if (existing[0]) {
         const [updated] = await db
            .update(discoveryAnswers)
            .set({ answer, answeredBy: 'human', answeredAt: now })
            .where(eq(discoveryAnswers.id, existing[0].id))
            .returning();
         return { answer: updated! };
      }

      const [created] = await db
         .insert(discoveryAnswers)
         .values({ projectId, questionId, answer, answeredBy: 'human', answeredAt: now })
         .returning();

      return { answer: created! };
   } catch (err) {
      return { error: err instanceof Error ? err.message : 'Database error' };
   }
}
