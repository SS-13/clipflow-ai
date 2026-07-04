# ClipFlow Frontend Rules

## Next.js

- Use App Router.
- Server Components read static JSON and read-only data.
- Client Components handle form state, local timers, file inputs, clipboard, and step progression.
- Avoid `useEffect` for initial data loading when a Server Component can pass props.
- Keep route design semantic:
  - `/`
  - `/create`
  - `/gallery`
  - `/metrics/snapshots`
  - `/runs/[runId]`

## React

- Keep state near the interaction that owns it.
- Push changing state down to leaf components.
- Do not introduce global state for route-local workflow state.
- Extract components only after the route becomes hard to scan or reuse is real.
- Prefer explicit props over context.

## UI

- Use existing utility classes and local patterns.
- Use lucide icons already installed.
- Use tables for metric grids where comparison matters.
- Use native inputs for date, file, number, and text fields.
- Keep dashboard pages operational, not promotional.
