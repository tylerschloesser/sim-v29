# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` instead of `npm` for all package management and script execution.

## Build and Development Commands

- **Check code quality**: `bun check` (runs type checking, ESLint with auto-fix, and Prettier with auto-formatting)
- **Type checking**: `bun run tsc --noEmit` (run this after changes instead of full build)
- **Build**: `bun run build` (runs TypeScript compilation with `tsc -b` then Vite build)
- **Lint**: `bun run lint`
- **Preview production build**: `bun run preview`

**Important**: Always run `bun check` after making code changes to automatically fix and format code.

**Note**: Never run `bun run dev` yourself - the user will handle development server.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build tool**: Vite 7
- **Bundler mode**: TypeScript configured with `moduleResolution: "bundler"`
- **JSX**: Uses React 17+ JSX transform (`jsx: "react-jsx"`)
- **Strict mode**: TypeScript strict mode enabled with additional linting rules

## TypeScript Configuration

The project uses a multi-config TypeScript setup:

- `tsconfig.json`: Root config that references app and node configs
- `tsconfig.app.json`: Main application config for `src/` directory
  - Target: ES2022
  - Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
  - `noEmit: true` (Vite handles bundling)
- `tsconfig.node.json`: Config for Vite/Node tooling files

## Architecture

This is a **hybrid React + PixiJS application** for 2D simulations with camera controls.

### Initialization Flow

1. `main.tsx` initializes PixiJS canvas first via `setupPixi()` before rendering React
2. `setupPixi()` returns an `updateCamera` callback that React uses to communicate with PixiJS
3. React app receives the `updateCamera` callback as a prop and uses it to synchronize camera state

### State Management

- **React state** (via `use-immer`): Tracks camera position (`camera.x`, `camera.y`)
- **PixiJS rendering**: Grid and graphics objects are managed in PixiJS layer
- **Synchronization**: Camera state changes in React trigger PixiJS updates via the `updateCamera` callback

### Key Components

- `App.tsx`: Root React component that manages camera state and passes `updateCamera` to PixiJS
- `useCamera.ts`: Custom hook implementing camera controls:
  - WASD keyboard movement (continuous via `requestAnimationFrame`)
  - Pointer drag controls (mouse/touch/pen via Pointer Events API)
- `Grid.ts`: PixiJS class that renders infinite scrolling grid
  - Uses modulo math to create seamless grid wrapping
  - Grid position updates based on camera coordinates
- `pixi.ts`: PixiJS initialization and setup
  - Creates PixiJS application with proper DPI scaling
  - Returns `updateCamera` callback for React-to-PixiJS communication

### Important Patterns

- **Immer for immutable updates**: State updates use `use-immer` with draft mutations
- **Lodash equality checks**: `isEqual()` prevents unnecessary PixiJS updates when camera doesn't change
- **Separation of concerns**: React handles UI and input, PixiJS handles canvas rendering
- **Type safety**: Uses `ReadonlyDeep<T>` from `type-fest` to prevent accidental state mutations
