import invariant from "tiny-invariant";
import {
  canItemMove,
  computeBeltNetworks,
  getBeltOutputEntity,
  getOutputTile,
} from "./beltUtils";
import { BELT_LENGTH, BELT_SPEED } from "./constants";
import { getEntityAtTile } from "./entityUtils";
import { incrementInventory } from "./inventoryUtils";
import type {
  AppState,
  BeltEntity,
  BeltItem,
  BeltItemId,
  TestBeltOutputEntity,
} from "./types";
import { getBeltItemId } from "./types";

/**
 * Process one tick for all belts in the world.
 * This should be called once per tick, not per belt.
 *
 * Handles belt networks:
 * - Terminal networks: tick belts in order (output to input)
 * - Cycle networks: tick all belts simultaneously
 */
export function tickAllBelts(draft: AppState) {
  const networks = computeBeltNetworks(draft);
  const processedItems = new Set<BeltItemId>();

  // Process terminal networks (belts in correct order)
  for (const network of networks.terminalNetworks) {
    for (const belt of network.belts) {
      tickSingleBelt(draft, belt, false, processedItems);
    }
  }

  // Process cycle networks (all items can move)
  for (const network of networks.cycleNetworks) {
    for (const belt of network.belts) {
      tickSingleBelt(draft, belt, true, processedItems);
    }
  }
}

/**
 * Process one tick for a single belt entity.
 * This is called internally by tickAllBelts.
 *
 * @param draft The draft state
 * @param belt The belt to tick
 * @param isInCycle Whether this belt is part of a cycle (items always move)
 * @param processedItems Set of item IDs that have already been processed this tick
 */
function tickSingleBelt(
  draft: AppState,
  belt: BeltEntity,
  isInCycle: boolean,
  processedItems: Set<BeltItemId>,
) {
  // Get the actual belt entity from draft (to ensure we have the latest state)
  const currentBelt = draft.entities.get(belt.id) as BeltEntity;
  if (!currentBelt || currentBelt.type !== "belt") {
    return;
  }

  const outputBelt = getBeltOutputEntity(currentBelt, draft);

  // Process both lanes
  processLane(
    draft,
    currentBelt,
    "left",
    isInCycle,
    processedItems,
    outputBelt,
  );
  processLane(
    draft,
    currentBelt,
    "right",
    isInCycle,
    processedItems,
    outputBelt,
  );
}

/**
 * Process one tick for a single lane of a belt.
 *
 * @param draft The draft state
 * @param currentBelt The belt to tick
 * @param laneType Which lane to process ("left" or "right")
 * @param isInCycle Whether this belt is part of a cycle (items always move)
 * @param processedItems Set of item IDs that have already been processed this tick
 * @param outputBelt The output belt entity (if any)
 */
function processLane(
  draft: AppState,
  currentBelt: BeltEntity,
  laneType: "left" | "right",
  isInCycle: boolean,
  processedItems: Set<BeltItemId>,
  outputBelt: BeltEntity | TestBeltOutputEntity | null,
) {
  const lane =
    laneType === "left" ? currentBelt.leftLane : currentBelt.rightLane;

  // Invariant: belt items are sorted by position (ascending)
  invariant(
    lane.every((item, i) => i === 0 || item.position >= lane[i - 1].position),
    `Belt items must be sorted by position (${laneType} lane)`,
  );

  const itemsToMove: Array<{ item: BeltItem; index: number }> = [];

  // Check which items can move (iterate backwards so furthest items move first)
  for (let i = lane.length - 1; i >= 0; i--) {
    const item = lane[i];

    // Skip items that have already been processed this tick (prevents double-processing in loops)
    if (processedItems.has(item.id)) {
      continue;
    }

    if (isInCycle) {
      // In a cycle, all items can move
      itemsToMove.push({ item, index: i });
      processedItems.add(item.id);
    } else {
      // Check if item can move forward
      if (
        canItemMove(
          currentBelt,
          lane,
          item.position,
          BELT_SPEED,
          outputBelt,
          laneType,
        )
      ) {
        itemsToMove.push({ item, index: i });
        processedItems.add(item.id);
      }
    }
  }

  // Move items (process in reverse order to avoid index issues when removing)
  for (let i = itemsToMove.length - 1; i >= 0; i--) {
    const { item, index } = itemsToMove[i];
    const newPosition = item.position + BELT_SPEED;

    // Check if item should transfer to next entity
    if (newPosition >= BELT_LENGTH) {
      // Calculate effective output rotation (respects turn)
      const { rotation, turn } = currentBelt;
      let effectiveOutputRotation = rotation;
      if (turn === "left") {
        effectiveOutputRotation = ((rotation - 90 + 360) % 360) as
          | 0
          | 90
          | 180
          | 270;
      } else if (turn === "right") {
        effectiveOutputRotation = ((rotation + 90) % 360) as 0 | 90 | 180 | 270;
      }

      // Check for test-belt-output at output tile
      const outputTile = getOutputTile(currentBelt);
      const outputEntity = getEntityAtTile(draft, outputTile.x, outputTile.y);

      if (
        outputEntity &&
        outputEntity.type === "test-belt-output" &&
        outputEntity.rotation === effectiveOutputRotation
      ) {
        // Transfer item to test-belt-output inventory
        incrementInventory(outputEntity.inventory, item.itemType);
        lane.splice(index, 1);
      } else if (outputBelt) {
        // Transfer item to output belt (same lane)
        const transferredBelt = draft.entities.get(outputBelt.id) as BeltEntity;
        if (transferredBelt) {
          const outputLane =
            laneType === "left"
              ? transferredBelt.leftLane
              : transferredBelt.rightLane;
          outputLane.unshift({
            id: getBeltItemId(draft.nextBeltItemId++),
            itemType: item.itemType,
            position: 0, // Start at position 0 on the new belt
          });
        }
        // Remove item from current belt
        lane.splice(index, 1);
      } else {
        // No output entity, item is lost
        lane.splice(index, 1);
      }
    } else {
      // Update item position
      lane[index].position = newPosition;
    }
  }
}

/**
 * Process one tick for a belt entity.
 * NOTE: This function is kept for compatibility but does nothing.
 * Use tickAllBelts() instead, which should be called once per tick.
 */
export function tickBelt(_draft: AppState, _entity: BeltEntity) {
  // No-op - belt ticking is now handled by tickAllBelts()
  // This is kept for compatibility with the existing tick loop
  void _draft;
  void _entity;
}
