import type { AppState, BeltEntity, BeltItem, BeltItemId } from "./types";
import { computeBeltNetworks, canItemMove, getOutputBelt } from "./beltUtils";
import { BELT_SPEED, BELT_LENGTH } from "./constants";
import { getBeltItemId } from "./types";
import invariant from "tiny-invariant";

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

  const outputBelt = getOutputBelt(currentBelt, draft);

  // Process left lane (we only use left lane for now)
  const lane = currentBelt.leftLane;

  // Invariant: belt items are sorted by position (ascending)
  invariant(
    lane.every((item, i) => i === 0 || item.position >= lane[i - 1].position),
    "Belt items must be sorted by position",
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
        canItemMove(currentBelt, lane, item.position, BELT_SPEED, outputBelt)
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

    // Check if item should transfer to next belt
    if (newPosition >= BELT_LENGTH) {
      if (outputBelt) {
        // Transfer item to output belt
        const transferredBelt = draft.entities.get(outputBelt.id) as BeltEntity;
        if (transferredBelt) {
          transferredBelt.leftLane.push({
            id: getBeltItemId(draft.nextBeltItemId++),
            itemType: item.itemType,
            position: 0, // Start at position 0 on the new belt
          });
        }
      }
      // Remove item from current belt (either transferred or reached end with no output)
      lane.splice(index, 1);
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
