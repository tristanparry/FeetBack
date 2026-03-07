# FeetBack API

This repository is used to provide FeetBack API functionality.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the API on your local device:

   ```bash
   npm run dev
   ```

The dev server restarts automatically when `.ts` files change.

## Operational endpoints

- `GET /` returns a basic API message.
- `GET /healthz` returns `{ "status": "ok" }` for liveness checks.

### Curl health endpoint

Local:

```bash
curl -i http://localhost:3000/healthz
```

Production:

```bash
curl -i https://feetback-api-production.up.railway.app/healthz
```

## Docker image

The API ships with a multi-stage `Dockerfile`:

- `deps` stage installs all dependencies with `npm ci`.
- `build` stage compiles TypeScript with `tsconfig.build.json`.
- `runtime` stage installs production dependencies with `npm ci --omit=dev` and runs:

  ```bash
  node dist/src/server.js
  ```

Build and run locally:

```bash
docker build -t lepuggi/feetback-api:local .
docker run --rm -p 3000:3000 --env-file .env lepuggi/feetback-api:local
```

## Deployment flow

Production deployment uses Docker images from Docker Hub and runs on Railway.

1. Push changes to the `main` branch.
2. GitHub Actions workflow `.github/workflows/docker-push.yml` builds and pushes:
   - `lepuggi/feetback-api:latest`
   - `lepuggi/feetback-api:<short-sha>`
3. Railway deploys the configured image tag for the `feetback-api-production` service.

The API handles `SIGTERM` and `SIGINT` by closing the HTTP server and PostgreSQL pool before exiting.

## GitHub Actions secrets

The Docker publish workflow requires these repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
