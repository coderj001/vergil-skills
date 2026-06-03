#!/usr/bin/env python3
"""Combine OpenSpec artifacts from a directory into one portable index.html.

The script is intentionally dependency-free. It preserves source traceability and
renders common text/Markdown/code files into a single self-contained HTML page
using the SemiColony roadmap visual system.
"""

from __future__ import annotations

import argparse
import datetime as dt
import html
import os
import re
from pathlib import Path
from typing import Iterable, List, Tuple

TEXT_EXTENSIONS = {
    ".md", ".markdown", ".txt", ".html", ".htm", ".json", ".yaml", ".yml",
    ".toml", ".xml", ".csv", ".tsv", ".js", ".jsx", ".ts", ".tsx", ".py",
    ".go", ".rs", ".java", ".c", ".cc", ".cpp", ".h", ".hpp", ".cs",
    ".rb", ".php", ".swift", ".kt", ".sql", ".sh", ".bash", ".zsh",
    ".css", ".scss", ".diff", ".patch", ".log",
}

SKIP_DIRS = {
    ".git", ".hg", ".svn", "node_modules", "vendor", "dist", "build", "target",
    "coverage", "__pycache__", ".next", ".turbo", ".cache",
}

ROLE_HINTS = [
    ("proposal", "Proposal"),
    ("task", "Tasks"),
    ("todo", "Tasks"),
    ("design", "Design"),
    ("spec", "Specification"),
    ("review", "Review"),
    ("risk", "Risks"),
    ("implementation", "Implementation"),
    ("plan", "Plan"),
    ("diff", "Diff"),
    ("patch", "Patch"),
]


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "section"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def is_probably_binary(path: Path) -> bool:
    try:
        chunk = path.read_bytes()[:2048]
    except OSError:
        return True
    return b"\0" in chunk


def iter_artifacts(root: Path, output_file: Path) -> Iterable[Path]:
    output_file = output_file.resolve()
    for current_root, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
        for name in sorted(files):
            path = Path(current_root) / name
            if path.resolve() == output_file:
                continue
            if path.name.startswith("."):
                continue
            if path.suffix.lower() not in TEXT_EXTENSIONS:
                continue
            if is_probably_binary(path):
                continue
            yield path


def infer_role(path: Path) -> str:
    text = " ".join(path.parts).lower()
    for needle, label in ROLE_HINTS:
        if needle in text:
            return label
    suffix = path.suffix.lower().lstrip(".").upper()
    return suffix or "Artifact"


def first_heading(markdown: str) -> str | None:
    for line in markdown.splitlines():
        match = re.match(r"^\s{0,3}#{1,6}\s+(.+?)\s*$", line)
        if match:
            return re.sub(r"[#`*_]+", "", match.group(1)).strip()
    return None


def render_markdown(text: str) -> str:
    """Very small Markdown renderer for headings, lists, code fences, and paragraphs."""
    lines = text.splitlines()
    out: List[str] = []
    paragraph: List[str] = []
    in_ul = False
    in_ol = False
    in_code = False
    code_lines: List[str] = []

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            out.append(f"<p>{html.escape(' '.join(paragraph))}</p>")
            paragraph = []

    def close_lists() -> None:
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            if in_code:
                out.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
                code_lines = []
                in_code = False
            else:
                flush_paragraph()
                close_lists()
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue
        if not stripped:
            flush_paragraph()
            close_lists()
            continue
        heading = re.match(r"^(#{1,6})\s+(.+)$", stripped)
        if heading:
            flush_paragraph()
            close_lists()
            level = min(len(heading.group(1)) + 1, 6)
            out.append(f"<h{level}>{html.escape(heading.group(2))}</h{level}>")
            continue
        bullet = re.match(r"^[-*+]\s+(.+)$", stripped)
        if bullet:
            flush_paragraph()
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{html.escape(bullet.group(1))}</li>")
            continue
        ordered = re.match(r"^\d+[.)]\s+(.+)$", stripped)
        if ordered:
            flush_paragraph()
            if in_ul:
                out.append("</ul>")
                in_ul = False
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            out.append(f"<li>{html.escape(ordered.group(1))}</li>")
            continue
        paragraph.append(stripped)

    if in_code:
        out.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
    flush_paragraph()
    close_lists()
    return "\n".join(out)


def render_content(path: Path, text: str) -> str:
    suffix = path.suffix.lower()
    if suffix in {".md", ".markdown", ".txt"}:
        return render_markdown(text)
    language = suffix.lstrip(".") or "text"
    return f'<pre><code data-language="{html.escape(language)}">{html.escape(text)}</code></pre>'


def css() -> str:
    return """
:root {
  --action-blue: #3B82F6;
  --deep-slate: #1E293B;
  --semicolon-navy: #0F172A;
  --white: #FFFFFF;
  --soft-gray: #F8FAFC;
  --border: #E2E8F0;
  --muted: #64748B;
  --completed: #22C55E;
  --current: #EAB308;
  --locked: #94A3B8;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--deep-slate);
  background: linear-gradient(180deg, var(--soft-gray) 0%, var(--white) 320px);
  line-height: 1.6;
}
a { color: var(--action-blue); text-decoration: none; }
a:hover { text-decoration: underline; }
.container { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
.hero { padding: 56px 0 32px; }
.eyebrow { font: 700 0.78rem/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: .08em; text-transform: uppercase; color: var(--action-blue); }
h1 { font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05; margin: 14px 0; color: var(--semicolon-navy); }
.subtitle { max-width: 760px; color: var(--muted); font-size: 1.08rem; }
.summary-grid, .artifact-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.card, .artifact-section, .callout, .source-map {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}
.card { padding: 18px; }
.card strong { display: block; color: var(--semicolon-navy); font-size: 1.4rem; }
.card span, .muted { color: var(--muted); }
.nav-wrap { position: sticky; top: 0; z-index: 10; backdrop-filter: blur(12px); background: rgba(248,250,252,.9); border-block: 1px solid var(--border); }
.nav { display: flex; gap: 10px; overflow-x: auto; padding: 12px 0; }
.nav a { white-space: nowrap; border: 1px solid var(--border); background: var(--white); border-radius: 999px; padding: 8px 12px; font-size: .9rem; }
.section { padding: 34px 0; }
.section-title { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.node { display: inline-grid; place-items: center; min-width: 48px; height: 48px; border-radius: 14px; background: rgba(59,130,246,.1); color: var(--action-blue); font-weight: 800; }
h2 { color: var(--semicolon-navy); margin: 0; font-size: clamp(1.5rem, 3vw, 2.1rem); }
.source-map { overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: top; }
th { background: var(--soft-gray); font-size: .8rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
tr:last-child td { border-bottom: 0; }
.badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 4px 9px; font-size: .78rem; font-weight: 700; background: rgba(59,130,246,.1); color: var(--action-blue); }
.badge.completed { background: rgba(34,197,94,.12); color: #15803d; }
.badge.current { background: rgba(234,179,8,.18); color: #854d0e; }
.artifact-section { padding: 22px; margin-bottom: 18px; }
.artifact-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 18px; }
.artifact-header h3 { margin: 0 0 4px; color: var(--semicolon-navy); }
.path { font: 600 .82rem/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--muted); word-break: break-all; }
.content h2, .content h3, .content h4 { color: var(--semicolon-navy); margin-top: 1.2em; }
.content ul, .content ol { padding-left: 1.25rem; }
pre { overflow: auto; padding: 16px; background: var(--semicolon-navy); color: #E2E8F0; border-radius: 12px; font-size: .88rem; line-height: 1.5; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.callout { padding: 18px; border-left: 4px solid var(--action-blue); }
footer { margin-top: 40px; padding: 28px 0; background: var(--semicolon-navy); color: #CBD5E1; }
footer code { color: white; }
@media (max-width: 760px) {
  .summary-grid, .artifact-grid { grid-template-columns: 1fr; }
  .artifact-header { display: block; }
  th, td { display: block; width: 100%; }
  th { display: none; }
  td { border-bottom: 0; padding: 8px 14px; }
  tr { display: block; border-bottom: 1px solid var(--border); padding: 8px 0; }
}
@media print {
  .nav-wrap { position: static; }
  body { background: white; }
  .card, .artifact-section, .callout, .source-map { box-shadow: none; }
}
""".strip()


def build_html(root: Path, artifacts: List[Tuple[Path, str]], title: str) -> str:
    generated = dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    rel_rows = []
    nav_links = []
    sections = []

    for index, (path, text) in enumerate(artifacts, start=1):
        rel = path.relative_to(root).as_posix()
        role = infer_role(path)
        heading = first_heading(text) or path.stem.replace("-", " ").replace("_", " ").title()
        anchor = f"artifact-{index}-{slugify(rel)}"
        nav_links.append(f'<a href="#{anchor}">{html.escape(heading)}</a>')
        rel_rows.append(
            "<tr>"
            f"<td><code>{html.escape(rel)}</code></td>"
            f"<td><span class=\"badge\">{html.escape(role)}</span></td>"
            f"<td>{len(text.splitlines())} lines</td>"
            "</tr>"
        )
        sections.append(
            f"""
<section class="artifact-section" id="{anchor}">
  <div class="artifact-header">
    <div>
      <h3>{html.escape(heading)}</h3>
      <div class="path">{html.escape(rel)}</div>
    </div>
    <span class="badge current">{html.escape(role)}</span>
  </div>
  <div class="content">
    {render_content(path, text)}
  </div>
</section>
""".strip()
        )

    empty_note = ""
    if not artifacts:
        empty_note = "<div class=\"callout\"><strong>No text artifacts found.</strong><br>Add OpenSpec source files to this directory and regenerate the page.</div>"

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <style>{css()}</style>
</head>
<body>
  <header class="hero">
    <div class="container">
      <div class="eyebrow">openspec html consolidation</div>
      <h1>{html.escape(title)}</h1>
      <p class="subtitle">A single-file OpenSpec thinking canvas combining all detected artifacts in <code>{html.escape(root.name)}</code>. Source content is preserved with traceable sections and readable, portable styling.</p>
      <div class="summary-grid" aria-label="Summary">
        <div class="card"><strong>{len(artifacts)}</strong><span>included artifacts</span></div>
        <div class="card"><strong>1</strong><span>combined HTML file</span></div>
        <div class="card"><strong>{html.escape(generated)}</strong><span>generated local time</span></div>
      </div>
    </div>
  </header>

  <div class="nav-wrap">
    <nav class="container nav" aria-label="Artifact navigation">
      <a href="#source-map">Source map</a>
      {''.join(nav_links)}
    </nav>
  </div>

  <main class="container">
    <section class="section" id="source-map">
      <div class="section-title"><span class="node">01</span><h2>Source map</h2></div>
      <div class="source-map">
        <table>
          <thead><tr><th>Artifact</th><th>Role</th><th>Size</th></tr></thead>
          <tbody>{''.join(rel_rows) or '<tr><td colspan="3">No artifacts found.</td></tr>'}</tbody>
        </table>
      </div>
    </section>

    <section class="section" id="combined-artifacts">
      <div class="section-title"><span class="node">02</span><h2>Combined artifacts</h2></div>
      {empty_note}
      {''.join(sections)}
    </section>

    <section class="section" id="assumptions">
      <div class="section-title"><span class="node">03</span><h2>Assumptions and next edits</h2></div>
      <div class="callout">
        <strong>Assumption:</strong> This page preserves and organizes existing source artifacts without inventing missing requirements. Edit this section to add decisions, risks, recommendations, or final implementation guidance.
      </div>
    </section>
  </main>

  <footer>
    <div class="container">Generated as a portable OpenSpec HTML artifact. Entry point: <code>index.html</code>.</div>
  </footer>
</body>
</html>
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Combine OpenSpec artifacts into one self-contained HTML file.")
    parser.add_argument("input_dir", type=Path, help="Directory containing OpenSpec artifacts")
    parser.add_argument("output_file", type=Path, nargs="?", help="Output HTML file, defaults to input_dir/index.html")
    parser.add_argument("--title", default=None, help="HTML document title")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    root = args.input_dir.resolve()
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Input directory does not exist or is not a directory: {root}")
    output_file = (args.output_file or (root / "index.html")).resolve()
    artifacts: List[Tuple[Path, str]] = []
    for path in iter_artifacts(root, output_file):
        try:
            artifacts.append((path, read_text(path)))
        except OSError as exc:
            print(f"Skipping {path}: {exc}")
    title = args.title or f"{root.name.replace('-', ' ').replace('_', ' ').title()} OpenSpec"
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(build_html(root, artifacts, title), encoding="utf-8")
    print(f"Wrote {output_file} with {len(artifacts)} artifacts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
