## Required Information Modes
Consider these eight modes for every OpenSpec HTML artifact. Use all eight when the available artifacts support them; otherwise use at least the relevant subset and do not force fake content.

| Mode | Use it for | Preferred HTML treatment |
| --- | --- | --- |
| Tables | Requirements, tasks, API changes, risks, owners, decisions, comparisons | Real `<table>` elements with concise columns, badges, and aligned numeric/status fields |
| Design | Visual hierarchy, readability, brand consistency, section rhythm | CSS variables, numbered section headers, cards, badges, callouts, responsive grids |
| Illustrations | Concepts, architecture, data movement, relationships | Inline SVG, CSS diagrams, labeled boxes, arrows, legends, annotated component anatomy |
| Code | Diffs, schemas, commands, examples, config, contracts | Escaped `<pre><code>` blocks, filename labels, inline notes, copyable blocks when useful |
| Interactions | Dense navigation and optional detail without page sprawl | Sticky table of contents, tabs, filters, checkboxes, `<details>`, collapsible deep dives, minimal inline JS |
| Workflows | Phases, rollout, request lifecycle, review path, state machines | Timelines, stepper rows, swimlanes, flow cards, sequence diagrams, status markers |
| Spatial | System maps, UI layout, ownership boundaries, dependency positions | Grid maps, coordinate-like canvases, architecture zones, priority quadrants, dependency maps |
| Images | Screenshots, figures, mockups, diagrams from source artifacts | Embedded or relative `<img>` figures with captions, annotations, alt text, and surrounding explanation |
