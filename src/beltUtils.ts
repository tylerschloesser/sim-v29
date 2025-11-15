import { BELT_ITEM_SPACING, getBeltLength } from "./constants";
import { getTileAtCoords } from "./tileUtils";
import type {
  AppState,
  BeltEntity,
  BeltItem,
  ChunkId,
  TestBeltOutputEntity,
} from "./types";
import { CHUNK_SIZE, getChunkId, tileToChunk } from "./types";

export interface AdjacentTile {
  tile: { x: number; y: number };
  belt: BeltEntity | null;
}

export interface AdjacentBelts {
  top: AdjacentTile;
  right: AdjacentTile;
  bottom: AdjacentTile;
  left: AdjacentTile;
}

/**
 * Gets all 4 adjacent tiles and their belt entities for a given belt.
 *
 * Returns tiles in clockwise order starting from top:
 * - top: (x, y - 1)
 * - right: (x + 1, y)
 * - bottom: (x, y + 1)
 * - left: (x - 1, y)
 */
export function getAdjacentBelts(
  entity: BeltEntity,
  state: AppState,
): AdjacentBelts {
  const { position } = entity;

  // Define all 4 adjacent tiles (top, right, bottom, left)
  const topTile = { x: position.x, y: position.y - 1 };
  const rightTile = { x: position.x + 1, y: position.y };
  const bottomTile = { x: position.x, y: position.y + 1 };
  const leftTile = { x: position.x - 1, y: position.y };

  // Get belt entities at each adjacent tile
  const topBelt = getBeltAtTile(topTile, state);
  const rightBelt = getBeltAtTile(rightTile, state);
  const bottomBelt = getBeltAtTile(bottomTile, state);
  const leftBelt = getBeltAtTile(leftTile, state);

  return {
    top: { tile: topTile, belt: topBelt },
    right: { tile: rightTile, belt: rightBelt },
    bottom: { tile: bottomTile, belt: bottomBelt },
    left: { tile: leftTile, belt: leftBelt },
  };
}

/**
 * Helper function to get a belt entity at a specific tile position, or null if none exists.
 */
function getBeltAtTile(
  tile: { x: number; y: number },
  state: AppState,
): BeltEntity | null {
  // Calculate which chunk contains this tile
  const chunkX = tileToChunk(tile.x);
  const chunkY = tileToChunk(tile.y);
  const chunkId: ChunkId = getChunkId(chunkX, chunkY);

  const chunk = state.chunks.get(chunkId);

  if (!chunk) {
    return null;
  }

  // Calculate tile position within chunk
  const tileXInChunk = tile.x - chunkX;
  const tileYInChunk = tile.y - chunkY;
  const tileIndex = tileYInChunk * CHUNK_SIZE + tileXInChunk;

  // Get the tile
  const tileData = chunk.tiles[tileIndex];

  if (!tileData || !tileData.entityId) {
    return null;
  }

  // Get the entity
  const entity = state.entities.get(tileData.entityId);

  // Return the entity if it's a belt, otherwise null
  if (entity && entity.type === "belt") {
    return entity;
  }

  return null;
}

/**
 * Gets the input tile for a belt based on its rotation.
 * The input is always from the opposite direction of the belt's rotation.
 */
export function getInputTile(belt: BeltEntity): { x: number; y: number } {
  const { position, rotation } = belt;

  switch (rotation) {
    case 0: // Facing right, input from left
      return { x: position.x - 1, y: position.y };
    case 90: // Facing down, input from top
      return { x: position.x, y: position.y - 1 };
    case 180: // Facing left, input from right
      return { x: position.x + 1, y: position.y };
    case 270: // Facing up, input from bottom
      return { x: position.x, y: position.y + 1 };
  }
}

/**
 * Gets the output tile for a belt based on its rotation and turn value.
 * - turn "none": output in the direction of rotation
 * - turn "left": output 90 degrees counter-clockwise from rotation
 * - turn "right": output 90 degrees clockwise from rotation
 */
export function getOutputTile(belt: BeltEntity): { x: number; y: number } {
  const { position, rotation, turn } = belt;

  // Calculate effective output direction based on rotation and turn
  let outputRotation = rotation;

  if (turn === "left") {
    // Turn left: subtract 90 degrees (counter-clockwise)
    outputRotation = ((rotation - 90 + 360) % 360) as 0 | 90 | 180 | 270;
  } else if (turn === "right") {
    // Turn right: add 90 degrees (clockwise)
    outputRotation = ((rotation + 90) % 360) as 0 | 90 | 180 | 270;
  }

  // Return tile in the output direction
  switch (outputRotation) {
    case 0: // Output to right
      return { x: position.x + 1, y: position.y };
    case 90: // Output to bottom
      return { x: position.x, y: position.y + 1 };
    case 180: // Output to left
      return { x: position.x - 1, y: position.y };
    case 270: // Output to top
      return { x: position.x, y: position.y - 1 };
  }
}

/**
 * Gets the belt entity at the input tile, or null if none exists.
 */
export function getInputBelt(
  belt: BeltEntity,
  state: AppState,
): BeltEntity | null {
  const inputTile = getInputTile(belt);
  return getBeltAtTile(inputTile, state);
}

/**
 * Gets the belt entity at the output tile, or null if none exists.
 */
export function getBeltOutputEntity(
  belt: BeltEntity,
  state: AppState,
): BeltEntity | TestBeltOutputEntity | null {
  const { x: tileX, y: tileY } = getOutputTile(belt);
  const tile = getTileAtCoords(state, tileX, tileY);
  const entity = tile?.entityId ? state.entities.get(tile.entityId) : null;
  if (!entity) {
    return null;
  }
  if (entity.type === "belt" || entity.type === "test-belt-output") {
    return entity;
  }
  return null;
}

/**
 * Checks if an item on a belt can move forward by the specified distance.
 * Ensures proper spacing between items and checks if the next belt can accept the item.
 *
 * @param belt The belt containing the item
 * @param lane The lane containing the item
 * @param fromPosition Current position of the item (0-63)
 * @param distance Distance to move (typically BELT_SPEED = 1)
 * @param outputEntity Optional output belt to check if item would transfer
 * @param laneType Which lane is being checked ("left" or "right")
 * @returns true if the item can move, false otherwise
 */
export function canItemMove(
  belt: BeltEntity,
  lane: BeltItem[],
  fromPosition: number,
  distance: number,
  outputEntity: BeltEntity | TestBeltOutputEntity | null,
  laneType: "left" | "right",
): boolean {
  const newPosition = fromPosition + distance;

  // Check if item would transfer to next belt
  if (newPosition >= getBeltLength(belt.turn, laneType)) {
    // If there's no output belt, item cannot move past end
    if (!outputEntity) {
      return false;
    }

    if (outputEntity.type === "test-belt-output") {
      return true;
    }

    // Check if output belt's corresponding lane has space at position 0
    const outputLane =
      laneType === "left" ? outputEntity.leftLane : outputEntity.rightLane;
    const blockingItem = outputLane.find(
      (item) => item.position < BELT_ITEM_SPACING + distance,
    );

    return !blockingItem; // Can move if no blocking item
  }

  // Check if there's another item blocking on the same belt
  const blockingItem = lane.find((item) => {
    if (item.position <= fromPosition) {
      return false; // Item is behind, not blocking
    }
    // Check if item is within the minimum spacing distance
    return item.position < fromPosition + BELT_ITEM_SPACING + distance;
  });

  return !blockingItem; // Can move if no blocking item
}

/**
 * Represents a belt network - a connected group of belts
 */
export interface BeltNetwork {
  /** Belts in this network, ordered from output to input (tick order) */
  belts: BeltEntity[];
  /** Whether this network contains a cycle */
  hasCycle: boolean;
}

/**
 * Result of computing belt networks
 */
export interface BeltNetworks {
  /** Networks that end in a terminal belt (no output) */
  terminalNetworks: BeltNetwork[];
  /** Networks that contain cycles */
  cycleNetworks: BeltNetwork[];
}

/**
 * Computes all belt networks in the current state.
 * A network is a connected group of belts.
 * Networks either end in a terminal belt (no output) or contain a cycle.
 */
export function computeBeltNetworks(state: AppState): BeltNetworks {
  const allBelts: BeltEntity[] = [];

  // Collect all belt entities
  for (const entity of state.entities.values()) {
    if (entity.type === "belt") {
      allBelts.push(entity);
    }
  }

  // Track which belts have been assigned to a network
  const assignedBelts = new Set<string>();

  const terminalNetworks: BeltNetwork[] = [];
  const cycleNetworks: BeltNetwork[] = [];

  // Process each unassigned belt
  for (const belt of allBelts) {
    if (assignedBelts.has(belt.id)) {
      continue; // Already assigned to a network
    }

    // Find all belts in this network using depth-first search
    const network = findBeltNetwork(belt, state, assignedBelts);

    if (network.hasCycle) {
      cycleNetworks.push(network);
    } else {
      terminalNetworks.push(network);
    }
  }

  return { terminalNetworks, cycleNetworks };
}

/**
 * Finds all belts in a network starting from a given belt.
 * Uses depth-first search to explore the network.
 */
function findBeltNetwork(
  startBelt: BeltEntity,
  state: AppState,
  assignedBelts: Set<string>,
): BeltNetwork {
  const visited = new Set<string>();
  const beltsInNetwork: BeltEntity[] = [];

  // First pass: collect all connected belts (explore both directions)
  function collectBelts(belt: BeltEntity) {
    if (visited.has(belt.id)) {
      return;
    }

    visited.add(belt.id);
    assignedBelts.add(belt.id);
    beltsInNetwork.push(belt);

    // Explore both input and output to find all connected belts
    const inputBelt = getInputBelt(belt, state);
    if (inputBelt) {
      collectBelts(inputBelt);
    }

    const outputBelt = getBeltOutputEntity(belt, state);
    if (outputBelt?.type === "belt") {
      collectBelts(outputBelt);
    }
  }

  collectBelts(startBelt);

  // Second pass: detect if there's a cycle by following output chain
  const hasCycle = detectCycle(beltsInNetwork, state);

  // If there's no cycle, order belts from output to input (for proper ticking)
  if (!hasCycle) {
    const orderedBelts = topologicalSort(beltsInNetwork, state);
    return { belts: orderedBelts, hasCycle: false };
  }

  return { belts: beltsInNetwork, hasCycle: true };
}

/**
 * Detects if there's a cycle in the belt network by following output connections.
 */
function detectCycle(belts: BeltEntity[], state: AppState): boolean {
  const beltIds = new Set(belts.map((b) => b.id));
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycleDFS(belt: BeltEntity): boolean {
    visited.add(belt.id);
    recStack.add(belt.id);

    const outputBelt = getBeltOutputEntity(belt, state);
    if (outputBelt?.type === "belt" && beltIds.has(outputBelt.id)) {
      if (recStack.has(outputBelt.id)) {
        return true; // Found a cycle
      }
      if (!visited.has(outputBelt.id) && hasCycleDFS(outputBelt)) {
        return true;
      }
    }

    recStack.delete(belt.id);
    return false;
  }

  // Check from each belt in the network
  for (const belt of belts) {
    if (!visited.has(belt.id)) {
      if (hasCycleDFS(belt)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Performs topological sort on belts to determine tick order.
 * Returns belts ordered from output to input (terminal belt first).
 */
function topologicalSort(belts: BeltEntity[], state: AppState): BeltEntity[] {
  // Find terminal belt (no output or output not in network)
  const beltIds = new Set(belts.map((b) => b.id));

  const terminalBelt = belts.find((belt) => {
    const outputBelt = getBeltOutputEntity(belt, state);
    return !outputBelt || !beltIds.has(outputBelt.id);
  });

  if (!terminalBelt) {
    // No terminal belt found, return as-is (shouldn't happen for non-cycle)
    return belts;
  }

  // Build ordered list starting from terminal belt and working backwards
  const ordered: BeltEntity[] = [];
  const visited = new Set<string>();

  function visit(belt: BeltEntity) {
    if (visited.has(belt.id)) {
      return;
    }

    visited.add(belt.id);
    ordered.push(belt);

    // Find all belts that feed into this belt
    const inputBelt = getInputBelt(belt, state);
    if (inputBelt && beltIds.has(inputBelt.id)) {
      visit(inputBelt);
    }
  }

  visit(terminalBelt);

  // Also visit any remaining unvisited belts (in case of disconnected components)
  for (const belt of belts) {
    if (!visited.has(belt.id)) {
      visit(belt);
    }
  }

  return ordered;
}
