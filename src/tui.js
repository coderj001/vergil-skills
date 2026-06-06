"use strict";

const readline = require("node:readline");

const ESC = "\u001b[";
const DEFAULT_INSTRUCTION = "karpthy.instructions.md";
const NONE_OPTION = "none";

function chooseInstructionInteractive(instructionFiles, options = {}) {
  const input = options.input || process.stdin;
  const output = options.output || process.stdout;
  const choices = getInstructionChoices(instructionFiles);
  const defaultIndex = getDefaultInstructionIndex(instructionFiles);

  if (choices.length === 0) {
    return Promise.reject(new Error("No instruction files were found in the source package."));
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
        selectedIndex = (selectedIndex - 1 + choices.length) % choices.length;
        render(output, instructionFiles, selectedIndex, defaultIndex);
        return;
      }

      if (key.name === "down" || key.name === "right") {
        selectedIndex = (selectedIndex + 1) % choices.length;
        render(output, instructionFiles, selectedIndex, defaultIndex);
        return;
      }

      if (key.name === "return") {
        finish(resolve, normalizeSelectedInstruction(choices[selectedIndex]));
        return;
      }

      if (key.sequence && /^[1-9]$/.test(key.sequence)) {
        const index = Number(key.sequence) - 1;
        if (index < choices.length) {
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
  const choices = getInstructionChoices(instructionFiles);
  const lines = [];
  lines.push("Select an instruction");
  lines.push("");
  lines.push("Use ↑/↓ or 1-9, then press Enter.");
  lines.push("");

  choices.forEach((file, index) => {
    const activeMarker = index === selectedIndex ? "❯" : " ";
    const defaultMarker = index === defaultIndex ? " (default)" : "";
    lines.push(`${activeMarker} ${index + 1}. ${instructionLabel(file)}${defaultMarker}`);
  });

  lines.push("");
  lines.push("Press Esc or Ctrl-C to cancel.");

  return `${lines.join("\n")}\n`;
}

function instructionLabel(file) {
  if (file === NONE_OPTION) {
    return NONE_OPTION;
  }

  return file.replace(/\.instructions\.md$/, "");
}

function getDefaultInstructionIndex(instructionFiles) {
  const choices = getInstructionChoices(instructionFiles);
  if (choices.length === 0) {
    return 0;
  }

  return instructionFiles.includes(DEFAULT_INSTRUCTION) ? choices.length - 1 : 0;
}

function getInstructionChoices(instructionFiles) {
  const choices = instructionFiles.filter((file) => file !== DEFAULT_INSTRUCTION);

  if (instructionFiles.includes(DEFAULT_INSTRUCTION)) {
    choices.push(NONE_OPTION);
  }

  return choices;
}

function normalizeSelectedInstruction(selectedInstruction) {
  return selectedInstruction === NONE_OPTION ? DEFAULT_INSTRUCTION : selectedInstruction;
}

module.exports = {
  chooseInstructionInteractive,
  getDefaultInstructionIndex,
  getInstructionChoices,
  instructionLabel,
  renderInstructionPicker
};
