# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` instead of `npm` for all package management and script execution.

## Build and Development Commands

- **Check code quality**: `bun check` (runs type checking, ESLint with auto-fix, and Prettier with auto-formatting)
- **Type checking**: `bun run tsc -b --noEmit` (run this after changes instead of full build)
- **Build**: `bun run build` (runs TypeScript compilation with `tsc -b` then Vite build)
- **Lint**: `bun run lint`
- **Preview production build**: `bun run preview`

**Important**: Always run `bun check` after making code changes to automatically fix and format code.

**Note**: Never run `bun run dev` yourself - the user will handle development server.

## Technology Stack

- **Framework**: React 19 with TypeScript
- **Build tool**: Vite 7
- **Router**: TanStack Router (file-based routing)
- **Canvas rendering**: PixiJS 8
- **Styling**: Tailwind CSS 4 with Vite plugin
- **Icons**: FontAwesome (including Pro icons)
- **State management**: Immer via `use-immer` hook
- **Bundler mode**: TypeScript configured with `moduleResolution: "bundler"`
- **JSX**: Uses React 17+ JSX transform (`jsx: "react-jsx"`)
- **Strict mode**: TypeScript strict mode enabled with additional linting rules

## TypeScript Configuration

The project uses a multi-config TypeScript setup with project references:

- `tsconfig.json`: Root config that references app and node configs
- `tsconfig.app.json`: Main application config for `src/` directory
  - Target: ES2022
  - Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
  - `noEmit: true` (Vite handles bundling)
- `tsconfig.node.json`: Config for Vite/Node tooling files

## Architecture

This is a **hybrid React + PixiJS application** for infinite 2D chunk-based world simulation with camera controls.

### Initialization Flow

1. `main.tsx` initializes PixiJS canvas first via `setupPixi()` before rendering React
2. `setupPixi()` returns `updateCamera` and `updateChunks` callbacks for React-to-PixiJS communication
3. Initial app state (camera position and chunks) is created outside React
4. Initial visible chunks are calculated and generated using simplex noise before React mounts
5. TanStack Router is configured with callbacks and initial state in router context
6. React app accesses callbacks via `Route.useRouteContext()` to synchronize with PixiJS

### State Management

- **React state** (via `use-immer`): Tracks camera position and chunk data in `AppState`
- **PixiJS rendering**: Grid and chunk graphics are managed in PixiJS layer
- **Router context**: Passes `updateCamera` and `updateChunks` callbacks through TanStack Router
- **Synchronization**: Camera/chunk state changes in React trigger PixiJS updates via callbacks

### Chunk System

- **Chunk structure**: 32×32 tile grid (configurable via `CHUNK_SIZE` in `types.ts`)
- **Tile size**: 32×32 pixels (configurable via `TILE_SIZE`)
- **Chunk IDs**: String format `"x,y"` in tile coordinates (aligned to `CHUNK_SIZE` boundaries)
- **Infinite world**: Chunks generated on-demand using seeded simplex noise (seed: "sim-v29-world")
- **Procedural generation**: Multi-octave noise (3 octaves) creates grayscale terrain
- **Chunk lifecycle**:
  1. `getVisibleChunks()` calculates which chunks should be visible based on camera + viewport
  2. Missing chunks are generated via `generateChunk()` with consistent noise
  3. `ChunkManager` renders/destroys PixiJS graphics for visible chunks
  4. Chunks persist in React state Map but PixiJS graphics are destroyed when off-screen

### Key Components

**React Layer:**
- `routes/index.tsx`: Root route component that manages app state and camera controls
- `routes/__root.tsx`: Router root that provides context interface
- `useCamera.ts`: Custom hook implementing camera input controls
  - WASD keyboard movement (continuous via `requestAnimationFrame`)
  - Pointer drag controls (mouse/touch/pen via Pointer Events API)
- `useSetCamera.ts`: Camera update hook that synchronizes React state → PixiJS
  - Updates camera position in state
  - Calculates visible chunks based on new camera position
  - Generates missing chunks on-demand
  - Triggers PixiJS updates via callbacks

**PixiJS Layer:**
- `pixi.ts`: PixiJS initialization and setup
  - Creates PixiJS application with proper DPI scaling
  - Initializes Grid and ChunkManager
  - Returns `updateCamera` and `updateChunks` callbacks
- `Grid.ts`: PixiJS class that renders infinite scrolling grid overlay
  - Uses modulo math to create seamless grid wrapping
  - Position updates based on camera coordinates
- `ChunkManager.ts`: Manages PixiJS Graphics objects for visible chunks
  - Renders chunks as colored tile rectangles
  - Destroys off-screen chunks to free memory
  - Updates container position based on camera

**Utilities:**
- `chunkUtils.ts`: Chunk generation and visibility calculations
  - `generateChunk()`: Creates chunk with procedurally generated tiles using simplex noise
  - `getVisibleChunks()`: Calculates which chunk IDs are visible given camera/viewport
- `types.ts`: Shared types and coordinate conversion utilities
  - `AppState`: Camera position + chunk Map
  - `Chunk`: Array of 1024 hex color values (32×32 tiles)
  - Coordinate helpers: `worldToTile()`, `tileToChunk()`, `getChunkId()`, `parseChunkId()`

### Important Patterns

- **Immer for immutable updates**: State updates use `use-immer` with draft mutations (Map/Set support enabled)
- **Lodash equality checks**: `isEqual()` prevents unnecessary PixiJS updates when camera doesn't change
- **Separation of concerns**: React handles UI, input, and state; PixiJS handles canvas rendering
- **Type safety**: Uses `ReadonlyDeep<T>` from `type-fest` to prevent accidental state mutations in updater functions
- **Callback-based communication**: React → PixiJS communication uses callbacks in closure, avoiding prop drilling
- **Router context pattern**: TanStack Router context provides PixiJS callbacks to route components
- **Deterministic generation**: Seeded RNG ensures same chunks generate identically across sessions
