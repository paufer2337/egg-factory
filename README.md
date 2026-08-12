# Egg Factory

Egg Factory is a responsive React application for Övning 10. The operator loads individual feeders, monitors their shared load, and watches ten eggs transfer automatically into a carton.

## Run locally

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```

`npm run check` runs linting, type checking, tests, and the production build in that order.

## Technology and structure

- React, TypeScript, and Vite
- Standard CSS with design tokens
- Vitest and Testing Library
- Local Fontsource packages for Barlow Condensed, Cooper Hewitt, and Space Mono
- One authoritative state model in `App`; the machine and control panel render the same data

The design is implemented from Figma nodes `60:3` and `80:263` in read-only mode. Durable exported Figma assets live under `src/assets/figma/`. This repository does not modify the Figma file.

## Special thanks

My deepest thanks to **[László Prekop](https://github.com/laszloprekop)**, who tutored and inspired me throughout this project. He generously shared ideas, practical techniques, and a live tour of his workflow, encouraging me to go beyond the expected and create something more exceptional. His guidance played part in helping me reach this level.
