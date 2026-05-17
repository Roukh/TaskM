'use client';

import { useState, useTransition } from 'react';
import type { DiscoveryQuestion, DiscoveryAnswer } from '@/lib/db/schema';
import { upsertDiscoveryAnswer } from '@/lib/actions/discovery';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Pencil, X } from 'lucide-react';

interface QuestionRowProps {
   question: DiscoveryQuestion;
   answer: DiscoveryAnswer | undefined;
   projectId: string;
}

function QuestionRow({ question, answer, projectId }: QuestionRowProps) {
   const [editing, setEditing] = useState(false);
   const [draft, setDraft] = useState(answer?.answer ?? '');
   const [current, setCurrent] = useState(answer?.answer ?? null);
   const [isPending, startTransition] = useTransition();

   function save() {
      const trimmed = draft.trim();
      startTransition(async () => {
         const result = await upsertDiscoveryAnswer({
            projectId,
            questionId: question.id,
            answer: trimmed,
         });
         if ('answer' in result) {
            setCurrent(result.answer.answer ?? null);
            setEditing(false);
         }
      });
   }

   function cancel() {
      setDraft(current ?? '');
      setEditing(false);
   }

   return (
      <div className="border-b border-muted-foreground/5 px-6 py-4 hover:bg-sidebar/20">
         <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-mono text-muted-foreground">{question.key}</span>
               </div>
               <p className="text-sm font-medium leading-snug">{question.question}</p>
               {question.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                     {question.description}
                  </p>
               )}
            </div>
            {!editing && (
               <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditing(true)}
               >
                  <Pencil className="size-3" />
               </Button>
            )}
         </div>

         {editing ? (
            <div className="flex flex-col gap-2 mt-2">
               <Textarea
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write your answer…"
                  className="text-sm min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                     if (e.key === 'Escape') cancel();
                     if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
                  }}
               />
               <div className="flex items-center gap-2">
                  <Button
                     size="sm"
                     className="h-7 gap-1 text-xs"
                     onClick={save}
                     disabled={isPending}
                  >
                     <Check className="size-3" />
                     Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={cancel}>
                     <X className="size-3" />
                     Cancel
                  </Button>
                  <span className="text-xs text-muted-foreground ml-auto">⌘↵ to save</span>
               </div>
            </div>
         ) : (
            <div
               className={cn(
                  'mt-2 text-sm leading-relaxed cursor-pointer rounded px-2 py-1.5 -mx-2',
                  current
                     ? 'text-foreground hover:bg-muted/40'
                     : 'text-muted-foreground italic hover:bg-muted/40'
               )}
               onClick={() => setEditing(true)}
            >
               {current || 'No answer yet — click to add one.'}
            </div>
         )}

         {answer?.answeredBy && !editing && (
            <div className="mt-1 text-xs text-muted-foreground">
               Answered by {answer.answeredBy}
               {answer.answeredAt && <> · {new Date(answer.answeredAt).toLocaleDateString()}</>}
            </div>
         )}
      </div>
   );
}

interface Props {
   projectId: string;
   questions: DiscoveryQuestion[];
   answers: DiscoveryAnswer[];
}

export default function TmLayerDiscovery({ projectId, questions, answers }: Props) {
   const answerMap = new Map(answers.map((a) => [a.questionId, a]));
   const answered = answers.filter((a) => a.answer).length;

   if (questions.length === 0) {
      return (
         <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
            <p>No discovery questions configured.</p>
            <p className="text-xs">Run db:seed to populate the question set.</p>
         </div>
      );
   }

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs flex items-center justify-between text-muted-foreground border-b sticky top-0 z-10">
            <span>
               {answered}/{questions.length} answered
            </span>
         </div>
         {questions.map((q) => (
            <QuestionRow
               key={q.id}
               question={q}
               answer={answerMap.get(q.id)}
               projectId={projectId}
            />
         ))}
      </div>
   );
}
