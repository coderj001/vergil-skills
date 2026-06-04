"use strict";

const path = require("node:path");
const {
  getSourceInstructionFiles,
  installIntoTarget,
  normalizeInstructionSelection,
  resolveSourceRoot
} = require("./install.js");
const { chooseInstructionInteractive } = require("./tui.js");

async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === "--help" || command === "-h" || command === "help") {
      printHelp();
      return;
    }

    if (command === "list-instructions") {
      listInstructions();
      return;
    }

    if (command === "install" || command === "add" || command === "sync" || command === "update") {
      await runInstall(command, args.slice(1));
      return;
    }

    fail(`Unknown command "${command}".`);
  } catch (error) {
    fail(error.message);
  }
}

async function runInstall(command, commandArgs) {
  const parsed = parseArgs(commandArgs);
  const sourceRoot = resolveSourceRoot();
  const instructionFiles = getSourceInstructionFiles(sourceRoot);
  const selectedInstruction = parsed.instruction
    ? normalizeInstructionSelection(parsed.instruction, instructionFiles)
    : await selectInstructionIfInteractive(instructionFiles);
  const result = installIntoTarget({
    target: parsed.target,
    instruction: selectedInstruction
  });

  const mode = command === "sync" || command === "update" ? "Synced" : "Installed";
  console.log(`${mode} Codex assets into ${result.targetRoot}`);
  console.log(`Instruction: ${result.selectedInstruction}`);
  console.log(`Managed files: ${result.filesInstalled}`);

  if (result.removedFiles.length > 0) {
    console.log(`Removed stale files: ${result.removedFiles.length}`);
  }
}

async function selectInstructionIfInteractive(instructionFiles) {
  if (process.stdin.isTTY && process.stdout.isTTY) {
    return chooseInstructionInteractive(instructionFiles);
  }

  return normalizeInstructionSelection(null, instructionFiles);
}

function parseArgs(args) {
  let target = ".";
  let instruction = null;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--instruction") {
      instruction = args[index + 1];
      if (!instruction) {
        fail("Missing value for --instruction.");
      }
      index += 1;
      continue;
    }

    if (arg.startsWith("--instruction=")) {
      instruction = arg.slice("--instruction=".length);
      continue;
    }

    if (arg.startsWith("-")) {
      fail(`Unknown option "${arg}".`);
    }

    target = arg;
  }

  return { target, instruction };
}

function listInstructions() {
  const instructionFiles = getSourceInstructionFiles(resolveSourceRoot());
  const selected = instructionFiles.includes("karpthy.instructions.md")
    ? "karpthy.instructions.md"
    : null;

  for (const file of instructionFiles) {
    const marker = file === selected ? "*" : " ";
    console.log(`${marker} ${file}`);
  }
}

function printHelp() {
  const executable = path.basename(process.argv[1] || "vergil-skills");

  console.log(`Usage: ${executable} <command> [target] [options]

Commands:
  install, add         Copy managed Codex skills, rules, and instructions
  sync, update         Re-sync managed files and remove stale files
  list-instructions    List available instruction files

Options:
  --instruction <name> Select the instruction file referenced from AGENTS.md
                       Omit it in a TTY to open the interactive picker

Examples:
  npx vergil-skills install ../my-project
  npx vergil-skills add ../my-project --instruction rust
  npx vergil-skills sync . --instruction karpthy.instructions.md`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

void main();
