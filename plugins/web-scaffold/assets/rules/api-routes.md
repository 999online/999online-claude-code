# API route rules

Applies to Hono routes (`apps/api/`, `src/routes/`) and Next.js route handlers (`src/app/api/`).

- Validate every request body, path param, query string at route entry. Zod schemas.
- Structured error responses, stable shape: `{ error: { code, message, details? } }` + correct HTTP status. Hono → throw `HTTPException`.
- Never log full request bodies, auth headers, or PII/secret-bearing query strings. Log request IDs and resource IDs.
- No internal error messages or stack traces to client. Log server-side with correlation ID, return generic message.
- Authenticate and authorize before touching data (D1/KV/R2).
- Thin handlers: validate → call service → shape response. Business logic lives in services/lib, never in the handler.
