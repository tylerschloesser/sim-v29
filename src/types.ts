import {
  faBoreHole,
  faConveyorBelt,
  faFireBurner,
  faHouse,
  faRightFromBracket,
  faRightFromLine,
  faRightToBracket,
  type IconDefinition,
} from "@fortawesome/pro-solid-svg-icons";
import {
  decrementInventory,
  incrementInventory,
  inventoryHas,
} from "./inventoryUtils";
import { BELT_ITEM_SPACING } from "./constants";

export const CHUNK_SIZE = 32; // tiles per chunk
export const TILE_SIZE = 32; // pixels per tile

export type ChunkId = string; // format: "x,y" in tile coordinates
export type TileId = string; // format: "x,y" in global tile coordinates
export type EntityId = string; // format: "entity-N" where N is sequential number
export type BeltItemId = string; // format: "item-N" where N is sequential number

export type ResourceType = "coal" | "copper" | "iron" | "stone";

export interface Resource {
  type: ResourceType;
  count: number;
}

export type EntityType =
  | "stone-furnace"
  | "home-storage"
  | "burner-inserter"
  | "burner-mining-drill"
  | "belt"
  | "test-belt-input"
  | "test-belt-output";

export type ItemType = ResourceType | EntityType | "iron-plate";

export const ENTITY_TYPES = [
  "stone-furnace",
  "home-storage",
  "burner-inserter",
  "burner-mining-drill",
  "belt",
  "test-belt-input",
  "test-belt-output",
] as const satisfies readonly EntityType[];

// Compile-time check that ensures all EntityType values are included
type AssertAllEntityTypes = (typeof ENTITY_TYPES)[number] extends EntityType
  ? EntityType extends (typeof ENTITY_TYPES)[number]
    ? true
    : "Missing entity type in ENTITY_TYPES array"
  : "Invalid entity type in ENTITY_TYPES array";
const _checkEntityTypes: AssertAllEntityTypes = true;
void _checkEntityTypes; // Suppress unused variable warning

export function isEntityType(value: unknown): value is EntityType {
  return (
    typeof value === "string" && ENTITY_TYPES.includes(value as EntityType)
  );
}

const ITEM_TYPES_ARRAY = [
  "coal",
  "copper",
  "iron",
  "stone",
  "stone-furnace",
  "home-storage",
  "burner-inserter",
  "burner-mining-drill",
  "belt",
  "test-belt-input",
  "test-belt-output",
  "iron-plate",
] as const satisfies readonly ItemType[];

// Compile-time check that ensures all ItemType values are included
type AssertAllItemTypes = (typeof ITEM_TYPES_ARRAY)[number] extends ItemType
  ? ItemType extends (typeof ITEM_TYPES_ARRAY)[number]
    ? true
    : "Missing item type in ITEM_TYPES_ARRAY"
  : "Invalid item type in ITEM_TYPES_ARRAY";
const _checkItemTypes: AssertAllItemTypes = true;
void _checkItemTypes; // Suppress unused variable warning

export const ALL_ITEM_TYPES: ReadonlySet<ItemType> = new Set(ITEM_TYPES_ARRAY);

export function isItemType(value: unknown): value is ItemType {
  return typeof value === "string" && ALL_ITEM_TYPES.has(value as ItemType);
}

export type Rotation = 0 | 90 | 180 | 270;

export interface BaseEntity {
  id: EntityId;
  position: { x: number; y: number }; // top-left tile coordinates
  size: { x: number; y: number }; // size in tiles
  rotation: Rotation; // rotation in degrees (clockwise)
}

export type Inventory = Partial<Record<ItemType, number>>;

export type StoneFurnaceState =
  | { type: "idle" }
  | { type: "smelting"; itemType: ItemType; progress: number };

export interface StoneFurnaceEntity extends BaseEntity {
  type: "stone-furnace";
  inputInventory: Inventory;
  outputInventory: Inventory;
  state: StoneFurnaceState;
}

export interface HomeStorageEntity extends BaseEntity {
  type: "home-storage";
}

export type BurnerInserterState =
  | { type: "idle" }
  | { type: "deliver"; itemType: ItemType; progress: number }
  | { type: "return"; progress: number };

export interface BurnerInserterEntity extends BaseEntity {
  type: "burner-inserter";
  state: BurnerInserterState;
}

export type BurnerMiningDrillState =
  | { type: "idle" }
  | { type: "mining"; itemType: ResourceType; progress: number };

export interface BurnerMiningDrillEntity extends BaseEntity {
  type: "burner-mining-drill";
  inputInventory: Inventory;
  outputInventory: Inventory;
  state: BurnerMiningDrillState;
}

export type BeltTurn = "left" | "right" | "none";

export interface BeltItem {
  id: BeltItemId;
  itemType: ItemType;
  position: number; // 0-63 (inclusive)
}

export interface BeltEntity extends BaseEntity {
  type: "belt";
  turn: BeltTurn;
  leftLane: BeltItem[];
  rightLane: BeltItem[];
}

export interface TestBeltInputEntity extends BaseEntity {
  type: "test-belt-input";
  nextOutputTick: number;
}

export interface TestBeltOutputEntity extends BaseEntity {
  type: "test-belt-output";
  inventory: Inventory;
}

export type Entity =
  | StoneFurnaceEntity
  | HomeStorageEntity
  | BurnerInserterEntity
  | BurnerMiningDrillEntity
  | BeltEntity
  | TestBeltInputEntity
  | TestBeltOutputEntity;

export function takeFirstAvailableRequested(
  state: AppState,
  entity: Entity,
  requestedItems: ReadonlySet<ItemType>,
): ItemType | null {
  let inventory: Inventory;
  switch (entity.type) {
    case "stone-furnace":
      inventory = entity.outputInventory;
      break;
    case "burner-mining-drill":
      inventory = entity.outputInventory;
      break;
    case "home-storage":
      inventory = state.inventory;
      break;
    default:
      return null;
  }
  for (const item of requestedItems) {
    if (inventoryHas(inventory, item)) {
      decrementInventory(inventory, item);
      return item;
    }
  }
  return null;
}

export function tryPutItem(
  state: AppState,
  entity: Entity,
  itemType: ItemType,
): { success: boolean } {
  if (entity.type === "belt") {
    const lane = entity.leftLane;

    const firstItem = lane.at(0);
    if (firstItem && firstItem.position < BELT_ITEM_SPACING) {
      return { success: false };
    }

    // Add item to belt at position 32
    lane.unshift({
      id: getBeltItemId(state.nextBeltItemId++),
      itemType,
      position: 0,
    });

    return { success: true };
  }

  let inventory: Inventory;
  switch (entity.type) {
    case "stone-furnace":
      inventory = entity.inputInventory;
      break;
    case "burner-mining-drill":
      inventory = entity.inputInventory;
      break;
    case "test-belt-output":
      inventory = entity.inventory;
      break;
    case "home-storage":
      inventory = state.inventory;
      break;
    default:
      return { success: false };
  }

  incrementInventory(inventory, itemType);
  return { success: true };
}

export interface Build {
  entity: Entity;
  valid: boolean;
}

// Entity configuration constants
export interface EntityConfig {
  size: { x: number; y: number };
  color: string; // HSL format: "hsl(h, s%, l%)"
  rotatable: boolean;
  icon: IconDefinition;
}

export const ENTITY_CONFIGS: Record<EntityType, EntityConfig> = {
  "stone-furnace": {
    size: { x: 2, y: 2 },
    color: "hsl(0, 100%, 63%)", // red
    rotatable: false,
    icon: faFireBurner,
  },
  "home-storage": {
    size: { x: 2, y: 2 },
    color: "hsl(240, 100%, 63%)", // blue
    rotatable: false,
    icon: faHouse,
  },
  "burner-inserter": {
    size: { x: 1, y: 1 },
    color: "hsl(27, 100%, 70%)", // light orange
    rotatable: true,
    icon: faRightFromLine,
  },
  "burner-mining-drill": {
    size: { x: 2, y: 2 },
    color: "hsl(40, 100%, 50%)", // yellow-orange
    rotatable: true,
    icon: faBoreHole,
  },
  belt: {
    size: { x: 1, y: 1 },
    color: "hsl(60, 100%, 50%)", // yellow
    rotatable: true,
    icon: faConveyorBelt,
  },
  "test-belt-input": {
    size: { x: 1, y: 1 },
    color: "hsl(120, 100%, 63%)", // green
    rotatable: true,
    icon: faRightFromBracket,
  },
  "test-belt-output": {
    size: { x: 1, y: 1 },
    color: "hsl(300, 100%, 63%)", // magenta
    rotatable: true,
    icon: faRightToBracket,
  },
};

export function getEntityConfig(type: EntityType): EntityConfig {
  return ENTITY_CONFIGS[type];
}

export interface Tile {
  color: number; // hex color
  resource?: Resource;
  entityId?: EntityId;
}

export interface Chunk {
  tiles: Tile[]; // array of tiles (32 * 32 = 1024 tiles)
}

// Resource color constants (vibrant game colors)
export const RESOURCE_COLORS: Record<ResourceType, number> = {
  coal: 0x000000, // black
  copper: 0xff6600, // bright orange
  iron: 0x4682b4, // steel blue
  stone: 0xff69b4, // hot pink
};

export interface MineAction {
  type: "mine";
  tileId: TileId;
  progress: number; // 0 to 1
}

export type Action = MineAction;

export interface AppState {
  camera: {
    x: number;
    y: number;
  };
  chunks: Map<ChunkId, Chunk>;
  entities: Map<EntityId, Entity>;
  nextEntityId: number;
  nextBeltItemId: number;
  action: Action | null;
  tick: number;
  inventory: Inventory;
}

export function getChunkId(tileX: number, tileY: number): ChunkId {
  return `${tileX},${tileY}`;
}

export function parseChunkId(id: ChunkId): { x: number; y: number } {
  const [x, y] = id.split(",").map(Number);
  return { x, y };
}

export function getTileId(tileX: number, tileY: number): TileId {
  return `${tileX},${tileY}`;
}

export function parseTileId(id: TileId): { x: number; y: number } {
  const [x, y] = id.split(",").map(Number);
  return { x, y };
}

export function worldToTile(worldCoord: number): number {
  return Math.floor(worldCoord / TILE_SIZE);
}

export function tileToChunk(tileCoord: number): number {
  return Math.floor(tileCoord / CHUNK_SIZE) * CHUNK_SIZE;
}

export function getEntityId(entityNumber: number): EntityId {
  return `entity-${entityNumber}`;
}

export function getBeltItemId(itemNumber: number): BeltItemId {
  return `item-${itemNumber}`;
}

export function createEntity(
  id: EntityId,
  type: EntityType,
  x: number,
  y: number,
  rotation: 0 | 90 | 180 | 270 = 0,
  turn: BeltTurn = "none",
): Entity {
  const size = ENTITY_CONFIGS[type].size;
  const position = { x, y };

  if (type === "stone-furnace") {
    return {
      id,
      type,
      position,
      size,
      rotation,
      inputInventory: {},
      outputInventory: {},
      state: { type: "idle" },
    };
  } else if (type === "burner-inserter") {
    return {
      id,
      type,
      position,
      size,
      rotation,
      state: { type: "idle" },
    };
  } else if (type === "burner-mining-drill") {
    return {
      id,
      type,
      position,
      size,
      rotation,
      inputInventory: {},
      outputInventory: {},
      state: { type: "idle" },
    };
  } else if (type === "belt") {
    return {
      id,
      type,
      position,
      size,
      rotation,
      turn,
      leftLane: [],
      rightLane: [],
    };
  } else if (type === "test-belt-input") {
    return {
      id,
      type,
      position,
      size,
      rotation,
      nextOutputTick: 0,
    };
  } else if (type === "test-belt-output") {
    return {
      id,
      type,
      position,
      size,
      rotation,
      inventory: {},
    };
  } else {
    // home-storage
    return {
      id,
      type,
      position,
      size,
      rotation,
    };
  }
}

/**
 * Converts degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
