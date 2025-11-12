# sim-v29

[![Build & Test](https://github.com/tylerschloesser/sim-v29/actions/workflows/test.yml/badge.svg)](https://github.com/tylerschloesser/sim-v29/actions/workflows/test.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Bun](https://img.shields.io/badge/Bun-1.x-000000?logo=bun&logoColor=white)](https://bun.sh/)

A hybrid React + PixiJS infinite 2D chunk-based world simulation with procedural generation.

## Features

- **Infinite procedurally generated world** using seeded simplex noise
- **Chunk-based rendering** (32×32 tiles per chunk, on-demand generation)
- **Resource gathering system** (coal, copper, iron, stone)
- **Entity placement system** with rotation support
- **Build mode** with visual preview and validation
- **Fixed timestep game loop** (60 TPS)
- **Camera controls** (WASD keyboard + drag with mouse/touch)

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **PixiJS 8** for high-performance canvas rendering
- **Vite 7** for blazing fast builds
- **TanStack Router** for file-based routing
- **Tailwind CSS 4** for styling
- **Vitest** for unit testing
- **Immer** for immutable state updates
- **Bun** for package management

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Type check & lint & format
bun check

# Build for production
bun run build
```

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routes
├── components/          # React components
│   └── entity-svgs/     # SVG entity graphics (converted to PixiJS textures)
├── pixi/                # PixiJS rendering layer
│   ├── ChunkManager.ts  # Chunk rendering
│   ├── EntityManager.ts # Entity sprite management
│   └── Grid.ts          # Infinite scrolling grid
└── lib/                 # Core logic & utilities
    ├── chunkUtils.ts    # Chunk generation (simplex noise)
    ├── entityUtils.ts   # Entity placement & validation
    └── types.ts         # Shared types
```

## Architecture

This project uses a **hybrid architecture** where React manages state and UI while PixiJS handles all canvas rendering for performance. State updates in React trigger PixiJS updates via controller callbacks, ensuring the two layers stay in sync.

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation.

## License

MIT
