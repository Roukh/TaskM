'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth/client';

const loginSchema = z.object({
   email: z.string().email('Invalid email address'),
   password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
   const router = useRouter();
   const [serverError, setServerError] = useState<string | null>(null);
   const [isGithubLoading, setIsGithubLoading] = useState(false);

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
   });

   async function onSubmit(values: LoginFormValues) {
      setServerError(null);
      const { error } = await authClient.signIn.email({
         email: values.email,
         password: values.password,
      });

      if (error) {
         setServerError(error.message ?? 'Sign in failed. Please try again.');
         return;
      }

      router.push('/projects');
   }

   async function handleGithub() {
      setIsGithubLoading(true);
      await authClient.signIn.social({
         provider: 'github',
         callbackURL: '/projects',
      });
      setIsGithubLoading(false);
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
         <Card className="w-full max-w-sm">
            <CardHeader className="space-y-1">
               <CardTitle className="text-2xl">Sign in</CardTitle>
               <CardDescription>Enter your credentials to access TaskM</CardDescription>
            </CardHeader>

            <CardContent>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...register('email')}
                     />
                     {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                     )}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="password">Password</Label>
                     <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...register('password')}
                     />
                     {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                     )}
                  </div>

                  {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? 'Signing in...' : 'Sign in'}
                  </Button>
               </form>

               <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
               </div>

               <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGithub}
                  disabled={isGithubLoading}
               >
                  {isGithubLoading ? 'Redirecting...' : 'Continue with GitHub'}
               </Button>
            </CardContent>

            <CardFooter className="justify-center text-sm">
               <span className="text-muted-foreground">Don&apos;t have an account?&nbsp;</span>
               <Link href="/signup" className="underline underline-offset-4">
                  Sign up
               </Link>
            </CardFooter>
         </Card>
      </div>
   );
}
