# Database rules (backend repo)

- **small — D1 + Drizzle:** schema in `db/schema.ts`; migrations in `db/migrations/` via `drizzle-kit generate` + `wrangler d1 migrations apply`.
- **large — Postgres + TypeORM:** entities + migrations in `src/migrations/` via `migration:generate` + `migration:run`.
- **Migrations immutable once applied.** New change = new migration. Never edit or delete an applied one.
- No unreproducible manual DB changes — every schema change in a tracked migration.
- Narrow, validation-focused schema. Grow only when a feature needs it.
- No raw string-concatenated SQL — use the query builder / ORM (injection risk).
- Least-privilege DB role. Connection string / binding in server secret, never bundled, never `EXPO_PUBLIC_`.
- Seed/test data synthetic or limited-scope. Sensitive production data needs recorded approval.
