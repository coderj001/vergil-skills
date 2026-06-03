---
name: prototype
description: "build a throwaway prototype to answer design questions before committing to production code. use when the user wants to prototype, sanity-check a data model or state machine, mock up a ui, explore design options, make something playable, or says prototype this, let me play with it, or try a few designs. routes between two branches: a runnable terminal app for state/business-logic questions, or several radically different ui variations toggleable from one route for visual/product direction questions."
---

# Prototype

A prototype is throwaway code that answers a question. First identify the question, then choose the smallest runnable shape that can answer it mainly in seperate git worktrees.

## Workflow

1. Identify the question being answered from the user's prompt, surrounding code, openspec artifacts, or a brief clarification if the user is actively available.
2. Choose exactly one prototype branch:
   - **Logic or state model question**: build a tiny interactive terminal app that pushes the state machine or business rules through cases that are hard to reason about on paper.
   - **Visual or product direction question**: build several radically different UI variations on a single route, switchable via a URL search parameter and a floating bottom bar.
3. Trigger the project planning flow with `openspec-new-change` or `opesx-new`, matching whichever convention exists in the project make sure artifact generated mention that it's an prototype.
4. Ask the user to run `openspec-ff-change` or `opesx-ff`, matching the convention chosen above.
5. Continue with the `using-git-worktrees` skill if available. If it is not available, follow the repository's existing git worktree or branch conventions.

## Rules for every prototype

- Treat the prototype as disposable from the start and clearly mark it as throwaway.
- Locate the code near the module, page, or domain it is prototyping so the context is obvious.
- Name files, routes, commands, and comments so a casual reader can see this is not production code.
- Obey the project's existing routing and task-runner conventions. Do not invent a new top-level structure for throwaway UI routes.
- Provide one command to run, using the existing task runner such as `pnpm <name>`, `python <path>`, or `bun <path>`.
- Use in-memory state by default. Do not add persistence unless persistence itself is the question being tested.
- If a database is explicitly needed, use a scratch database or local file with a clear `PROTOTYPE - wipe me` style name.
- Skip polish: no tests, no production abstractions, and no error handling beyond what makes the prototype runnable.
- Surface the full relevant state after every action in a terminal prototype, and on every variant switch in a UI prototype.
- Delete or absorb the prototype once it has answered the question.

## Terminal app branch

Use this branch when the open question is whether logic, data modeling, business rules, or state transitions feel right.

Build a small interactive app that lets the user drive the important transitions manually. Prefer simple commands, printed menus, or numbered actions over a polished interface. After every action, print the complete relevant state and enough derived values to make invariants visible.

Keep domain logic inline unless a tiny helper makes the prototype easier to inspect. The goal is to create a playable state machine, not a reusable library.

End with a run command and a short note naming the cases the prototype is meant to exercise.

## UI variations branch

Use this branch when the open question is what something should look like or how a product interaction should feel.

Create several radically different variations behind one throwaway route. Make the active variation switchable with a URL search parameter such as `?variant=a`, `?variant=b`, or `?variant=c`, plus a floating bottom bar that lets the user switch without editing the URL.

Each variation should explore a distinct direction rather than small cosmetic changes. Render the full relevant state or configuration for the active variant so the user can see what changed.

Use the existing app framework and routing conventions. Put the route close to the production page or module it informs, and mark it as a prototype in file names and visible page copy.

## Capture the answer

The only thing worth keeping is the answer learned from the prototype. When done, capture the question and verdict somewhere durable, such as a commit message or a `NOTES.md` next to the prototype.

If the verdict is not known yet, leave a placeholder in `NOTES.md` with:

```markdown
# Prototype verdict

Question:

What we tried:

Decision / verdict:

Delete or absorb plan:
```

After the prototype has answered its question, ask whether to merge to `main` or `master` based on the user's preference.
