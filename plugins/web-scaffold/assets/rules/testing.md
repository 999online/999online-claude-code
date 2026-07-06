# Testing rules

- Runner: Vitest. `npm run check` runs typecheck + lint + tests.
- Colocate tests next to code. Mirror source file name in `describe`/test names.
- Integration tests hit a real test D1 + real HTTP boundaries. Mock only out-of-control third parties (payments, external AI APIs, SaaS).
- One assertion concept per test. Split unrelated assertions.
- No snapshotting API responses, DB rows, or anything with timestamps, IDs, or drift-prone ordering. Assert specific fields.
- Seed test data explicitly in the test or a narrow fixture. No reliance on leftover state.
- Deterministic: no prod network calls, no wall-clock reliance (freeze or inject a clock).
- Failing test name says what broke. No `test1` / `works correctly`.
