import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/index';
import { db } from '@/lib/db/index';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

/**
 * Simple reversible encoding for the API key at rest.
 * TODO: Replace with AES-256-GCM or a KMS-backed solution before production.
 */
function encode(value: string): string {
   return Buffer.from(value, 'utf8').toString('base64');
}

async function getSession() {
   const requestHeaders = await headers();
   return auth.api.getSession({ headers: requestHeaders });
}

export async function POST(request: NextRequest) {
   const session = await getSession();
   if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   let body: unknown;
   try {
      body = await request.json();
   } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
   }

   if (
      typeof body !== 'object' ||
      body === null ||
      !('apiKey' in body) ||
      typeof (body as Record<string, unknown>).apiKey !== 'string' ||
      (body as Record<string, string>).apiKey.trim() === ''
   ) {
      return NextResponse.json({ error: 'apiKey must be a non-empty string' }, { status: 400 });
   }

   const apiKey = (body as Record<string, string>).apiKey.trim();

   await db
      .update(user)
      .set({ claudeApiKey: encode(apiKey) })
      .where(eq(user.id, session.user.id));

   return NextResponse.json({ success: true });
}

export async function DELETE() {
   const session = await getSession();
   if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   await db.update(user).set({ claudeApiKey: null }).where(eq(user.id, session.user.id));

   return NextResponse.json({ success: true });
}
