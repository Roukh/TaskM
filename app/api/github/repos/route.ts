import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface GithubRepoItem {
   full_name: string;
   description: string | null;
   private: boolean;
}

interface RepoSummary {
   fullName: string;
   description: string | null;
   private: boolean;
}

export async function GET(): Promise<NextResponse> {
   // TODO: replace with session.user.id once auth is merged
   const userId = 'dev-user';

   try {
      const [userRow] = await db
         .select({ githubOauthToken: user.githubOauthToken })
         .from(user)
         .where(eq(user.id, userId))
         .limit(1);

      const token = userRow?.githubOauthToken;

      if (!token) {
         return NextResponse.json({ error: 'GitHub not connected', repos: [] });
      }

      const response = await fetch(
         'https://api.github.com/user/repos?per_page=100&sort=updated&type=owner',
         {
            headers: {
               'Authorization': `Bearer ${token}`,
               'Accept': 'application/vnd.github+json',
               'X-GitHub-Api-Version': '2022-11-28',
            },
            // Do not cache — repo list may change frequently
            cache: 'no-store',
         }
      );

      if (!response.ok) {
         if (response.status === 401) {
            return NextResponse.json({ error: 'GitHub not connected', repos: [] });
         }
         return NextResponse.json(
            { error: `GitHub API error: ${response.status}`, repos: [] },
            { status: response.status }
         );
      }

      const data: GithubRepoItem[] = (await response.json()) as GithubRepoItem[];

      const repos: RepoSummary[] = data.map((r) => ({
         fullName: r.full_name,
         description: r.description,
         private: r.private,
      }));

      return NextResponse.json({ repos });
   } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      return NextResponse.json({ error: message, repos: [] }, { status: 500 });
   }
}
