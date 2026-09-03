# Multi-Service Demo — Frontend

React + Vite SPA for the multi-service demos (customer support UI, gateway home).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Customer support UI: `/customer-support`.

## Docker

Built via `dev-environment` / `infrastructure` Compose (nginx serves the Vite `dist` with SPA fallback).

```bash
docker build -t frontend .
docker run -p 3000:80 frontend
```

## Structure

```
frontend/
├── index.html          # Vite entry
├── src/                # React app
├── Dockerfile          # Multi-stage Vite build → nginx
└── nginx.conf
```

Personal CV lives in the separate `profile` repo (`/home/salman/salman/work/profile`).
