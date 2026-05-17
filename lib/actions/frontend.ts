'use server';

import { db } from '@/lib/db/index';
import {
   pages,
   components,
   atoms,
   globalColors,
   globalFonts,
   globalFontSizes,
   globalSpacings,
   globalRadii,
   globalShadows,
} from '@/lib/db/schema';
import type {
   Page,
   Component,
   Atom,
   GlobalColor,
   GlobalFont,
   GlobalFontSize,
   GlobalSpacing,
   GlobalRadius,
   GlobalShadow,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// ── Pages ─────────────────────────────────────────────────────────────────────

interface PageInput {
   path: string;
   name: string;
   description?: string | null;
}

export async function createPage(
   projectId: string,
   input: PageInput
): Promise<{ page: Page } | { error: string }> {
   try {
      const [page] = await db
         .insert(pages)
         .values({ projectId, ...input })
         .returning();
      return { page };
   } catch {
      return { error: 'Failed to create page' };
   }
}

export async function updatePage(
   id: string,
   input: PageInput
): Promise<{ page: Page } | { error: string }> {
   try {
      const [page] = await db.update(pages).set(input).where(eq(pages.id, id)).returning();
      return { page };
   } catch {
      return { error: 'Failed to update page' };
   }
}

export async function deletePage(id: string): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(pages).where(eq(pages.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete page' };
   }
}

// ── Components ────────────────────────────────────────────────────────────────

interface ComponentInput {
   name: string;
   family?: string | null;
   description?: string | null;
}

export async function createComponent(
   projectId: string,
   input: ComponentInput
): Promise<{ component: Component } | { error: string }> {
   try {
      const [component] = await db
         .insert(components)
         .values({ projectId, ...input })
         .returning();
      return { component };
   } catch {
      return { error: 'Failed to create component' };
   }
}

export async function updateComponent(
   id: string,
   input: ComponentInput
): Promise<{ component: Component } | { error: string }> {
   try {
      const [component] = await db
         .update(components)
         .set(input)
         .where(eq(components.id, id))
         .returning();
      return { component };
   } catch {
      return { error: 'Failed to update component' };
   }
}

export async function deleteComponent(id: string): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(components).where(eq(components.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete component' };
   }
}

// ── Atoms ─────────────────────────────────────────────────────────────────────

interface AtomInput {
   family: string;
   atomType: string;
   variant?: string | null;
   size?: string | null;
   icon?: string | null;
   interactive?: boolean;
}

export async function createAtom(
   projectId: string,
   input: AtomInput
): Promise<{ atom: Atom } | { error: string }> {
   try {
      const [atom] = await db
         .insert(atoms)
         .values({ projectId, interactive: false, ...input })
         .returning();
      return { atom };
   } catch {
      return { error: 'Failed to create atom' };
   }
}

export async function updateAtom(
   id: string,
   input: AtomInput
): Promise<{ atom: Atom } | { error: string }> {
   try {
      const [atom] = await db.update(atoms).set(input).where(eq(atoms.id, id)).returning();
      return { atom };
   } catch {
      return { error: 'Failed to update atom' };
   }
}

export async function deleteAtom(id: string): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(atoms).where(eq(atoms.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete atom' };
   }
}

// ── Globals: Colors ───────────────────────────────────────────────────────────

interface ColorInput {
   name: string;
   value: string;
   role?: string | null;
}

export async function createGlobalColor(
   projectId: string,
   input: ColorInput
): Promise<{ color: GlobalColor } | { error: string }> {
   try {
      const [color] = await db
         .insert(globalColors)
         .values({ projectId, ...input })
         .returning();
      return { color };
   } catch {
      return { error: 'Failed to create color' };
   }
}

export async function updateGlobalColor(
   id: string,
   input: ColorInput
): Promise<{ color: GlobalColor } | { error: string }> {
   try {
      const [color] = await db
         .update(globalColors)
         .set(input)
         .where(eq(globalColors.id, id))
         .returning();
      return { color };
   } catch {
      return { error: 'Failed to update color' };
   }
}

export async function deleteGlobalColor(
   id: string
): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(globalColors).where(eq(globalColors.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete color' };
   }
}

// ── Globals: Fonts ────────────────────────────────────────────────────────────

interface FontInput {
   name: string;
   family: string;
   role?: string | null;
}

export async function createGlobalFont(
   projectId: string,
   input: FontInput
): Promise<{ font: GlobalFont } | { error: string }> {
   try {
      const [font] = await db
         .insert(globalFonts)
         .values({ projectId, ...input })
         .returning();
      return { font };
   } catch {
      return { error: 'Failed to create font' };
   }
}

export async function updateGlobalFont(
   id: string,
   input: FontInput
): Promise<{ font: GlobalFont } | { error: string }> {
   try {
      const [font] = await db
         .update(globalFonts)
         .set(input)
         .where(eq(globalFonts.id, id))
         .returning();
      return { font };
   } catch {
      return { error: 'Failed to update font' };
   }
}

export async function deleteGlobalFont(id: string): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(globalFonts).where(eq(globalFonts.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete font' };
   }
}

// ── Globals: Font Sizes ───────────────────────────────────────────────────────

interface NameValueInput {
   name: string;
   value: string;
}

export async function createGlobalFontSize(
   projectId: string,
   input: NameValueInput
): Promise<{ item: GlobalFontSize } | { error: string }> {
   try {
      const [item] = await db
         .insert(globalFontSizes)
         .values({ projectId, ...input })
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to create font size' };
   }
}

export async function updateGlobalFontSize(
   id: string,
   input: NameValueInput
): Promise<{ item: GlobalFontSize } | { error: string }> {
   try {
      const [item] = await db
         .update(globalFontSizes)
         .set(input)
         .where(eq(globalFontSizes.id, id))
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to update font size' };
   }
}

export async function deleteGlobalFontSize(
   id: string
): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(globalFontSizes).where(eq(globalFontSizes.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete font size' };
   }
}

// ── Globals: Spacings ─────────────────────────────────────────────────────────

export async function createGlobalSpacing(
   projectId: string,
   input: NameValueInput
): Promise<{ item: GlobalSpacing } | { error: string }> {
   try {
      const [item] = await db
         .insert(globalSpacings)
         .values({ projectId, ...input })
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to create spacing' };
   }
}

export async function updateGlobalSpacing(
   id: string,
   input: NameValueInput
): Promise<{ item: GlobalSpacing } | { error: string }> {
   try {
      const [item] = await db
         .update(globalSpacings)
         .set(input)
         .where(eq(globalSpacings.id, id))
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to update spacing' };
   }
}

export async function deleteGlobalSpacing(
   id: string
): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(globalSpacings).where(eq(globalSpacings.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete spacing' };
   }
}

// ── Globals: Radii ────────────────────────────────────────────────────────────

export async function createGlobalRadius(
   projectId: string,
   input: NameValueInput
): Promise<{ item: GlobalRadius } | { error: string }> {
   try {
      const [item] = await db
         .insert(globalRadii)
         .values({ projectId, ...input })
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to create radius' };
   }
}

export async function updateGlobalRadius(
   id: string,
   input: NameValueInput
): Promise<{ item: GlobalRadius } | { error: string }> {
   try {
      const [item] = await db
         .update(globalRadii)
         .set(input)
         .where(eq(globalRadii.id, id))
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to update radius' };
   }
}

export async function deleteGlobalRadius(
   id: string
): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(globalRadii).where(eq(globalRadii.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete radius' };
   }
}

// ── Globals: Shadows ──────────────────────────────────────────────────────────

export async function createGlobalShadow(
   projectId: string,
   input: NameValueInput
): Promise<{ item: GlobalShadow } | { error: string }> {
   try {
      const [item] = await db
         .insert(globalShadows)
         .values({ projectId, ...input })
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to create shadow' };
   }
}

export async function updateGlobalShadow(
   id: string,
   input: NameValueInput
): Promise<{ item: GlobalShadow } | { error: string }> {
   try {
      const [item] = await db
         .update(globalShadows)
         .set(input)
         .where(eq(globalShadows.id, id))
         .returning();
      return { item };
   } catch {
      return { error: 'Failed to update shadow' };
   }
}

export async function deleteGlobalShadow(
   id: string
): Promise<{ success: true } | { error: string }> {
   try {
      await db.delete(globalShadows).where(eq(globalShadows.id, id));
      return { success: true };
   } catch {
      return { error: 'Failed to delete shadow' };
   }
}
