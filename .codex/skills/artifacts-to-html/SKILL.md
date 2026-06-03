---
name: artifacts-to-html
description: create polished, portable html artifacts for openspec-related work. use when a user asks for openspec specs, proposals, plans, implementation roadmaps, pr packages, pr reviews, code explanations, artifact consolidation, or any deliverable that should follow openspec conventions. always produce a real self-contained html file, usually index.html inside the relevant directory, combining all relevant openspec artifacts into one navigable page unless the user explicitly requests another format.
---

# Openspec HTML Output Standard

## Core rule

Produce every OpenSpec-related deliverable as HTML. Do not deliver OpenSpec artifacts as Markdown plans, plain text documents, DOCX, PDF, PPTX, images, or non-HTML files unless the user explicitly overrides this rule.

Default to **one self-contained `index.html` file inside the target OpenSpec directory**. The file must combine the relevant content from all OpenSpec artifacts for that request, such as proposal notes, design notes, tasks, implementation plans, PR review notes, code excerpts, diagrams, and decision logs. Only create multiple HTML files when the user explicitly asks for a multi-page site.

## Output contract

1. Create an actual `.html` artifact whenever file tools are available.
2. Put substantive content in the HTML, not in chat.
3. Keep the final chat response brief and link to the generated `index.html` or packaged result.
4. Use semantic HTML sections, readable CSS, and visible navigation.
5. Make the HTML useful as a thinking canvas: diagrams, grids, callouts, annotated code, tables, timelines, decision cards, and status badges are encouraged.
6. Prefer inline CSS and minimal inline JavaScript so the artifact is portable.
7. Keep filenames lowercase, hyphenated, and ending in `.html`; the default entry file is `index.html`.
8. Escape code snippets, diffs, and user-provided text safely before embedding in HTML.

## Single-file OpenSpec consolidation workflow

Use this workflow when the user provides, references, or asks to generate multiple OpenSpec artifacts.

1. **Choose the directory.** Use the existing OpenSpec directory when one is provided. Otherwise create a lower-hyphenated directory named after the feature or task.
2. **Inventory artifacts.** Look for source files such as `proposal.md`, `tasks.md`, `design.md`, `spec.md`, PR notes, diffs, issue notes, screenshots descriptions, code snippets, and review findings.
3. **Synthesize one page.** Create or update `<dir>/index.html` with a clear title, summary cards, source map, navigation, and one major section per meaningful artifact or theme.
4. **Preserve traceability.** Label assumptions and source sections. When merging existing artifacts, include a “source map” table showing which inputs were incorporated.
5. **Convert structure, not just text.** Turn Markdown lists into cards/checklists where useful, transform tasks into phased checklists, turn options into comparison cards, and render flows as CSS/SVG diagrams.
6. **Avoid raw dumping.** Do not simply paste concatenated documents unless the user only asks for archival consolidation. Prefer curated, navigable HTML that preserves the data while improving readability.

A helper is available at `scripts/compile_openspec_html.py` for deterministic consolidation of a directory into one `index.html`. Use it when the task is to combine existing files without requiring heavy editorial judgment, then improve the generated HTML manually if the user expects a polished artifact.

Example:

```bash
python scripts/compile_openspec_html.py path/to/openspec-dir path/to/openspec-dir/index.html --title "Feature OpenSpec"
```

## Required page anatomy

Every generated OpenSpec HTML page should include:

- **Hero:** title, short framing, date/status if relevant, and 2-4 summary cards.
- **Navigation:** visible in-page links to major sections.
- **Source map:** for consolidation tasks, list included artifacts and their role.
- **Main canvas:** structured sections with cards, diagrams, tables, code blocks, timelines, or checklists.
- **Assumptions:** explicit assumptions when the source is incomplete.
- **Decision log / open questions:** when the task involves planning, design, review, or implementation.
- **Print-friendly styling:** high contrast, no external CDN dependency.

## Artifact patterns

### Exploration and divergent directions

Use a responsive card grid when comparing alternatives. Include:

- clear title and problem framing
- 5-8 distinct approaches when the user asks for many directions
- label for each approach
- tradeoff each approach is making
- mockup area, layout sketch, component anatomy, or state sketch
- decision criteria and recommendation notes

### Implementation planning

Use one `index.html` with sections for:

- executive summary
- goals and non-goals
- architecture overview
- data flow diagram rendered in HTML/CSS or SVG
- phased implementation checklist
- risks and mitigations
- mockups or UI states when relevant
- important code snippets in `<pre><code>` blocks
- open questions and decision log

### PR creation

Produce an HTML PR package, not a Markdown-only PR body. Include:

- problem statement
- summary of changes
- screenshots/mockups or state diagrams when applicable
- testing performed
- rollout plan
- risk assessment
- reviewer guide
- copyable PR description inside a styled block if the platform still needs Markdown

### PR review and code understanding

Produce an HTML review artifact. Include:

- review summary with severity legend
- annotated diff or code excerpts with margin notes
- severity color-coding: blocker, major, minor, question, praise
- concept explainer for unfamiliar logic
- data flow or sequence diagram when relevant
- actionable findings with file/function context
- suggested patch snippets where helpful

For streaming, backpressure, concurrency, distributed systems, or state machines, include a visual model before findings.

## SemiColony roadmap visual system

Use the SemiColony educational roadmap aesthetic by default:

- **Action blue:** `#3B82F6` for links, active nodes, primary markers, and focus states.
- **Deep slate:** `#1E293B` for headings and strong text.
- **Semicolon navy:** `#0F172A` for dark accents and footer areas.
- **White:** `#FFFFFF` for main backgrounds.
- **Soft gray:** `#F8FAFC` for section backgrounds and secondary cards.
- **Border/divider:** `#E2E8F0` for card borders and timeline paths.
- **Muted text:** `#64748B` for secondary labels.
- **Completed:** `#22C55E`; **current:** `#EAB308`; **locked/muted:** `#94A3B8`.

Use a system sans-serif stack, with optional monospace accents for technical labels. Build hierarchy with large numbered markers such as `01`, `02`, vertical timeline paths, cards with subtle borders, rounded corners around `8px`, generous spacing, and clear mobile single-column behavior.

## HTML design requirements

- Use a responsive layout with a max-width content area.
- Use visual hierarchy: title, summary cards, section headings, callouts, badges.
- Use tables only for comparison or structured data, not full-page layout.
- Use `<details>` for optional deep dives.
- Use `<pre><code>` for code and diffs.
- Use SVG or CSS boxes/arrows for simple diagrams instead of external image dependencies.
- Label assumptions explicitly.
- Use high contrast text, subtle borders, light shadows, and readable code blocks.
- Do not require external fonts, CDNs, frameworks, images, or scripts unless the user asks.

## Quality checklist

Before finalizing, verify:

- The deliverable is HTML and the entry file is obvious, usually `<dir>/index.html`.
- A single HTML file combines all relevant OpenSpec artifacts unless explicitly overridden.
- Navigation links use valid in-page anchors.
- The artifact includes visual structure beyond plain prose.
- Code snippets and diffs are escaped safely.
- The page works without external network access.
- The final chat response links to the HTML artifact and does not duplicate the artifact content.
