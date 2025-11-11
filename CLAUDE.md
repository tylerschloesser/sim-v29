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
- **Procedural generation**: simplex-noise with prando (seeded RNG)
- **Utilities**: lodash-es (equality checks), tiny-invariant (runtime assertions), clsx (conditional classNames)
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
2. `initializeTextures()` renders React SVG components to PixiJS textures via Base64 data URLs
3. `setupPixi()` returns `controller` object with callbacks for React-to-PixiJS communication
4. Initial app state (camera position and chunks) is created outside React via `initializeState()`
5. Initial visible chunks are calculated and generated using simplex noise before React mounts
6. Initial entities pre-rendered to PixiJS before React mounts
7. React app wraps all routes with `AppContextProvider` that provides state and controller
8. Components access state and controller via `useAppContext()` hook

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
- **Procedural generation**: Multi-octave noise (3 octaves, 0.5 amplitude decay, frequency doubling) creates grayscale terrain
- **Coordinate system**:
  - World coordinates: Pixels from origin
  - Tile coordinates: `Math.floor(worldCoord / TILE_SIZE)`
  - Chunk coordinates: `Math.floor(tileCoord / CHUNK_SIZE) * CHUNK_SIZE`
- **Chunk lifecycle**:
  1. `getVisibleChunks()` calculates which chunks should be visible based on camera + viewport (with 1-chunk buffer)
  2. Missing chunks are generated via `generateChunk()` with consistent seeded noise
  3. `ChunkManager` renders/destroys PixiJS graphics for visible chunks
  4. Chunks persist in React state Map but PixiJS graphics are destroyed when off-screen to free memory

### Texture System

- **React SVG Components**: Entity visuals defined as React components in `components/entity-svgs/`
- **Conversion Flow**: React → `renderToStaticMarkup()` → SVG string → Base64 data URL → PixiJS Texture
- **TextureManager**: Centralized system that initializes all entity textures before React mounts
- **Texture Access**: EntityManager and BuildManager retrieve textures via `TextureManager.getTexture(entityType)`
- **Pre-initialization**: All textures loaded via `initializeTextures()` in `main.tsx` before PixiJS setup
- **Advantages**: Allows using React's JSX for complex SVG graphics while maintaining PixiJS rendering performance

### Resource and Entity System

- **Resources**: Tiles can contain resources (coal, copper, iron, stone) with count and type
- **Resource rendering**: Resources overlay terrain with checkerboard pattern (4×4 grid of 8×8 pixel squares) using `RESOURCE_COLORS`
- **Entities**: Placeable structures (stone-furnace, home-storage, burner-inserter) that occupy multiple tiles
- **Entity structure**: Each entity has ID, type, position (top-left tile), size in tiles, and rotation (0/90/180/270 degrees)
- **Rotation mechanics**: Rotatable entities swap width/height dimensions at 90/270 degrees
- **Entity tracking**: Tiles store `entityId` reference; entities stored in `state.entities` Map
- **Entity rendering**: Entities rendered as PixiJS sprites using textures from React SVG components
- **Build system**: Build mode (`/build` route) shows preview with green (valid) or red (invalid) overlay
  - URL search params store selected entity type and rotation
  - Validation ensures all tiles are free of entities
  - Placement decrements inventory count and auto-deselects when inventory reaches 0

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
- `useTicker.ts`: Fixed 60 TPS game loop with accumulator pattern, decoupled from display framerate

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
- `EntityManager.ts`: Manages PixiJS Sprites for entities
  - Renders entities as sprites with textures from TextureManager
  - Anchor at center (0.5, 0.5) for rotation
  - 0.7 alpha for semi-transparency, rotation in radians
  - Updates entity graphics when entities change
- `BuildManager.ts`: Manages PixiJS Sprites for build preview
  - Shows build preview with tint (green for valid, red for invalid)
  - 0.5 alpha for preview effect
- `TextureManager.tsx`: React SVG component to PixiJS texture conversion
  - Renders React components from `components/entity-svgs/` to static SVG markup
  - Converts SVG to Base64 data URLs
  - PixiJS Assets loads textures from data URLs
  - Provides centralized texture access for EntityManager and BuildManager

**Utilities:**

- `chunkUtils.ts`: Chunk generation and visibility calculations
  - `generateChunk()`: Creates chunk with procedurally generated tiles using simplex noise
  - `getVisibleChunks()`: Calculates which chunk IDs are visible given camera/viewport
  - `addResourceToTile()`: Adds resource to specific tile coordinates
- `entityUtils.ts`: Entity helper functions
  - `getTilesForEntity()`: Returns all tiles occupied by an entity (accounts for rotation)
  - `getEntityColor()`: Returns display color for entity type
  - `isEntityPlacementValid()`: Validates entity placement (checks all tiles are free)
  - `rotateEntity()`: Rotates entity and swaps dimensions for 90/270 degree rotations
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

### Game Loop & Actions

**Ticker System** (`useTicker.ts`):

- Fixed timestep: 60 ticks per second (~16.67ms per tick)
- Uses `requestAnimationFrame` with accumulator pattern
- Decoupled from display framerate for consistent simulation
- Processes actions and increments tick counter each tick

**Actions System**:

- Currently supports "mine" action for resource gathering
- Action structure: `{ type: "mine", tileId, resource, startedAt }`
- Progress: 0 to 1 over 2 seconds (120 ticks)
- Auto-increments progress each tick in `__root.tsx`
- On completion:
  - Adds resource to inventory
  - Decrements resource count on tile
  - Removes resource when count reaches 0
  - Clears action from state

### Routing Architecture

**TanStack Router** (file-based routing):

- Routes defined in `routes/` directory
- `__root.tsx`: Root layout applies camera controls, entity sync, and ticker to all routes
- `index.tsx`: Home route with TopBar and BottomBar
- `build.tsx`: Build mode with entity selection, rotation controls, and placement
- `textures.tsx`: Debug route showing all entity textures

**Route Features**:

- `validateSearch`: Type-safe search parameter validation
- Search params store UI state (selected entity, rotation)
- Navigation via `useNavigate()` hook from TanStack Router
- `<Outlet />` renders nested child routes
- Search params update via `navigate({ search: { ... } })`

### Important Patterns

- **Immer for immutable updates**: State updates use `use-immer` with draft mutations (Map/Set support enabled)
- **Lodash equality checks**: `isEqual()` prevents unnecessary PixiJS updates when camera doesn't change
- **Separation of concerns**: React handles UI, input, and state; PixiJS handles canvas rendering
- **Type safety**: Uses strict TypeScript with union types for entities and resources
- **Callback-based communication**: React → PixiJS communication uses controller callbacks, avoiding prop drilling
- **Context pattern**: `AppContext` provides state and controller to entire component tree
- **Deterministic generation**: Seeded RNG ensures same chunks generate identically across sessions
- **Render order**: ChunkManager → EntityManager → BuildManager → Grid → TileHighlight (bottom to top)
- **Fixed timestep game loop**: Simulation runs at consistent 60 TPS regardless of display framerate
- **Component co-location**: React components generate SVG graphics, then converted to PixiJS textures
- **Memory management**: Off-screen chunk graphics destroyed to prevent memory leaks while maintaining state
