"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getDefaultInstructionIndex,
  instructionLabel,
  renderInstructionPicker
} = require("../src/tui.js");

test("instruction labels trim the file suffix", () => {
  assert.equal(instructionLabel("rust.instructions.md"), "rust");
});

test("default instruction prefers karpthy when present", () => {
  assert.equal(
    getDefaultInstructionIndex(["go.instructions.md", "karpthy.instructions.md", "rust.instructions.md"]),
    1
  );
});

test("instruction picker marks the active and default entries", () => {
  const rendered = renderInstructionPicker(
    ["go.instructions.md", "karpthy.instructions.md", "rust.instructions.md"],
    2,
    1
  );

  assert.match(rendered, /❯ 3\. rust/);
  assert.match(rendered, /  2\. karpthy \(default\)/);
});
