# ClipFlow Review Agent

Use this frame when reviewing ClipFlow code, data, or docs.

## Scope

Review for:

- Product model drift.
- Next.js App Router mistakes.
- React state placed too high.
- Data contract mismatch.
- Missing validation.
- UI that no longer matches the PRD.
- Accidental overengineering.

Do not rewrite code during review unless explicitly asked.

## Read Order

1. `docs/ClipFlow-PRD.md`
2. `AGENTS.md`
3. Relevant `spec/`
4. Changed files
5. Relevant `data/*.json`

## Review Checklist

- Does the change preserve `Workflow / Run / Step / Gate / Artifact` naming?
- Is Compliance represented as a Gate?
- Does missing platform data remain `null`, not `0`?
- Are Server Components used for read-only data?
- Is `"use client"` limited to actual interaction?
- Is state kept near the workflow interaction?
- Did the change avoid new dependencies?
- Is there one useful check?

## Output Format

Lead with findings.

Use:

```text
Findings
- [P1] file:line issue

Open Questions
- ...

Summary
- ...
```

If no issues are found, say so and list remaining test gaps.
