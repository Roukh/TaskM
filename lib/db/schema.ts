import {
   pgTable,
   uuid,
   text,
   smallint,
   jsonb,
   timestamp,
   boolean,
   index,
} from 'drizzle-orm/pg-core';

// ── BetterAuth tables ─────────────────────────────────────────────────────────
// Owned by better-auth. Do not modify base columns or types.
// Additional app columns appended below the required BetterAuth set.

export const user = pgTable('user', {
   id: text('id').primaryKey(),
   name: text('name').notNull(),
   email: text('email').notNull().unique(),
   emailVerified: boolean('emailVerified').notNull(),
   image: text('image'),
   createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
   updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
   // App-owned extensions — nullable so BetterAuth sign-up still works
   githubOauthToken: text('github_oauth_token'),
   claudeOauthToken: text('claude_oauth_token'),
   claudeApiKey: text('claude_api_key'),
});

export const session = pgTable('session', {
   id: text('id').primaryKey(),
   expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
   token: text('token').notNull().unique(),
   createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
   updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
   ipAddress: text('ipAddress'),
   userAgent: text('userAgent'),
   userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
   id: text('id').primaryKey(),
   accountId: text('accountId').notNull(),
   providerId: text('providerId').notNull(),
   userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
   accessToken: text('accessToken'),
   refreshToken: text('refreshToken'),
   idToken: text('idToken'),
   accessTokenExpiresAt: timestamp('accessTokenExpiresAt', { withTimezone: true }),
   refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', { withTimezone: true }),
   scope: text('scope'),
   password: text('password'),
   createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
   updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
});

export const verification = pgTable('verification', {
   id: text('id').primaryKey(),
   identifier: text('identifier').notNull(),
   value: text('value').notNull(),
   expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
   createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
   updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
});

// ── Core tables ───────────────────────────────────────────────────────────────
// layers table removed — layers are a hardcoded enum (0–4) in application code.
// Layer progress is computed: COUNT(status='complete') / COUNT(*) per layer_index.

export const projects = pgTable(
   'projects',
   {
      id: text('id').primaryKey(), // slug: 'ghobz-realtor', 'taskm-core'
      userId: text('user_id')
         .notNull()
         .references(() => user.id, { onDelete: 'cascade' }),
      name: text('name').notNull(),
      type: text('type').notNull().default('custom'), // 'next-app'|'python-api'|'ghobz-site'|'custom'
      state: text('state').notNull().default('not-started'), // 'not-started'|'in-progress'|'complete'|'blocked'
      goal: text('goal'),
      githubRepo: text('github_repo'), // 'owner/repo-name'
      layerLocked: jsonb('layer_locked').default({}), // {"0": "ISO ts", "2": "ISO ts"}
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [index('idx_projects_user').on(t.userId)]
);

// jobs defined before logs so logs can FK → jobs.id
export const jobs = pgTable(
   'jobs',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      layerIndex: smallint('layer_index').notNull(),
      status: text('status').notNull().default('queued'), // 'queued'|'running'|'done'|'failed'
      error: text('error'),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
      startedAt: timestamp('started_at', { withTimezone: true }),
      finishedAt: timestamp('finished_at', { withTimezone: true }),
   },
   (t) => [index('idx_jobs_status').on(t.status, t.createdAt)]
);

export const tasks = pgTable(
   'tasks',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      layerIndex: smallint('layer_index').notNull(), // 0–4, references hardcoded layer enum
      title: text('title').notNull(),
      description: text('description'),
      status: text('status').notNull().default('todo'), // 'todo'|'in-progress'|'complete'|'blocked'
      priority: text('priority').notNull().default('medium'), // 'low'|'medium'|'high'|'urgent'
      audience: text('audience').notNull().default('llm'), // 'llm' = agent task | 'user' = human task
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [
      index('idx_tasks_project_layer').on(t.projectId, t.layerIndex),
      index('idx_tasks_status').on(t.projectId, t.layerIndex, t.status),
   ]
);

// Append-only event stream — never updated, never deleted
export const logs = pgTable(
   'logs',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      layerIndex: smallint('layer_index'),
      jobId: uuid('job_id').references(() => jobs.id),
      type: text('type').notNull(), // 'layer_start'|'layer_complete'|'task_done'|'atom_written'|'response'|'error'
      summary: text('summary').notNull(),
      metadata: jsonb('metadata').default({}),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [index('idx_logs_project').on(t.projectId, t.createdAt)]
);

// ── Layer 0: Infrastructure ───────────────────────────────────────────────────

export const stackEntries = pgTable(
   'stack_entries',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      stackCategory: text('stack_category').notNull(), // 'framework'|'db'|'hosting'|'auth'|'integration'
      name: text('name').notNull(),
      version: text('version'),
      icon: text('icon'),
      url: text('url'),
   },
   (t) => [index('idx_stack_entries_project').on(t.projectId)]
);

// ── Layer 1: Discovery ────────────────────────────────────────────────────────

export const specs = pgTable(
   'specs',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      category: text('category').notNull(), // 'goal'|'constraint'|'decision'|'persona'|'user-flow'|'sitemap-page'
      key: text('key').notNull(),
      value: text('value').notNull(),
      metadata: jsonb('metadata').default({}),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [index('idx_specs_project_category').on(t.projectId, t.category)]
);

// ── Layer 2: Frontend — Token tables ─────────────────────────────────────────

export const globalColors = pgTable('global_colors', {
   id: uuid('id').defaultRandom().primaryKey(),
   projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
   name: text('name').notNull(),
   value: text('value').notNull(), // hex/rgba/oklch
   role: text('role'), // 'primary'|'secondary'|'destructive'|'muted'|'accent'|etc.
});

export const globalFonts = pgTable('global_fonts', {
   id: uuid('id').defaultRandom().primaryKey(),
   projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
   name: text('name').notNull(),
   family: text('family').notNull(), // CSS font-family
   role: text('role'), // 'body'|'heading'|'mono'
});

export const globalFontSizes = pgTable('global_font_sizes', {
   id: uuid('id').defaultRandom().primaryKey(),
   projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
   name: text('name').notNull(), // 'xs'|'sm'|'base'|'lg'|'xl'|'2xl'|etc.
   value: text('value').notNull(), // CSS value (rem/px)
});

export const globalSpacings = pgTable('global_spacings', {
   id: uuid('id').defaultRandom().primaryKey(),
   projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
   name: text('name').notNull(),
   value: text('value').notNull(),
});

export const globalRadii = pgTable('global_radii', {
   id: uuid('id').defaultRandom().primaryKey(),
   projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
   name: text('name').notNull(), // 'sm'|'md'|'lg'|'full'
   value: text('value').notNull(),
});

export const globalShadows = pgTable('global_shadows', {
   id: uuid('id').defaultRandom().primaryKey(),
   projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
   name: text('name').notNull(), // 'sm'|'md'|'lg'
   value: text('value').notNull(), // CSS box-shadow value
});

// ── Layer 2: Frontend — Atoms ─────────────────────────────────────────────────
// Atoms define what they ARE (style, type) — NOT what they say (content).
// Label/text content goes in component_atoms.props as a contextual adaptation.

export const atoms = pgTable(
   'atoms',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      family: text('family').notNull(), // grouping: 'primary-button', 'nav-link', 'form-input'
      atomType: text('atom_type').notNull(), // 'button'|'link'|'icon'|'input'|'label'|'badge'|'image'|'divider'|'text'
      icon: text('icon'), // lucide icon name
      size: text('size'), // 'xs'|'sm'|'md'|'lg'|'xl'
      variant: text('variant'), // 'default'|'secondary'|'outline'|'ghost'|'destructive'
      interactive: boolean('interactive').notNull().default(false),
      ariaLabel: text('aria_label'),
      colorId: uuid('color_id').references(() => globalColors.id),
      bgColorId: uuid('bg_color_id').references(() => globalColors.id),
      fontId: uuid('font_id').references(() => globalFonts.id),
      fontSizeId: uuid('font_size_id').references(() => globalFontSizes.id),
      radiusId: uuid('radius_id').references(() => globalRadii.id),
      shadowId: uuid('shadow_id').references(() => globalShadows.id),
      borderColorId: uuid('border_color_id').references(() => globalColors.id),
      borderWidth: smallint('border_width'), // 0, 1, 2, 4
      padding: text('padding'), // CSS shorthand e.g. '4px 12px'
      props: jsonb('props').default({}), // type-specific: href/target (link), src/alt (image), placeholder (input)
      lockedAt: timestamp('locked_at', { withTimezone: true }),
   },
   (t) => [index('idx_atoms_project').on(t.projectId)]
);

// ── Layer 2: Frontend — Components ───────────────────────────────────────────

export const components = pgTable(
   'components',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      name: text('name').notNull(), // unique identifier: 'primary-nav', 'hero-section'
      family: text('family'), // 'nav'|'hero'|'footer'|'card'|'form'
      description: text('description'),
      lockedAt: timestamp('locked_at', { withTimezone: true }),
      props: jsonb('props').default({}),
   },
   (t) => [index('idx_components_project').on(t.projectId)]
);

// Junction: which atoms compose a component.
// label/text content belongs in props here, NOT on the atom itself.
export const componentAtoms = pgTable('component_atoms', {
   id: uuid('id').defaultRandom().primaryKey(),
   componentId: uuid('component_id')
      .notNull()
      .references(() => components.id, { onDelete: 'cascade' }),
   atomId: uuid('atom_id')
      .notNull()
      .references(() => atoms.id, { onDelete: 'cascade' }),
   order: smallint('order').notNull(),
   props: jsonb('props').default({}), // label, full_width, flex_grow, alignment, gap, etc.
});

// ── Layer 2: Frontend — Sitemap ───────────────────────────────────────────────

export const pages = pgTable(
   'pages',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      path: text('path').notNull(), // '/'|'/about'|'/projects/[id]'
      name: text('name').notNull(),
      description: text('description'),
      lockedAt: timestamp('locked_at', { withTimezone: true }),
   },
   (t) => [index('idx_pages_project').on(t.projectId)]
);

// Junction: which components appear on which pages, with placement config.
export const pageComponents = pgTable('page_components', {
   id: uuid('id').defaultRandom().primaryKey(),
   pageId: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
   componentId: uuid('component_id')
      .notNull()
      .references(() => components.id, { onDelete: 'cascade' }),
   order: smallint('order').notNull(),
   sticky: boolean('sticky').notNull().default(false),
   fullWidth: boolean('full_width').notNull().default(false),
   bgColorId: uuid('bg_color_id').references(() => globalColors.id),
   paddingY: text('padding_y'),
   sectionId: text('section_id'), // HTML id for anchor nav
   mobileHidden: boolean('mobile_hidden').notNull().default(false),
   animation: text('animation'), // 'none'|'fade-up'|'fade-in'|'slide'
   placementProps: jsonb('placement_props').default({}),
});

// ── Layer 3: Backend ──────────────────────────────────────────────────────────

export const backendAtoms = pgTable(
   'backend_atoms',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      atomType: text('atom_type').notNull(), // 'db-table'|'db-column'|'db-relation'|'endpoint'|'migration'|'service'
      name: text('name').notNull(),
      dbType: text('db_type'), // 'sql'|'nosql'|'vector'|'kv'
      method: text('method'), // 'GET'|'POST'|'PUT'|'DELETE'|'PATCH'
      path: text('path'),
      lockedAt: timestamp('locked_at', { withTimezone: true }),
      props: jsonb('props').default({}),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [index('idx_backend_atoms_project').on(t.projectId, t.atomType)]
);

// ── Layer 4: QA ───────────────────────────────────────────────────────────────

// Product-defined template rows — seeded once, not scoped to a project
export const qaTemplates = pgTable('qa_templates', {
   id: uuid('id').defaultRandom().primaryKey(),
   order: smallint('order').notNull(),
   category: text('category').notNull(), // 'accessibility'|'performance'|'security'|'ux'|'code-quality'
   title: text('title').notNull(),
   description: text('description'),
});

// Per-project checklist — copied from qa_templates on project creation
export const checklist = pgTable(
   'checklist',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      templateId: uuid('template_id').references(() => qaTemplates.id),
      title: text('title').notNull(),
      category: text('category').notNull(),
      order: smallint('order').notNull(),
      passed: boolean('passed').notNull().default(false),
      passedAt: timestamp('passed_at', { withTimezone: true }),
      passedBy: text('passed_by'), // 'agent'|'human'
   },
   (t) => [index('idx_checklist_project').on(t.projectId)]
);

// ── Rules (global, user-scoped — not per project) ────────────────────────────

export const rules = pgTable(
   'rules',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      userId: text('user_id')
         .notNull()
         .references(() => user.id, { onDelete: 'cascade' }),
      name: text('name').notNull(),
      description: text('description'),
      content: text('content').notNull(),
      layerIndex: smallint('layer_index'), // null = applies to all layers
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
      updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [index('idx_rules_user').on(t.userId)]
);

// ── Layer 0: Discovery — Q&A ──────────────────────────────────────────────────

export const discoveryQuestions = pgTable('discovery_questions', {
   id: uuid('id').defaultRandom().primaryKey(),
   order: smallint('order').notNull(),
   key: text('key').notNull().unique(),
   question: text('question').notNull(),
   description: text('description'),
   required: boolean('required').notNull().default(true),
});

export const discoveryAnswers = pgTable(
   'discovery_answers',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      questionId: uuid('question_id')
         .notNull()
         .references(() => discoveryQuestions.id),
      answer: text('answer'),
      answeredBy: text('answered_by'), // 'agent' | 'human'
      answeredAt: timestamp('answered_at', { withTimezone: true }),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [index('idx_discovery_answers_project').on(t.projectId)]
);

// ── Layer 1: Infrastructure — Repo file tree ──────────────────────────────────

export const repoFiles = pgTable(
   'repo_files',
   {
      id: uuid('id').defaultRandom().primaryKey(),
      projectId: text('project_id')
         .notNull()
         .references(() => projects.id, { onDelete: 'cascade' }),
      path: text('path').notNull(), // relative: 'src/app/page.tsx'
      type: text('type').notNull(), // 'file' | 'dir'
      depth: smallint('depth').notNull().default(0),
      order: smallint('order').notNull(),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
   },
   (t) => [index('idx_repo_files_project').on(t.projectId, t.order)]
);

// ── Inferred types ────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Log = typeof logs.$inferSelect;
export type StackEntry = typeof stackEntries.$inferSelect;
export type Spec = typeof specs.$inferSelect;
export type GlobalColor = typeof globalColors.$inferSelect;
export type GlobalFont = typeof globalFonts.$inferSelect;
export type GlobalFontSize = typeof globalFontSizes.$inferSelect;
export type GlobalSpacing = typeof globalSpacings.$inferSelect;
export type GlobalRadius = typeof globalRadii.$inferSelect;
export type GlobalShadow = typeof globalShadows.$inferSelect;
export type Atom = typeof atoms.$inferSelect;
export type Component = typeof components.$inferSelect;
export type ComponentAtom = typeof componentAtoms.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type PageComponent = typeof pageComponents.$inferSelect;
export type BackendAtom = typeof backendAtoms.$inferSelect;
export type QaTemplate = typeof qaTemplates.$inferSelect;
export type Checklist = typeof checklist.$inferSelect;
export type Rule = typeof rules.$inferSelect;
export type DiscoveryQuestion = typeof discoveryQuestions.$inferSelect;
export type DiscoveryAnswer = typeof discoveryAnswers.$inferSelect;
export type RepoFile = typeof repoFiles.$inferSelect;
