"use strict";

const fs = require("node:fs");
const path = require("node:path");

const MANAGED_START = "<!-- vergil-skills:managed:start -->";
const MANAGED_END = "<!-- vergil-skills:managed:end -->";
const MANIFEST_RELATIVE_PATH = path.join(".codex", "vergil-skills", "manifest.json");

function resolveSourceRoot() {
  return path.resolve(__dirname, "..");
}

function resolveTargetRoot(targetArg) {
  return path.resolve(targetArg || process.cwd());
}

function getSourceInstructionFiles(sourceRoot) {
  const instructionsDir = path.join(sourceRoot, "instructions");
  return fs
    .readdirSync(instructionsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".instructions.md"))
    .map((entry) => entry.name)
    .sort();
}

function normalizeInstructionSelection(selection, instructionFiles) {
  if (!selection) {
    if (instructionFiles.length === 0) {
      throw new Error("No instruction files were found in the source package.");
    }

    if (instructionFiles.includes("karpthy.instructions.md")) {
      return "karpthy.instructions.md";
    }

    throw new Error(
      'No default instruction is available. Pass "--instruction <name>" explicitly, or add "karpthy.instructions.md" to the source instructions directory.'
    );
  }

  const trimmed = selection.trim();
  if (trimmed === "none") {
    if (instructionFiles.includes("karpthy.instructions.md")) {
      return "karpthy.instructions.md";
    }

    throw new Error(
      'No default instruction is available. Pass "--instruction <name>" explicitly, or add "karpthy.instructions.md" to the source instructions directory.'
    );
  }

  const candidates = new Set([
    trimmed,
    trimmed.endsWith(".instructions.md") ? trimmed : `${trimmed}.instructions.md`
  ]);

  for (const candidate of candidates) {
    if (instructionFiles.includes(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `Unknown instruction "${selection}". Available instructions: ${instructionFiles.join(", ")}`
  );
}

function collectFiles(rootDir, relativeDir) {
  const start = path.join(rootDir, relativeDir);
  const files = [];

  if (!fs.existsSync(start)) {
    return files;
  }

  walk(start, relativeDir, files);
  return files.sort();
}

function walk(currentPath, relativePath, files) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryRelativePath = path.join(relativePath, entry.name);
    const entryPath = path.join(currentPath, entry.name);

    if (entry.isDirectory()) {
      walk(entryPath, entryRelativePath, files);
      continue;
    }

    if (entry.isFile()) {
      files.push(entryRelativePath);
    }
  }
}

function ensureCodexProject(targetRoot) {
  const codexDir = path.join(targetRoot, ".codex");
  if (!fs.existsSync(codexDir)) {
    throw new Error(
      `Target ${targetRoot} does not look like a Codex project. Run "npx @fission-ai/openspec@latest init --tools codex" first.`
    );
  }
}

function readManifest(targetRoot) {
  const manifestPath = path.join(targetRoot, MANIFEST_RELATIVE_PATH);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

function writeManifest(targetRoot, manifest) {
  const manifestPath = path.join(targetRoot, MANIFEST_RELATIVE_PATH);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}

function copyManagedFiles(sourceRoot, targetRoot, relativePaths) {
  for (const relativePath of relativePaths) {
    const sourcePath = path.join(sourceRoot, relativePath);
    const targetPath = path.join(targetRoot, relativePath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath);
  }
}

function removeStaleFiles(targetRoot, previousFiles, nextFiles) {
  const keep = new Set(nextFiles);

  for (const relativePath of previousFiles || []) {
    if (keep.has(relativePath)) {
      continue;
    }

    const targetPath = path.join(targetRoot, relativePath);
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { force: true });
      pruneEmptyParents(targetRoot, path.dirname(relativePath));
    }
  }
}

function pruneEmptyParents(targetRoot, relativeDir) {
  if (!relativeDir || relativeDir === "." || relativeDir === path.sep) {
    return;
  }

  const absoluteDir = path.join(targetRoot, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    const parent = path.dirname(relativeDir);
    if (parent !== relativeDir) {
      pruneEmptyParents(targetRoot, parent);
    }
    return;
  }

  if (fs.readdirSync(absoluteDir).length !== 0) {
    return;
  }

  fs.rmdirSync(absoluteDir);
  const parent = path.dirname(relativeDir);
  if (parent !== relativeDir) {
    pruneEmptyParents(targetRoot, parent);
  }
}

function renderAgentsBlock(selectedInstruction) {
  return [
    MANAGED_START,
    `1. Follow the instruction in \`./instructions/${selectedInstruction}\` to the core`,
    "2. For Openspec operation or cli use `npx @fission-ai/openspec@latest`",
    MANAGED_END
  ].join("\n");
}

function updateAgentsFile(targetRoot, selectedInstruction) {
  const agentsPath = path.join(targetRoot, "AGENTS.md");
  const managedBlock = renderAgentsBlock(selectedInstruction);

  if (!fs.existsSync(agentsPath)) {
    fs.writeFileSync(agentsPath, managedBlock + "\n");
    return;
  }

  const current = fs.readFileSync(agentsPath, "utf8");
  const blockPattern = new RegExp(
    `${escapeForRegExp(MANAGED_START)}[\\s\\S]*?${escapeForRegExp(MANAGED_END)}`
  );

  if (blockPattern.test(current)) {
    const next = current.replace(blockPattern, managedBlock);
    fs.writeFileSync(agentsPath, ensureTrailingNewline(next));
    return;
  }

  const next = `${managedBlock}\n\n${current.replace(/^\s+/, "")}`;
  fs.writeFileSync(agentsPath, ensureTrailingNewline(next));
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureTrailingNewline(value) {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function planManagedFiles(selectedInstruction) {
  return [
    ...collectFiles(resolveSourceRoot(), ".codex"),
    path.join("instructions", selectedInstruction)
  ].filter((relativePath) => relativePath !== MANIFEST_RELATIVE_PATH);
}

function installIntoTarget(options = {}) {
  const sourceRoot = resolveSourceRoot();
  const targetRoot = resolveTargetRoot(options.target);
  ensureCodexProject(targetRoot);

  const instructionFiles = getSourceInstructionFiles(sourceRoot);
  const selectedInstruction = normalizeInstructionSelection(options.instruction, instructionFiles);
  const nextFiles = planManagedFiles(selectedInstruction);
  const previousManifest = readManifest(targetRoot);

  copyManagedFiles(sourceRoot, targetRoot, nextFiles);
  removeStaleFiles(targetRoot, previousManifest && previousManifest.files, nextFiles);
  updateAgentsFile(targetRoot, selectedInstruction);

  writeManifest(targetRoot, {
    packageName: "vergil-skills",
    version: "0.1.0",
    selectedInstruction,
    files: nextFiles,
    updatedAt: new Date().toISOString()
  });

  return {
    targetRoot,
    selectedInstruction,
    filesInstalled: nextFiles.length,
    removedFiles: previousManifest ? (previousManifest.files || []).filter((file) => !nextFiles.includes(file)) : []
  };
}

module.exports = {
  MANIFEST_RELATIVE_PATH,
  getSourceInstructionFiles,
  installIntoTarget,
  normalizeInstructionSelection,
  renderAgentsBlock,
  resolveSourceRoot
};
