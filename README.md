# frontend

React + Vite + TypeScript UI for the multi-service demo. Static assets are served via nginx in production.

## Setup

```bash
npm install
cp .env.example .env
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Docker

```bash
docker build \
  --build-arg VITE_API_URL=http://localhost:8080 \
  --build-arg VITE_API_KEY=dev-api-key-change-me \
  -t frontend .
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Gateway base URL |
| `VITE_API_KEY` | API key sent as `X-API-Key` header |
