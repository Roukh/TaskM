'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { rules } from '@/lib/db/schema';
import type { Rule } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';

const DEV_USER_ID = 'dev-user';

const ruleSchema = z.object({
   name: z.string().min(1).max(100),
   description: z.string().max(300).optional(),
   content: z.string().min(1).max(5000),
   layerIndex: z.number().int().min(0).max(4).nullable(),
});

export type RuleInput = z.infer<typeof ruleSchema>;

export async function createRule(input: RuleInput): Promise<{ rule: Rule } | { error: string }> {
   const parsed = ruleSchema.safeParse(input);
   if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

   const { name, description, content, layerIndex } = parsed.data;
   const now = new Date();

   try {
      const [rule] = await db
         .insert(rules)
         .values({
            userId: DEV_USER_ID,
            name,
            description: description ?? null,
            content,
            layerIndex: layerIndex !== null ? layerIndex : null,
            createdAt: now,
            updatedAt: now,
         })
         .returning();

      if (!rule) return { error: 'Failed to create rule' };
      return { rule };
   } catch (err) {
      return { error: err instanceof Error ? err.message : 'Database error' };
   }
}

export async function updateRule(
   id: string,
   input: RuleInput
): Promise<{ rule: Rule } | { error: string }> {
   const parsed = ruleSchema.safeParse(input);
   if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };

   const { name, description, content, layerIndex } = parsed.data;

   try {
      const [rule] = await db
         .update(rules)
         .set({
            name,
            description: description ?? null,
            content,
            layerIndex: layerIndex !== null ? layerIndex : null,
            updatedAt: new Date(),
         })
         .where(and(eq(rules.id, id), eq(rules.userId, DEV_USER_ID)))
         .returning();

      if (!rule) return { error: 'Rule not found' };
      return { rule };
   } catch (err) {
      return { error: err instanceof Error ? err.message : 'Database error' };
   }
}

export async function deleteRule(id: string): Promise<{ success: true } | { error: string }> {
   try {
      const result = await db
         .delete(rules)
         .where(and(eq(rules.id, id), eq(rules.userId, DEV_USER_ID)))
         .returning({ id: rules.id });

      if (result.length === 0) return { error: 'Rule not found' };
      return { success: true };
   } catch (err) {
      return { error: err instanceof Error ? err.message : 'Database error' };
   }
}
