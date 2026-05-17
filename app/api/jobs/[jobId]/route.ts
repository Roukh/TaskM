import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/jobs/[jobId] — get single job status
export async function GET(_req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
   const { jobId } = await params;

   const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

   return NextResponse.json({ job: job ?? null });
}
