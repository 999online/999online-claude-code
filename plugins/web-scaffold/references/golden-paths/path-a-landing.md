# Path A — Landing page, waitlist, demand test

## When

Hypothesis about market interest, messaging, user commitment, willingness to engage. No logged-in product needed to learn.

When NOT: users must interact with persisted state or accounts → path B. Internal process tool → path C. No UI at all → path E.

## Layers (first option = default)

| Layer | Preferred options |
|---|---|
| Frontend | Astro, Next.js, SvelteKit, Vite |
| Deployment | Cloudflare Pages, Vercel, Netlify |
| Forms | Tally, Typeform, Google Forms, Airtable form, simple API route |
| Analytics | Plausible, PostHog, Cloudflare Web Analytics, Vercel Analytics, GA |
| Email capture | Managed form backend, ConvertKit, Mailchimp, Resend, Cloudflare Workers form handler + D1 table |

## Avoid

- Account systems before interest proven.
- Admin panels before there is data to administer.
- Full workflows when fake-door or concierge test is enough.
- Databases when managed form already stores signups.

## Scaffolder commands (non-interactive)

Default (Astro):
```bash
npm create astro@latest <dir> -- --template minimal --install --no-git --yes
```

Alternate (Next.js):
```bash
npx create-next-app@latest <dir> --ts --app --tailwind --eslint --yes
```

Flags rejected → run scaffolder `--help` first, adapt, never fall back to interactive mode.

## Structure contract (Astro default)

| Location | Contains | Never contains |
|---|---|---|
| `src/pages/` | Route pages (index, thanks) | Business logic modules |
| `src/components/` | UI components | Pages, data fetching |
| `src/layouts/` | Shared layouts | One-off components |
| `src/styles/` | Global CSS | Component logic |
| `public/` | Static assets | Source code |
| `docs/` | ADR, all other .md | — |

Starter `allowed-paths.json` (reconcile against actual scaffolder output before writing):

```json
{
  "allowedGlobs": [
    "src/pages/**", "src/components/**", "src/layouts/**", "src/styles/**",
    "public/**", "docs/**", ".claude/**",
    "*.json", "*.mjs", "*.cjs", "*.ts", ".gitignore", ".env.example", ".nvmrc"
  ],
  "forbiddenGlobs": [
    "src/{utils,helpers,common,shared,misc}/**",
    "server/**", "api/**", "database/**"
  ],
  "rootOnlyFiles": [".gitignore", ".env.example", ".nvmrc"],
  "exemptRootMd": ["README.md", "CLAUDE.md"]
}
```

Rationale for forbiddenGlobs: landing page needs no server/db dirs — their appearance signals scope creep past the hypothesis.

## Feature slice (minimum build proves)

1. One landing page: headline, value proposition, single call-to-action.
2. Signup capture wired to managed form (embed or POST) — submission lands somewhere real the owner can read.
3. Analytics snippet installed, one event tied to the validation hypothesis (e.g. `signup_submitted`).
4. Thanks/confirmation state.

## Verify notes

- Form submission reaches its destination (test one real submit, or document manual verification step when destination needs account setup).
- Analytics event fires (check network call in dev, or document as post-deploy step).
- No auth, no DB, no admin routes present.
