# SemiColony Roadmap Design System

Use this reference when polishing OpenSpec HTML artifacts.

## Brand personality

- Structured: logical progression and clear categorization.
- Educational: readable and cognitively light.
- Technical: subtle code-inspired elements such as semicolons, monospace labels, and numbered nodes.

## Palette

| Token | Hex | Use |
|---|---:|---|
| Action Blue | `#3B82F6` | primary buttons, links, active nodes |
| Deep Slate | `#1E293B` | headings, dark text |
| Semicolon Navy | `#0F172A` | brand accent, footer |
| White | `#FFFFFF` | main background |
| Soft Gray | `#F8FAFC` | section backgrounds, secondary cards |
| Border/Divider | `#E2E8F0` | card borders, timeline paths |
| Muted Text | `#64748B` | secondary labels, descriptions |
| Completed | `#22C55E` | success markers |
| Current | `#EAB308` | focus/current markers |
| Locked | `#94A3B8` | muted markers |

## Layout patterns

- Mobile: single column vertical stack.
- Desktop: max-width content region with two-column card grids where useful.
- Use large numbers as eye anchors for roadmap sections.
- Maintain generous vertical rhythm between major sections.

## Component recipes

### Timeline node

- Large marker such as `01` in Action Blue.
- Solid or dotted vertical path.
- Heading, concise summary, then cards/checklist.

### Information card

- White background.
- `1px solid #E2E8F0` border.
- `8px` to `16px` border radius.
- Header with title and small label/badge.
- Content as short paragraphs, checklists, links, or code blocks.

### Progress marker

- Checkbox or circular marker.
- Green for completed, yellow for current/focus, gray for locked/deferred.

### Code and technical labels

- Use a monospace stack: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace`.
- Keep code blocks high contrast with readable wrapping.
