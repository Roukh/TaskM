import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
  real,
  customType,
} from 'drizzle-orm/pg-core';

// pgvector must be enabled once in Neon console:
//   CREATE EXTENSION IF NOT EXISTS vector;
const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === 'string') {
      return value
        .slice(1, -1)
        .split(',')
        .map(Number);
    }
    return value as number[];
  },
});

// ── Enums ─────────────────────────────────────────────────────────────────────

export const nodeLabelEnum = pgEnum('node_label', [
  'Function',
  'Component',
  'Endpoint',
  'DatabaseModel',
]);

export const nodeStatusEnum = pgEnum('node_status', [
  'PLANNED',
  'CURRENT',
  'DEPRECATED',
]);

export const edgeRelationEnum = pgEnum('edge_relation', [
  'CALLS',
  'IMPORTS',
  'IMPLEMENTS',
  'MUTATES',
]);

export const memriCategoryEnum = pgEnum('memri_category', [
  'sop',
  'memory',
  'issue',
]);

// ── BetterAuth tables (do not modify base columns) ────────────────────────────

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  githubOauthToken: text('github_oauth_token'),
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

// ── App tables ────────────────────────────────────────────────────────────────

export const projects = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    repoPath: text('repo_path').notNull(),
    defaultBranch: text('default_branch').notNull().default('main'),
    githubRepo: text('github_repo'),
    apiKey: text('api_key'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [index('idx_projects_user').on(t.userId)]
);

// ── Graph snapshots (serialized PLANNED state — version history) ──────────────

export const graphSnapshots = pgTable(
  'graph_snapshots',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    branch: text('branch').notNull(),
    commitSha: text('commit_sha'),
    snapshot: jsonb('snapshot').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('idx_snapshots_project_branch').on(t.projectId, t.branch),
    index('idx_snapshots_commit').on(t.commitSha),
  ]
);

// ── Graph nodes ───────────────────────────────────────────────────────────────

export const nodes = pgTable(
  'nodes',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    branch: text('branch').notNull(),
    label: nodeLabelEnum('label').notNull(),
    name: text('name').notNull(),
    status: nodeStatusEnum('status').notNull().default('PLANNED'),
    filePath: text('file_path'),
    metadata: jsonb('metadata'),
    embedding: vector('embedding', { dimensions: 1536 }),
    canvasX: real('canvas_x'),
    canvasY: real('canvas_y'),
    commitSha: text('commit_sha'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('idx_nodes_project_branch').on(t.projectId, t.branch),
    index('idx_nodes_status').on(t.projectId, t.branch, t.status),
  ]
);

// ── Graph edges ───────────────────────────────────────────────────────────────

export const edges = pgTable(
  'edges',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    branch: text('branch').notNull(),
    sourceId: text('source_id')
      .notNull()
      .references(() => nodes.id, { onDelete: 'cascade' }),
    targetId: text('target_id')
      .notNull()
      .references(() => nodes.id, { onDelete: 'cascade' }),
    relation: edgeRelationEnum('relation').notNull(),
    status: nodeStatusEnum('status').notNull().default('PLANNED'),
    commitSha: text('commit_sha'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('idx_edges_project_branch').on(t.projectId, t.branch),
    index('idx_edges_source').on(t.sourceId),
    index('idx_edges_target').on(t.targetId),
  ]
);

// ── MemRI entries ─────────────────────────────────────────────────────────────

export const memri = pgTable(
  'memri',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    category: memriCategoryEnum('category').notNull(),
    content: text('content').notNull(),
    targetNodeId: text('target_node_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index('idx_memri_project').on(t.projectId),
    index('idx_memri_node').on(t.targetNodeId),
  ]
);

// ── Inferred types ────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type Verification = typeof verification.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type GraphSnapshot = typeof graphSnapshots.$inferSelect;
export type Node = typeof nodes.$inferSelect;
export type Edge = typeof edges.$inferSelect;
export type Memri = typeof memri.$inferSelect;

export type NodeLabel = (typeof nodeLabelEnum.enumValues)[number];
export type NodeStatus = (typeof nodeStatusEnum.enumValues)[number];
export type EdgeRelation = (typeof edgeRelationEnum.enumValues)[number];
export type MemriCategory = (typeof memriCategoryEnum.enumValues)[number];
