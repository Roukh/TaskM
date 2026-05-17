'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TmClaudeApiKeyProps {
   /** Whether the user already has a key stored (server-rendered initial state). */
   hasKey?: boolean;
}

export function TmClaudeApiKey({ hasKey: initialHasKey = false }: TmClaudeApiKeyProps) {
   const [hasKey, setHasKey] = useState(initialHasKey);
   const [apiKey, setApiKey] = useState('');
   const [isSaving, setIsSaving] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   async function handleSave() {
      if (!apiKey.trim()) return;
      setError(null);
      setSuccess(null);
      setIsSaving(true);

      try {
         const res = await fetch('/api/user/claude-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey }),
         });

         if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            setError(body.error ?? 'Failed to save API key');
            return;
         }

         setHasKey(true);
         setApiKey('');
         setSuccess('API key saved successfully');
      } catch {
         setError('Network error — please try again');
      } finally {
         setIsSaving(false);
      }
   }

   async function handleDelete() {
      setError(null);
      setSuccess(null);
      setIsDeleting(true);

      try {
         const res = await fetch('/api/user/claude-key', { method: 'DELETE' });

         if (!res.ok) {
            const body = (await res.json()) as { error?: string };
            setError(body.error ?? 'Failed to remove API key');
            return;
         }

         setHasKey(false);
         setSuccess('API key removed');
      } catch {
         setError('Network error — please try again');
      } finally {
         setIsDeleting(false);
      }
   }

   return (
      <div className="space-y-4">
         <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium">Claude API Key</h3>
            {hasKey ? (
               <Badge variant="default">Connected</Badge>
            ) : (
               <Badge variant="outline">Not connected</Badge>
            )}
         </div>

         <p className="text-sm text-muted-foreground">
            Your key is used to run AI tasks on your behalf. It is stored encoded at rest and never
            exposed in responses.
         </p>

         {!hasKey ? (
            <div className="space-y-3">
               <div className="space-y-1.5">
                  <Label htmlFor="claude-api-key">API key</Label>
                  <Input
                     id="claude-api-key"
                     type="password"
                     placeholder="sk-ant-..."
                     value={apiKey}
                     onChange={(e) => setApiKey(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                     }}
                  />
               </div>
               <Button onClick={handleSave} disabled={isSaving || !apiKey.trim()} size="sm">
                  {isSaving ? 'Saving...' : 'Save key'}
               </Button>
            </div>
         ) : (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
               {isDeleting ? 'Removing...' : 'Disconnect key'}
            </Button>
         )}

         {error && <p className="text-sm text-destructive">{error}</p>}
         {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
      </div>
   );
}
