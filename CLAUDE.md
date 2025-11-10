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
2. `setupPixi()` returns `controller` object with callbacks for React-to-PixiJS communication
3. Initial app state (camera position and chunks) is created outside React via `initializeState()`
4. Initial visible chunks are calculated and generated using simplex noise before React mounts
5. React app wraps all routes with `AppContextProvider` that provides state and controller
6. Components access state and controller via `useAppContext()` hook

### State Management

- **React state** (via `use-immer`): Tracks camera position, chunks, entities, actions, tick, and inventory in `AppState`
- **PixiJS rendering**: Grid, chunks, entities, and build previews are managed in PixiJS layer
- **Context pattern**: `AppContext` provides `state`, `updateState`, and `pixiController` to all components
- **Synchronization**: State changes in React trigger PixiJS updates via controller callbacks
- **Immer configuration**: Map/Set support enabled via `enableMapSet()` in main.tsx

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

### Resource and Entity System

- **Resources**: Tiles can contain resources (coal, copper, iron, stone) with count and type
- **Resource rendering**: Resources overlay terrain with checkerboard pattern using `RESOURCE_COLORS`
- **Entities**: Placeable structures (stone-furnace, home-storage) that occupy multiple tiles
- **Entity structure**: Each entity has ID, type, position (top-left tile), and size in tiles
- **Entity tracking**: Tiles store `entityId` reference; entities stored in `state.entities` Map
- **Build system**: Build mode (`/build` route) shows preview with green (valid) or red (invalid) overlay

### Key Components

**React Layer:**

- `main.tsx`: Entry point that initializes PixiJS, creates state, and renders React
- `AppContextProvider.tsx`: Context provider that wraps router with state and controller
- `routes/__root.tsx`: Router root that applies camera controls and entity updates to all routes
- `routes/index.tsx`: Home route with top/bottom bars
- `routes/build.tsx`: Build mode route with entity selection and placement
- `useCamera.ts`: Custom hook implementing camera input controls
  - WASD keyboard movement (continuous via `requestAnimationFrame`)
  - Pointer drag controls (mouse/touch/pen via Pointer Events API)
- `useSetCamera.ts`: Camera update hook that synchronizes React state → PixiJS
  - Updates camera position in state
  - Calculates visible chunks based on new camera position
  - Generates missing chunks on-demand
  - Triggers PixiJS updates via callbacks
- `useSetEntities.ts`: Entity update hook that synchronizes React state → PixiJS
- `useBuildPreview.ts`: Manages build preview based on mouse position and selected entity
- `useHandleBuild.ts`: Handles build placement logic and inventory management

**PixiJS Layer:**

- `pixi.ts`: PixiJS initialization and setup
  - Creates PixiJS application with proper DPI scaling
  - Initializes managers (ChunkManager, EntityManager, BuildManager, Grid, TileHighlight)
  - Returns `PixiController` object with update callbacks
- `PixiController.ts`: Interface defining controller callbacks (updateCamera, updateChunks, updateEntities, updateBuild)
- `Grid.ts`: PixiJS class that renders infinite scrolling grid overlay
  - Uses modulo math to create seamless grid wrapping
  - Position updates based on camera coordinates
- `ChunkManager.ts`: Manages PixiJS Graphics objects for visible chunks
  - Renders chunks as colored tile rectangles
  - Overlays resources with checkerboard pattern
  - Destroys off-screen chunks to free memory
  - Updates container position based on camera
- `EntityManager.ts`: Manages PixiJS Graphics for entities
  - Renders entities with semi-transparent fill and border
  - Updates entity graphics when entities change
- `BuildManager.ts`: Manages PixiJS Graphics for build preview
  - Shows green overlay for valid placement
  - Shows red overlay for invalid placement

**Utilities:**

- `chunkUtils.ts`: Chunk generation and visibility calculations
  - `generateChunk()`: Creates chunk with procedurally generated tiles using simplex noise
  - `getVisibleChunks()`: Calculates which chunk IDs are visible given camera/viewport
  - `addResourceToTile()`: Adds resource to specific tile coordinates
- `entityUtils.ts`: Entity helper functions
  - `getTilesForEntity()`: Returns all tiles occupied by an entity
  - `getEntityColor()`: Returns display color for entity type
  - `isEntityPlacementValid()`: Validates entity placement
- `tileUtils.ts`: Tile helper functions for finding tiles at world coordinates
- `types.ts`: Shared types and coordinate conversion utilities
  - `AppState`: Camera position, chunks Map, entities Map, action, tick, inventory
  - `Chunk`: Object with `tiles` array (1024 Tile objects for 32×32 grid)
  - `Tile`: Object with color, optional resource, and optional entityId
  - `Entity`: Union type of entity types with id, type, position, size
  - `Build`: Build preview with entity and valid flag
  - Coordinate helpers: `worldToTile()`, `tileToChunk()`, `getChunkId()`, `parseChunkId()`
  - Entity helpers: `getEntityId()`, `createEntity()`, `getEntityConfig()`
- `initState.ts`: Initial state creation
  - Generates starting 4×4 chunk area
  - Places initial resources at specific coordinates
  - Creates home-storage entity at (-1, -1)

### Important Patterns

- **Immer for immutable updates**: State updates use `use-immer` with draft mutations (Map/Set support enabled)
- **Lodash equality checks**: `isEqual()` prevents unnecessary PixiJS updates when camera doesn't change
- **Separation of concerns**: React handles UI, input, and state; PixiJS handles canvas rendering
- **Type safety**: Uses strict TypeScript with union types for entities and resources
- **Callback-based communication**: React → PixiJS communication uses controller callbacks, avoiding prop drilling
- **Context pattern**: `AppContext` provides state and controller to entire component tree
- **Deterministic generation**: Seeded RNG ensures same chunks generate identically across sessions
- **Render order**: ChunkManager → EntityManager → BuildManager → Grid → TileHighlight (bottom to top)
