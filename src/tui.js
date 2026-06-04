"use strict";

const readline = require("node:readline");

const ESC = "\u001b[";

function chooseInstructionInteractive(instructionFiles, options = {}) {
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;
  const defaultIndex = getDefaultInstructionIndex(instructionFiles);

  if (instructionFiles.length === 0) {
    return Promise.reject(new Error("No instruction files were found in the source package."));
  }

  if (instructionFiles.length === 1) {
    return Promise.resolve(instructionFiles[0]);
  }

  return new Promise((resolve, reject) => {
    let selectedIndex = defaultIndex;
    let finished = false;

    const cleanup = () => {
      if (finished) {
        return;
      }

      finished = true;

      input.removeListener("keypress", onKeypress);

      if (typeof input.setRawMode === "function" && input.isTTY) {
        input.setRawMode(false);
      }

      if (typeof input.pause === "function") {
        input.pause();
      }

      output.write(`${ESC}?25h`);
      output.write(`${ESC}0m`);
      output.write("\n");
    };

    const finish = (callback, value) => {
      cleanup();
      callback(value);
    };

    const onKeypress = (_, key = {}) => {
      if (key.ctrl && key.name === "c") {
        finish(reject, new Error("Installation cancelled."));
        return;
      }

      if (key.name === "escape") {
        finish(reject, new Error("Installation cancelled."));
        return;
      }

      if (key.name === "up" || key.name === "left") {
        selectedIndex = (selectedIndex - 1 + instructionFiles.length) % instructionFiles.length;
        render(output, instructionFiles, selectedIndex, defaultIndex);
        return;
      }

      if (key.name === "down" || key.name === "right") {
        selectedIndex = (selectedIndex + 1) % instructionFiles.length;
        render(output, instructionFiles, selectedIndex, defaultIndex);
        return;
      }

      if (key.name === "return") {
        finish(resolve, instructionFiles[selectedIndex]);
        return;
      }

      if (key.sequence && /^[1-9]$/.test(key.sequence)) {
        const index = Number(key.sequence) - 1;
        if (index < instructionFiles.length) {
          selectedIndex = index;
          render(output, instructionFiles, selectedIndex, defaultIndex);
        }
      }
    };

    readline.emitKeypressEvents(input);

    if (typeof input.setRawMode === "function" && input.isTTY) {
      input.setRawMode(true);
    }

    if (typeof input.resume === "function") {
      input.resume();
    }

    output.write(`${ESC}?25l`);
    render(output, instructionFiles, selectedIndex, defaultIndex);
    input.on("keypress", onKeypress);
  });
}

function render(output, instructionFiles, selectedIndex, defaultIndex) {
  output.write(`${ESC}2J${ESC}H`);
  output.write(renderInstructionPicker(instructionFiles, selectedIndex, defaultIndex));
}

function renderInstructionPicker(instructionFiles, selectedIndex, defaultIndex) {
  const lines = [];
  lines.push("Select an instruction");
  lines.push("");
  lines.push("Use ↑/↓ or 1-9, then press Enter.");
  lines.push("");

  instructionFiles.forEach((file, index) => {
    const activeMarker = index === selectedIndex ? "❯" : " ";
    const defaultMarker = index === defaultIndex ? " (default)" : "";
    lines.push(`${activeMarker} ${index + 1}. ${instructionLabel(file)}${defaultMarker}`);
  });

  lines.push("");
  lines.push("Press Esc or Ctrl-C to cancel.");

  return `${lines.join("\n")}\n`;
}

function instructionLabel(file) {
  return file.replace(/\.instructions\.md$/, "");
}

function getDefaultInstructionIndex(instructionFiles) {
  const index = instructionFiles.indexOf("karpthy.instructions.md");
  return index === -1 ? 0 : index;
}

module.exports = {
  chooseInstructionInteractive,
  getDefaultInstructionIndex,
  instructionLabel,
  renderInstructionPicker
};
