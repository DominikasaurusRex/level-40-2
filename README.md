# Level 40 2

*Read as "Level 42".*

The sequel to **Level 40**

## Where this starts

Level 40 2 starts from the **original Level 40 system**, because it already exists and works.
From there, systems are replaced one by one. Each replacement fixes something that came up while
developing Level 40 and that should have been done better.

So at any point the game is a mix of:

- **Original systems**, carried over unchanged from Level 40, and
- **New systems**, redesigned for Level 40 2.

## Documentation

| Location | Contents |
| -------- | -------- |
| [`.documentation/level40-system-documentation/`](./.documentation/level40-system-documentation/README.md) | How the **original** Level 40 works: architecture, combat, progression, weapons, skills, enemies, balancing, saving, UI. This is the baseline. |

When a system is redesigned, its new documentation lives alongside it. The original docs stay as a
reference for what changed and why.

## Tech

Same stack as the original: Vue 3 + TypeScript, Pinia, Vite, Vitest. No backend.

```sh
npm install
npm run dev     # dev server
npm run build   # type-check + build
npm test        # tests
```
