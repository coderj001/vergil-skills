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

test("default instruction prefers none when karpthy is present", () => {
  assert.equal(
    getDefaultInstructionIndex(["go.instructions.md", "karpthy.instructions.md", "rust.instructions.md"]),
    2
  );
});

test("instruction picker hides karpthy and marks none as default", () => {
  const rendered = renderInstructionPicker(
    ["go.instructions.md", "karpthy.instructions.md", "rust.instructions.md"],
    1,
    2
  );

  assert.match(rendered, /❯ 2\. rust/);
  assert.match(rendered, /  3\. none \(default\)/);
  assert.doesNotMatch(rendered, /karpthy/);
});
