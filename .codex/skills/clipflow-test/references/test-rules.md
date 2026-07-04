# ClipFlow Test Rules

## Minimal Checks

- JSON edit: parse the changed JSON.
- TS/TSX edit: run `npm run lint` in `mvp/`.
- Route edit: verify the route renders.
- Interaction edit: click the changed path only.
- Data transform: leave one assert-based check if no test framework exists.

## Do Not Add Yet

- Jest/Vitest/Playwright dependency.
- Full E2E suite.
- Snapshot tests.
- CI-only config.

Add those when repeated manual checks become slower than maintaining tests.
