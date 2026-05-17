# TaskM Worker

The VPS worker polls the `jobs` table and executes layer agents.

## Setup

1. Copy `.env.local` to the VPS (or set env vars directly — `DATABASE_URL` is required)
2. Install deps: `pnpm install --prod`

## Run

```bash
pnpm worker
```

Development (auto-restart on file change):

```bash
pnpm worker:dev
```

## Systemd service (production)

```ini
[Unit]
Description=TaskM Worker
After=network.target

[Service]
WorkingDirectory=/opt/taskm
ExecStart=/usr/bin/node node_modules/.bin/tsx scripts/worker.ts
Restart=on-failure
EnvironmentFile=/opt/taskm/.env

[Install]
WantedBy=multi-user.target
```
