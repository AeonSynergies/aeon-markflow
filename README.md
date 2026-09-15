# Aeon MarkFlow (frontend)

Aeon Synergies' sales & marketing engagement platform — the visual workflow builder for
email / call / SMS / wait sequences. Companion backend: `aeon-markflow-backend`.

## Stack

React 19 + TypeScript + Vite + Tailwind v4 + shadcn-style components on Radix primitives +
TanStack Query + `@xyflow/react` for the workflow canvas.

## Consuming the backend contract

This repo never redefines the backend's request/response shapes by hand. `src/api/schema/`
vendors a copy of `aeon-markflow-backend`'s checked-in `openapi/markflow-backend.json`, and
`npm run api:generate` runs `openapi-typescript` over it to produce
`src/api/schema/markflow-backend.d.ts`. Everything under `src/features/*` imports types from
there (see `src/features/workflow-builder/types.ts`) and calls the backend through the typed
`openapi-fetch` client in `src/api/client.ts`.

When the backend's OpenAPI spec changes, copy the updated `openapi/markflow-backend.json` from
`aeon-markflow-backend` into `src/api/schema/` and re-run `npm run api:generate`.

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL if the backend isn't on localhost:4000
npm run dev
```

The backend has no `/login` route yet (see its CLAUDE.md — MarkFlow and Onboard share a JWT
signing secret but aren't wired together yet), so on first load the app asks for a bearer token
and an org id directly. This is a placeholder until real auth lands.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) and build for production
- `npm run typecheck` — `tsc -b --noEmit`
- `npm run lint` — oxlint
- `npm run api:generate` — regenerate `src/api/schema/markflow-backend.d.ts` from the vendored spec

## The workflow builder

`src/features/workflow-builder/` renders a `WorkflowTemplate`'s `steps[]` (email / call_task /
sms / wait) as a top-to-bottom sequence on an `@xyflow/react` canvas. Between and around steps
are insertion points — drag a step type from the left palette onto one, or click it to pick a
step kind — that splice a new step into the array at that position. There's no free-form graph
layout: the backend model is a strictly linear sequence, and the canvas mirrors that exactly.

Clicking a step opens the right-hand inspector to edit its kind-specific fields. An email step's
"Approved template version" picker only ever lists `EmailTemplateVersion`s with
`status: "APPROVED"` — per the backend's rule, a step pins to one specific version id, never
"latest", so editing a template later can't silently change a sequence that's already enrolling
leads.
