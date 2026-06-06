# Required page anatomy

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

### Code understanding

Produce an HTML review artifact. Include:

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
