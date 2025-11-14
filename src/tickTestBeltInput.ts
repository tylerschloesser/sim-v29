import type { AppState, BeltEntity, TestBeltInputEntity } from "./types";
import { getBeltItemId } from "./types";
import { getEntityAtTile } from "./entityUtils";
import { BELT_ITEM_SPACING } from "./constants";
import type { Draft } from "immer";

/**
 * Gets the output tile for a test-belt-input based on its rotation.
 * - rotation 0: output to right (x + 1, y)
 * - rotation 90: output to down (x, y + 1)
 * - rotation 180: output to left (x - 1, y)
 * - rotation 270: output to up (x, y - 1)
 */
function getOutputTile(entity: TestBeltInputEntity): { x: number; y: number } {
  const { position, rotation } = entity;

  switch (rotation) {
    case 0: // Output to right
      return { x: position.x + 1, y: position.y };
    case 90: // Output to down
      return { x: position.x, y: position.y + 1 };
    case 180: // Output to left
      return { x: position.x - 1, y: position.y };
    case 270: // Output to up
      return { x: position.x, y: position.y - 1 };
  }
}

/**
 * Ticks all test-belt-input entities.
 * Each test-belt-input attempts to output an iron item every 60 ticks.
 */
export function tickAllTestBeltInputs(
  draft: Draft<AppState>,
  tick: number,
): void {
  // Process all test-belt-input entities
  for (const entity of draft.entities.values()) {
    if (entity.type !== "test-belt-input") continue;

    const testBeltInput = entity as TestBeltInputEntity;

    // Check if it's time to output an item
    if (tick < testBeltInput.nextOutputTick) continue;

    // Always schedule next output attempt (even if this one fails)
    testBeltInput.nextOutputTick = tick + 60;

    // Find the output entity
    const outputTile = getOutputTile(testBeltInput);
    const outputEntity = getEntityAtTile(draft, outputTile.x, outputTile.y);

    // Check if output is a belt with same rotation
    if (!outputEntity || outputEntity.type !== "belt") continue;

    const outputBelt = outputEntity as BeltEntity;
    if (outputBelt.rotation !== testBeltInput.rotation) continue;

    // Check if belt's leftLane has space at position 0
    const lane = outputBelt.leftLane;
    const blockingItem = lane.find((item) => item.position < BELT_ITEM_SPACING);

    if (blockingItem) {
      // Belt is blocked, skip this output attempt
      continue;
    }

    // Add iron item to belt at position 0
    lane.unshift({
      id: getBeltItemId(draft.nextBeltItemId++),
      itemType: "iron",
      position: 0,
    });
  }
}
