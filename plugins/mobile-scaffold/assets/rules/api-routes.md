# API route rules (backend repo)

- **small — Hono:** thin handlers in `src/routes/`; logic in `src/services/`; request/response validation in `src/schemas/` (zod); auth/cors/logging in `src/middleware/`. `GET /health` always present.
- **large — NestJS:** one module per feature in `src/modules/` (controller + service + module). Cross-cutting in `src/common/` (guards/interceptors/filters/pipes). Config in `src/config/`. Health in `src/health/`.
- Validate every request at the boundary. Structured errors `{ error: { code, message } }`. Never leak stack traces to clients.
- Auth verified server-side (Hono middleware / Nest guard). App sends token, backend decides — never trust the client.
- Routes hold no secrets — read from env / secret store (`.dev.vars` / `.env`).
- Guard/rate-limit write endpoints that touch external systems; no irreversible side effects without approval.
- Keep handlers small; push branching into services. No business logic in route files.
