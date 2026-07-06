# TypeScript rules

- `strict: true` assumed. Never disable in tsconfig.
- No `any`. Unavoidable → `// intentional: <reason>` same line.
- `type` for unions and aliases. `interface` for extensible object shapes.
- Use path aliases from tsconfig (`tsconfig.base.json` in monorepo — e.g. `@/*`, `@app/db`) over deep relative imports.
- Narrow unknowns at the boundary. No `unknown` leaking into business logic.
- `readonly` arrays and `as const` for literal data.
- `import type { ... }` when used only in type positions.
- No default exports in shared lib code. Next.js route files (`page.tsx`, `layout.tsx`) exempt — framework requires them.
