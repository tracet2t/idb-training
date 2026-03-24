# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Docker Compose

This project uses `docker-compose.yml` with two services:

- `app-dev`: runs the Vite development server with local files mounted.
- `app-prod`: builds a production bundle and serves it with Nginx.

### How `app-dev` works

- Uses `Dockerfile.dev`.
- Binds your project folder into the container (`./:/app`) so code changes are reflected immediately.
- Keeps container dependencies in `/app/node_modules` (anonymous volume) to avoid host/container conflicts.
- Exposes Vite on `5173`.

Run:

```bash
docker compose up --build app-dev
```

Open: [http://localhost:5173](http://localhost:5173)

### How `app-prod` works

- Uses a multi-stage build in `Dockerfile.prod`:
  - Node stage builds the app (`npm run build`).
  - Nginx stage serves static files from `dist`.
- Exposes Nginx on `8080` (mapped to container port `80`).

Run:

```bash
docker compose up --build app-prod
```

Open: [http://localhost:8080](http://localhost:8080)

### Common commands

Start a service:

```bash
docker compose up --build app-dev
docker compose up --build app-prod
```

Run in detached mode:

```bash
docker compose up --build -d app-dev
```

See logs:

```bash
docker compose logs -f app-dev
docker compose logs -f app-prod
```

Stop and remove containers:

```bash
docker compose down
```

Rebuild from scratch (no cache):

```bash
docker compose build --no-cache
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
