---
name: artifacts-to-html
description: create polished, portable html artifacts for openspec-related work. use when a user asks for openspec specs, proposals, plans, artifact consolidation, or any deliverable that should follow openspec conventions. always produce a real self-contained html file, usually index.html inside the relevant directory, combining all relevant openspec artifacts into one navigable page unless the user explicitly requests another format.
---

# Openspec HTML Output Standard

## Core rule

Default to **one self-contained `index.html` file inside the target OpenSpec directory**. The file must combine the relevant content from all OpenSpec artifacts for that request, such as proposal notes, design notes, tasks, implementation plans, diagrams, code snippets and decision logs. Only create multiple HTML files when the user explicitly asks for a multi-page site.

## Output contract

1. Create an actual `.html` artifact whenever file tools are available.
2. Put substantive content in the HTML, not in chat.
3. Keep the final chat response brief and link to the generated `index.html` or packaged result.
4. Use semantic HTML sections, readable CSS, and visible navigation.
5. Make the HTML useful as a thinking canvas: diagrams, grids, callouts, annotated code, tables, timelines, decision cards, and status badges are encouraged. For more details refer [required_information_modes](./references/required_information_modes.md) 
6. Prefer inline CSS and minimal inline JavaScript so the artifact is portable.
7. Keep filenames lowercase, hyphenated, and ending in `.html`; the default entry file is `index.html`.
8. Escape code snippets, diffs, and user-provided text safely before embedding in HTML.

## Rules

1. **Choose the directory.** Use the existing OpenSpec directory when one is provided. Otherwise create a lower-hyphenated directory named after the feature or task.
2. **Inventory artifacts.** Look for source files such as `proposal.md`, `tasks.md`, `design.md`, `spec.md`, PR notes, diffs, issue notes, screenshots descriptions, code snippets, and review findings.
3. **Synthesize one page.** Create or update `<dir>/index.html` with a clear title, summary cards, source map, navigation, and one major section per meaningful artifact or theme.
4. **Preserve traceability.** Label assumptions and source sections. When merging existing artifacts, include a “source map” table showing which inputs were incorporated.
5. **Convert structure, not just text.** Turn Markdown lists into cards/checklists where useful, transform tasks into phased checklists, turn options into comparison cards, and render flows as CSS/SVG diagrams read ./references/page_anatomy.md and follow it .
6. **Avoid raw dumping.** Do not simply paste concatenated documents unless the user only asks for archival consolidation. Prefer curated, navigable HTML that preserves the data while improving readability.
7. **Be extremely concise. Sacrifice grammar for the sake of concision** Do not overexplain or use excessive grammatical jargon. Keep explanations simple and direct. For diagrams and summaries, focus on clarity and key points only.

A helper is available at `scripts/compile_openspec_html.py` for deterministic consolidation of a directory into one `index.html`. Use it when the task is to combine existing files without requiring heavy editorial judgment, then improve the generated HTML manually if the user expects a polished artifact.

Example:

```bash
python scripts/compile_openspec_html.py path/to/openspec-dir path/to/openspec-dir/index.html --title "Feature OpenSpec"
```
