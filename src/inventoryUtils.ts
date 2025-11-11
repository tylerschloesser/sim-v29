import invariant from "tiny-invariant";
import type { Inventory, ItemType } from "./types";

export function decrementInventory(
  inventory: Inventory,
  itemType: ItemType,
  count: number = 1,
): void {
  invariant(
    (inventory[itemType] ?? 0) >= count,
    `Insufficient ${itemType} in inventory.`,
  );
  inventory[itemType]! -= count;
  if (inventory[itemType] === 0) {
    delete inventory[itemType];
  }
}

export function incrementInventory(
  inventory: Inventory,
  itemType: ItemType,
  count: number = 1,
): void {
  inventory[itemType] = (inventory[itemType] ?? 0) + count;
}

export function inventoryHas(
  inventory: Inventory,
  itemType: ItemType,
  count: number = 1,
): boolean {
  return (inventory[itemType] ?? 0) >= count;
}
