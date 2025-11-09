# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` instead of `npm` for all package management and script execution.

## Build and Development Commands

- **Type checking**: `bun run tsc --noEmit` (run this after changes instead of full build)
- **Build**: `bun run build` (runs TypeScript compilation with `tsc -b` then Vite build)
- **Lint**: `bun run lint`
- **Preview production build**: `bun run preview`

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

## Project Structure

- `src/main.tsx`: Application entry point with React root rendering in StrictMode
- `src/App.tsx`: Root application component
- `index.html`: Vite entry HTML file
- `public/`: Static assets
