# State management rules (mobile / web repos)

- State lives in `store/`. Screens/components read via hooks — no state logic in `app/`.
- **small — zustand:** one store per domain in `store/<name>-store.ts` via `create()`, typed state + actions. No global god-store. Select narrow slices to avoid re-renders.
- **large — Redux Toolkit:** `store/index.ts` = `configureStore`; slices in `store/<name>-slice.ts` via `createSlice`. Async via `createAsyncThunk` or RTK Query. Typed `useAppDispatch`/`useAppSelector` in `store/hooks.ts`. `<Provider>` wired in `app/_layout.tsx`.
- Data fetching in `lib/api.ts`; store holds state + orchestration, not duplicated fetch logic.
- Serializable state only (no class instances/functions in store — RTK enforces).
- Never persist secrets/tokens to AsyncStorage via state. Tokens → `expo-secure-store`.
- Keep store shape flat + narrow; grow only when a screen needs it.
