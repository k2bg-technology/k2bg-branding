# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

Shared project, architecture, testing, style, and agent rules live in **AGENTS.md** — the
single source of truth for all agents. It is imported below; read it first.

@AGENTS.md

## Claude Code Specifics

The sections below apply only to Claude Code (tooling not available to other agents).

### k2bg-design-system MCP

When working on UI components, use the `k2bg-design-system` MCP tools to access Storybook's
component and documentation knowledge before answering or taking action. This is how Claude
Code fulfills the "verify component properties before using them" rule in `AGENTS.md`.

- **Never hallucinate component properties.** Before using ANY property on a design-system
  component (even common-sounding ones like `shadow`), verify it is documented for that
  component via the MCP tools.
- `list-all-documentation` — list all components.
- `get-documentation` — see a component's available properties and examples.
- `get-storybook-story-instructions` — fetch current conventions before creating/updating stories.
- `run-story-tests` — check your work.
- Only use properties explicitly documented or shown in example stories. A story name may
  not reflect the property name, so always verify through documentation or example stories.
  If a property is not documented, check with the user instead of assuming.

### Delegating review to Codex

After pushing fixes that address Codex PR feedback, post a top-level `@codex review`
comment — Codex does not re-review unless explicitly asked. See `AGENTS.md` (Codex Usage).
