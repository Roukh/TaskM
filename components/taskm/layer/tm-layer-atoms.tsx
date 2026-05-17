'use client';

import { useState } from 'react';
import { LayerIndex } from '@/types/taskm';
import type {
   StackEntry,
   RepoFile,
   Atom,
   Page,
   Component,
   PageComponent,
   ComponentAtom,
   BackendAtom,
} from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, File, Folder, Database, Globe } from 'lucide-react';

// ── Shared empty state ─────────────────────────────────────────────────────────

function EmptyState({ message, hint }: { message: string; hint: string }) {
   return (
      <div className="flex flex-col items-center justify-center h-48 gap-2 text-sm text-muted-foreground">
         <p>{message}</p>
         <p className="text-xs">{hint}</p>
      </div>
   );
}

// ── Layer 1 (Infrastructure): Stack ───────────────────────────────────────────

const CATEGORY_ORDER = ['framework', 'ui', 'db', 'auth', 'hosting', 'integration'];

function StackRow({ entry }: { entry: StackEntry }) {
   return (
      <div className="flex items-center gap-4 py-2.5 px-6 border-b border-muted-foreground/5 text-sm hover:bg-sidebar/30">
         <span className="w-28 shrink-0 text-xs font-mono text-muted-foreground capitalize">
            {entry.stackCategory}
         </span>
         <span className="flex-1 font-medium">{entry.name}</span>
         {entry.version && (
            <span className="text-xs text-muted-foreground font-mono">{entry.version}</span>
         )}
         {entry.url && (
            <a
               href={entry.url}
               target="_blank"
               rel="noopener noreferrer"
               className="text-muted-foreground hover:text-foreground"
               onClick={(e) => e.stopPropagation()}
            >
               <Globe className="size-3" />
            </a>
         )}
      </div>
   );
}

function LayerInfrastructure({ stackEntries }: { stackEntries: StackEntry[] }) {
   if (stackEntries.length === 0) {
      return (
         <EmptyState
            message="No stack entries yet."
            hint="Agents declare the project stack here."
         />
      );
   }

   const byCategory = stackEntries.reduce<Record<string, StackEntry[]>>((acc, e) => {
      return { ...acc, [e.stackCategory]: [...(acc[e.stackCategory] ?? []), e] };
   }, {});

   const sortedCategories = [
      ...CATEGORY_ORDER.filter((c) => byCategory[c]),
      ...Object.keys(byCategory).filter((c) => !CATEGORY_ORDER.includes(c)),
   ];

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10">
            {stackEntries.length} entries
         </div>
         {sortedCategories.map((cat) => (
            <div key={cat} className="w-full">
               <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {cat}
               </div>
               {byCategory[cat]!.map((e) => (
                  <StackRow key={e.id} entry={e} />
               ))}
            </div>
         ))}
      </div>
   );
}

// ── Layer 1 (Infrastructure): Repo file tree ───────────────────────────────────

function RepoFileRow({ file }: { file: RepoFile }) {
   const isDir = file.type === 'dir';
   const name = file.path.split('/').pop() ?? file.path;
   return (
      <div
         className="flex items-center gap-2 py-1.5 px-6 border-b border-muted-foreground/5 text-sm hover:bg-sidebar/30"
         style={{ paddingLeft: `${24 + file.depth * 16}px` }}
      >
         {isDir ? (
            <Folder className="size-3.5 shrink-0 text-yellow-500/80" />
         ) : (
            <File className="size-3.5 shrink-0 text-muted-foreground" />
         )}
         <span className={cn('text-sm', isDir && 'font-medium')}>{name}</span>
      </div>
   );
}

function LayerRepo({ repoFiles }: { repoFiles: RepoFile[] }) {
   if (repoFiles.length === 0) {
      return (
         <EmptyState
            message="No repo structure yet."
            hint="Agent reads the GitHub repo and writes the file tree here."
         />
      );
   }
   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10">
            {repoFiles.length} entries
         </div>
         {repoFiles.map((f) => (
            <RepoFileRow key={f.id} file={f} />
         ))}
      </div>
   );
}

// ── Layer 2 (Frontend): Sitemap ────────────────────────────────────────────────

function AtomDropdown({ atoms }: { atoms: Atom[] }) {
   const [open, setOpen] = useState(false);
   if (atoms.length === 0) return null;
   return (
      <div className="ml-4 mt-1">
         <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-0.5"
         >
            {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
            {atoms.length} atom{atoms.length !== 1 ? 's' : ''}
         </button>
         {open && (
            <div className="ml-4 mt-1 space-y-0.5">
               {atoms.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 text-xs py-0.5">
                     <span className="font-mono text-muted-foreground w-16 truncate">
                        {a.atomType}
                     </span>
                     <span>{a.family}</span>
                     {a.variant && <span className="text-muted-foreground">({a.variant})</span>}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

function ComponentCard({
   component,
   componentAtoms,
   atoms,
}: {
   component: Component;
   componentAtoms: ComponentAtom[];
   atoms: Atom[];
}) {
   const myAtomIds = new Set(
      componentAtoms.filter((ca) => ca.componentId === component.id).map((ca) => ca.atomId)
   );
   const myAtoms = atoms.filter((a) => myAtomIds.has(a.id));
   return (
      <div className="ml-6 mt-1 border-l border-muted-foreground/10 pl-4">
         <div className="text-sm font-medium py-1">{component.name}</div>
         {component.description && (
            <p className="text-xs text-muted-foreground mb-1">{component.description}</p>
         )}
         <AtomDropdown atoms={myAtoms} />
      </div>
   );
}

function PageSection({
   page,
   pageComponents,
   components,
   componentAtoms,
   atoms,
}: {
   page: Page;
   pageComponents: PageComponent[];
   components: Component[];
   componentAtoms: ComponentAtom[];
   atoms: Atom[];
}) {
   const [open, setOpen] = useState(true);
   const pageCompIds = pageComponents
      .filter((pc) => pc.pageId === page.id)
      .sort((a, b) => a.order - b.order)
      .map((pc) => pc.componentId);
   const pageComps = pageCompIds
      .map((id) => components.find((c) => c.id === id))
      .filter(Boolean) as Component[];

   return (
      <div className="border-b border-muted-foreground/5 px-6 py-3">
         <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 w-full text-left"
         >
            {open ? (
               <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
               <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
            <span className="font-medium text-sm">{page.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{page.path}</span>
            <span className="text-xs text-muted-foreground ml-auto">
               {pageComps.length} component{pageComps.length !== 1 ? 's' : ''}
            </span>
         </button>
         {open && pageComps.length > 0 && (
            <div className="mt-2">
               {pageComps.map((comp) => (
                  <ComponentCard
                     key={comp.id}
                     component={comp}
                     componentAtoms={componentAtoms}
                     atoms={atoms}
                  />
               ))}
            </div>
         )}
         {open && pageComps.length === 0 && (
            <p className="ml-6 mt-1 text-xs text-muted-foreground italic">
               No components assigned yet.
            </p>
         )}
      </div>
   );
}

function LayerFrontend({
   atoms,
   pages,
   components,
   pageComponents,
   componentAtoms,
}: {
   atoms: Atom[];
   pages: Page[];
   components: Component[];
   pageComponents: PageComponent[];
   componentAtoms: ComponentAtom[];
}) {
   if (pages.length === 0 && atoms.length === 0) {
      return (
         <EmptyState
            message="No sitemap yet."
            hint="Agents build the page and component structure here."
         />
      );
   }

   const sortedPages = [...pages].sort((a, b) => a.path.localeCompare(b.path));

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10">
            {pages.length} page{pages.length !== 1 ? 's' : ''} · {components.length} component
            {components.length !== 1 ? 's' : ''} · {atoms.length} atom
            {atoms.length !== 1 ? 's' : ''}
         </div>
         {sortedPages.map((page) => (
            <PageSection
               key={page.id}
               page={page}
               pageComponents={pageComponents}
               components={components}
               componentAtoms={componentAtoms}
               atoms={atoms}
            />
         ))}
      </div>
   );
}

// ── Layer 3 (Backend): Schema ──────────────────────────────────────────────────

function DbTableSection({
   tableName,
   columns,
   relations,
}: {
   tableName: string;
   columns: BackendAtom[];
   relations: BackendAtom[];
}) {
   const [open, setOpen] = useState(true);
   type ColProps = {
      type?: string;
      nullable?: boolean;
      primary?: boolean;
      unique?: boolean;
      default?: string;
   };

   return (
      <div className="border-b border-muted-foreground/5 px-6 py-3">
         <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 w-full text-left"
         >
            {open ? (
               <ChevronDown className="size-3.5 text-muted-foreground" />
            ) : (
               <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
            <Database className="size-3.5 text-muted-foreground" />
            <span className="font-mono font-medium text-sm">{tableName}</span>
            <span className="text-xs text-muted-foreground ml-auto">
               {columns.length} col{columns.length !== 1 ? 's' : ''}
               {relations.length > 0 &&
                  ` · ${relations.length} relation${relations.length !== 1 ? 's' : ''}`}
            </span>
         </button>
         {open && (
            <div className="mt-2 ml-6 space-y-0.5">
               {columns.map((col) => {
                  const p = (col.props ?? {}) as ColProps;
                  return (
                     <div key={col.id} className="flex items-center gap-3 text-xs py-0.5">
                        <span className="font-mono w-40 truncate text-foreground">{col.name}</span>
                        <span className="font-mono text-blue-400/90 w-28 truncate">
                           {p.type ?? '—'}
                        </span>
                        <span className="text-muted-foreground space-x-1">
                           {p.primary && <span className="text-yellow-500">PK</span>}
                           {p.unique && <span>UQ</span>}
                           {p.nullable && <span>NULL</span>}
                           {p.default !== undefined && <span className="italic">={p.default}</span>}
                        </span>
                     </div>
                  );
               })}
               {relations.map((rel) => (
                  <div
                     key={rel.id}
                     className="flex items-center gap-3 text-xs py-0.5 text-muted-foreground italic"
                  >
                     <span className="font-mono w-40 truncate">→ {rel.name}</span>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}

function LayerBackend({ backendAtoms }: { backendAtoms: BackendAtom[] }) {
   if (backendAtoms.length === 0) {
      return (
         <EmptyState
            message="No backend schema yet."
            hint="Tables, endpoints, and services appear here."
         />
      );
   }

   const tables = backendAtoms.filter((a) => a.atomType === 'db-table');
   const columns = backendAtoms.filter((a) => a.atomType === 'db-column');
   const relations = backendAtoms.filter((a) => a.atomType === 'db-relation');
   const endpoints = backendAtoms.filter((a) => a.atomType === 'endpoint');
   const others = backendAtoms.filter(
      (a) => !['db-table', 'db-column', 'db-relation', 'endpoint'].includes(a.atomType)
   );

   type ColProps = { table?: string };

   return (
      <div className="w-full">
         <div className="bg-container px-6 py-1.5 text-xs text-muted-foreground border-b sticky top-0 z-10">
            {tables.length} table{tables.length !== 1 ? 's' : ''} · {endpoints.length} endpoint
            {endpoints.length !== 1 ? 's' : ''}
         </div>

         {tables.length > 0 && (
            <>
               <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Database Tables
               </div>
               {tables.map((t) => (
                  <DbTableSection
                     key={t.id}
                     tableName={t.name}
                     columns={columns.filter((c) => (c.props as ColProps)?.table === t.name)}
                     relations={relations.filter((r) => (r.props as ColProps)?.table === t.name)}
                  />
               ))}
            </>
         )}

         {endpoints.length > 0 && (
            <>
               <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  API Endpoints
               </div>
               {endpoints.map((e) => (
                  <div
                     key={e.id}
                     className="flex items-center gap-4 py-2.5 px-6 border-b border-muted-foreground/5 text-sm hover:bg-sidebar/30"
                  >
                     {e.method && (
                        <span
                           className={cn(
                              'text-xs font-mono font-semibold w-14 shrink-0',
                              e.method === 'GET' && 'text-green-500',
                              e.method === 'POST' && 'text-blue-500',
                              e.method === 'PUT' && 'text-yellow-500',
                              e.method === 'DELETE' && 'text-red-500',
                              e.method === 'PATCH' && 'text-orange-500'
                           )}
                        >
                           {e.method}
                        </span>
                     )}
                     <span className="font-mono text-sm flex-1">{e.path ?? e.name}</span>
                  </div>
               ))}
            </>
         )}

         {others.length > 0 && (
            <>
               <div className="px-6 py-1.5 bg-muted/30 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Services &amp; Other
               </div>
               {others.map((o) => (
                  <div
                     key={o.id}
                     className="flex items-center gap-4 py-2.5 px-6 border-b border-muted-foreground/5 text-sm hover:bg-sidebar/30"
                  >
                     <span className="w-24 shrink-0 text-xs font-mono text-muted-foreground">
                        {o.atomType}
                     </span>
                     <span className="flex-1">{o.name}</span>
                  </div>
               ))}
            </>
         )}
      </div>
   );
}

// ── Router ─────────────────────────────────────────────────────────────────────

interface Props {
   layerIndex: LayerIndex;
   view?: 'repo';
   // Layer 1
   stackEntries?: StackEntry[];
   repoFiles?: RepoFile[];
   // Layer 2
   atoms?: Atom[];
   pages?: Page[];
   components?: Component[];
   pageComponents?: PageComponent[];
   componentAtoms?: ComponentAtom[];
   // Layer 3
   backendAtoms?: BackendAtom[];
}

export default function TmLayerAtoms({
   layerIndex,
   view,
   stackEntries = [],
   repoFiles = [],
   atoms = [],
   pages = [],
   components = [],
   pageComponents = [],
   componentAtoms = [],
   backendAtoms = [],
}: Props) {
   if (layerIndex === 1 && view === 'repo') {
      return <LayerRepo repoFiles={repoFiles} />;
   }
   switch (layerIndex) {
      case 1:
         return <LayerInfrastructure stackEntries={stackEntries} />;
      case 2:
         return (
            <LayerFrontend
               atoms={atoms}
               pages={pages}
               components={components}
               pageComponents={pageComponents}
               componentAtoms={componentAtoms}
            />
         );
      case 3:
         return <LayerBackend backendAtoms={backendAtoms} />;
      default:
         return null;
   }
}
