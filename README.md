# Multi-Service Demo — Frontend

React + Vite SPA for the multi-service demos (customer support UI, gateway home).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). ShopPilot AI UI: `/shoppilot-ai`.

## Production (VPS + nginx)

Vite builds a static SPA (`dist/`). Host nginx serves it from `/var/www/demo` with SPA fallback so React Router paths work.

### One-time VPS setup

```bash
sudo mkdir -p /var/www/demo
sudo chown -R "$USER":www-data /var/www/demo

sudo cp deploy/nginx.conf /etc/nginx/sites-available/demo
sudo ln -sfn /etc/nginx/sites-available/demo /etc/nginx/sites-enabled/demo
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d demo.salmansaeed507.com
```

`try_files $uri $uri/ /index.html` is required — without it, refreshing `/shoppilot-ai` returns 404.

### GitHub Actions

Push to `main` (or run **Deploy to VPS** manually) builds on GitHub and rsyncs `dist/` to `/var/www/demo`.

Add these secrets on `salmansaeed507/demo-frontend` (Settings → Secrets → Actions). They are per-repo — the profile repo secrets are not reused:

| Secret | Value |
|--------|--------|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH user that can write `/var/www/demo` |
| `VPS_SSH_KEY` | Private key for that user |
| `VITE_API_URL` | e.g. `https://demo.salmansaeed507.com` (or leave empty until the API is up) |
| `VITE_API_KEY` | Same key the gateway expects |

`VITE_*` values are baked in at build time. Changing them requires a new deploy.

## Docker

Used by `dev-environment` / `infrastructure` Compose (container nginx serves `dist`).

```bash
docker build -t frontend .
docker run -p 3000:80 frontend
```

## Structure

```
frontend/
├── index.html          # Vite entry
├── src/                # React app
├── Dockerfile          # Multi-stage Vite build → nginx (Compose)
├── nginx.conf          # Container nginx
├── deploy/nginx.conf   # Host nginx for demo.salmansaeed507.com
└── .github/workflows/deploy.yml
```

Personal CV lives in the separate `profile` repo (`/home/salman/salman/work/profile`).
