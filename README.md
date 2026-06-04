# vergil-skills

Codex-only skill pack installer for OpenSpec projects.

This repo contains:

- custom Codex skills under `.codex/`
- reusable instruction files under `instructions/`
- a small CLI that installs and updates those files in another project

The goal is to stop manually copying skills and instructions after `openspec init`.

## What it does

The installer:

- copies this repo's managed `.codex` assets into a target project
- copies all `instructions/*.instructions.md` into the target project
- updates `AGENTS.md` with one managed block that points to exactly one selected instruction file
- writes a manifest to `.codex/vergil-skills/manifest.json`

The manifest is used by `sync` so future runs can:

- add new skills or instructions you introduced here
- remove stale managed files that no longer exist in this repo
- switch the selected instruction in `AGENTS.md`

## Prerequisites

- Node.js
- OpenSpec initialized for Codex in the target project

Initialize the target project first:

```bash
npx @fission-ai/openspec@latest init --tools codex
```

## Setup This Repo

This package currently has no external dependencies.

From this repo:

```bash
node --test
```

## Use It Locally

Until you publish this package, run the CLI directly from this repo.

List available instructions:

```bash
node src/cli.js list-instructions
```

Install into a target project:

```bash
node src/cli.js add /path/to/project --instruction rust
```

If you omit `--instruction` in an interactive terminal, the CLI opens a small
TUI picker so you can choose the instruction file with the arrow keys.

Sync updates later:

```bash
node src/cli.js sync /path/to/project --instruction go
```

If `--instruction` is omitted, the CLI only allows `karpthy.instructions.md` as the default.
If that file is not present in this repo, the command fails and you must pass `--instruction <name>` explicitly.

## Use It From GitHub

If this repo is on GitHub, you can use it without publishing to npm.

Run it one-off with `npx`:

```bash
npx github:<username>/<repo> add /path/to/project --instruction rust
```

You can also use a branch, tag, or commit:

```bash
npx github:<username>/<repo>#main add /path/to/project --instruction go
```

If you prefer installing it into a project first:

```bash
npm add -D github:<username>/<repo>
npx vergil-skills add /path/to/project --instruction rust
```

You can also use the full git URL form if you prefer:

```bash
npx git+https://github.com/<username>/<repo>.git add /path/to/project --instruction rust
```

## Commands

### `list-instructions`

Shows all available instruction files bundled in this repo.

```bash
node src/cli.js list-instructions
```

### `add` or `install`

Copies managed assets into the target project.

```bash
node src/cli.js add /path/to/project --instruction karpthy
```

Accepted instruction values:

- short name such as `rust` or `karpthy`
- full filename such as `rust.instructions.md`

When `--instruction` is omitted in a TTY, the CLI shows an interactive picker
instead of immediately defaulting.

### `sync` or `update`

Re-copies current assets and removes stale managed files from previous runs.

```bash
node src/cli.js sync /path/to/project --instruction springboot
```

Use this after:

- adding a new skill in this repo
- deleting or renaming a managed skill or instruction here
- changing which instruction should be referenced from `AGENTS.md`

## Target Project Output

After install, the target project will contain:

- `.codex/...` copied from this repo
- `instructions/*.instructions.md` copied from this repo
- `AGENTS.md` with a managed block like:

```md
<!-- vergil-skills:managed:start -->
1. Follow the instruction in `./instructions/rust.instructions.md` to the core
2. For Openspec operation or cli use `npx @fission-ai/openspec@latest`
<!-- vergil-skills:managed:end -->
```

If `AGENTS.md` already exists, only that managed block is updated. Other content is preserved.

## Publish Later

If you publish this package to npm, usage becomes:

```bash
npx vergil-skills add /path/to/project --instruction rust
```

At that point you can treat this as the post-`openspec init` step for Codex projects.

## Current Scope

This is intentionally Codex-only for now.

It assumes the target project already has a `.codex/` directory from:

```bash
npx @fission-ai/openspec@latest init --tools codex
```

If `.codex/` is missing, the installer fails instead of guessing.
