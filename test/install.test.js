"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  MANIFEST_RELATIVE_PATH,
  installIntoTarget,
  renderAgentsBlock
} = require("../src/install.js");

function makeCodexProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vergil-skills-test-"));
  fs.mkdirSync(path.join(root, ".codex", "skills"), { recursive: true });
  fs.mkdirSync(path.join(root, "openspec"), { recursive: true });
  fs.writeFileSync(path.join(root, "openspec", "config.yaml"), "schema: spec-driven\n");
  return root;
}

test("install copies managed files and creates a managed AGENTS block", () => {
  const root = makeCodexProject();
  const result = installIntoTarget({ target: root, instruction: "rust" });

  assert.equal(result.selectedInstruction, "rust.instructions.md");
  assert.ok(fs.existsSync(path.join(root, ".codex", "skills", "caveman", "SKILL.md")));
  assert.ok(fs.existsSync(path.join(root, "instructions", "rust.instructions.md")));

  const agents = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
  assert.equal(agents, `${renderAgentsBlock("rust.instructions.md")}\n`);

  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, MANIFEST_RELATIVE_PATH), "utf8")
  );

  assert.equal(manifest.selectedInstruction, "rust.instructions.md");
  assert.ok(manifest.files.includes(path.join("instructions", "rust.instructions.md")));
});

test("install updates an existing managed AGENTS block without removing other content", () => {
  const root = makeCodexProject();
  fs.writeFileSync(path.join(root, "AGENTS.md"), "# Local notes\n");

  installIntoTarget({ target: root, instruction: "go" });
  installIntoTarget({ target: root, instruction: "karpthy" });

  const agents = fs.readFileSync(path.join(root, "AGENTS.md"), "utf8");
  assert.match(agents, /karpthy\.instructions\.md/);
  assert.match(agents, /# Local notes/);
  assert.equal((agents.match(/vergil-skills:managed:start/g) || []).length, 1);
});
