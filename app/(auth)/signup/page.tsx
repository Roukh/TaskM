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

const signupSchema = z.object({
   name: z.string().min(1, 'Name is required'),
   email: z.string().email('Invalid email address'),
   password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
   const router = useRouter();
   const [serverError, setServerError] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm<SignupFormValues>({
      resolver: zodResolver(signupSchema),
   });

   async function onSubmit(values: SignupFormValues) {
      setServerError(null);
      const { error } = await authClient.signUp.email({
         name: values.name,
         email: values.email,
         password: values.password,
      });

      if (error) {
         setServerError(error.message ?? 'Sign up failed. Please try again.');
         return;
      }

      router.push('/projects');
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
         <Card className="w-full max-w-sm">
            <CardHeader className="space-y-1">
               <CardTitle className="text-2xl">Create account</CardTitle>
               <CardDescription>Get started with TaskM today</CardDescription>
            </CardHeader>

            <CardContent>
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="name">Name</Label>
                     <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        autoComplete="name"
                        {...register('name')}
                     />
                     {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                     )}
                  </div>

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
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        {...register('password')}
                     />
                     {errors.password && (
                        <p className="text-sm text-destructive">{errors.password.message}</p>
                     )}
                  </div>

                  {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
               </form>
            </CardContent>

            <CardFooter className="justify-center text-sm">
               <span className="text-muted-foreground">Already have an account?&nbsp;</span>
               <Link href="/login" className="underline underline-offset-4">
                  Sign in
               </Link>
            </CardFooter>
         </Card>
      </div>
   );
}
