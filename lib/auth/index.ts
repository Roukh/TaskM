import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db/index';
import { user, session, account, verification } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
   database: drizzleAdapter(db, {
      provider: 'pg',
      schema: { user, session, account, verification },
   }),

   emailAndPassword: {
      enabled: true,
   },

   socialProviders: {
      github: {
         clientId: process.env.GITHUB_CLIENT_ID!,
         clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
   },

   databaseHooks: {
      account: {
         create: {
            after: async (createdAccount) => {
               if (createdAccount.providerId === 'github' && createdAccount.accessToken) {
                  await db
                     .update(user)
                     .set({ githubOauthToken: createdAccount.accessToken })
                     .where(eq(user.id, createdAccount.userId));
               }
            },
         },
      },
   },
});

export type Auth = typeof auth;
