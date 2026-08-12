# Egg Factory repository guidance

## Product identity

- The product name is **Egg Factory**.
- The visible primary heading is `EGG FACTORY` and the document title is `Egg Factory`.
- “Industrial Egg Loader” is a machine concept, not the user-facing product name.

## Component and state ownership

- `App` owns the counter array, collector value, transfer phase, stable ID allocation, reset behavior, and all transfer timers.
- The shared total is always derived from `counters.reduce()`; capacity is `counters.length * 3`.
- `Counter` is controlled through props and never owns its numeric value.
- `Collector` is controlled through props and never owns collector state.
- `MachineVisual`, `FeederLane`, `Carton`, `SplitFlap`, `StatusWord`, and `TotalMeter` are presentational. Decorative eggs and carton occupancy derive from the same counter total used by the dashboard.
- Add counters with stable, monotonically allocated numeric IDs. Remove with `filter()` and never renumber survivors.
- Preserve the current roster during `MASTER RESET`.
- Every `CounterState` contains its controlled `value` and `disabled` fields. A value of 3 sets `disabled: true`; reset and transfer restore `value: 0, disabled: false`.
- Keep the App-owned global transfer lock separate from each counter's `disabled` field.

## Transfer rules

- A load that reaches exactly 10 enters `threshold`, then `closing`, `exiting`, `inserting`, `resetting`, and finally `idle`.
- Named timing constants live in `App.tsx`.
- Clear all timers on reset and unmount. Never introduce a second machine-specific state model.

## Figma authority

- Master composition: file `UYdR3FGOiJyMBH1rxCGXTY`, node `60:3`.
- Carton proof: the same file, node `80:263`.
- Figma is read-only from this repository. Do not call Figma write tools and do not rename Figma nodes.
- Treat generated Figma code as reference and adapt it to React, TypeScript, and standard CSS.
- Keep durable exact exports in `src/assets/figma/`; never commit expiring MCP URLs.

## Validation

Run these before handoff:

```text
npm run lint
npm run typecheck
npm run test
npm run build
npm run check
```
