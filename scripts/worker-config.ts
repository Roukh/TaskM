export const WORKER_CONFIG = {
   pollIntervalMs: 5000,
   jobTimeoutMs: 300_000, // 5 min max per job
} as const;
