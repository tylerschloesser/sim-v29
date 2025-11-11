import { describe, it, expect } from "vitest";
import {
  getInputTile,
  getOutputTile,
  getAdjacentBelts,
  getInputBelt,
  getOutputBelt,
  canItemMove,
  computeBeltNetworks,
} from "./beltUtils";
import {
  createMockAppState,
  createMockBelt,
  addBeltToState,
} from "./testUtils";
import type { BeltItem } from "./types";

describe("beltUtils", () => {
  describe("getInputTile", () => {
    it("returns left tile for rotation 0 (facing right)", () => {
      const belt = createMockBelt("entity-1", 5, 5, 0);
      const inputTile = getInputTile(belt);
      expect(inputTile).toEqual({ x: 4, y: 5 });
    });

    it("returns top tile for rotation 90 (facing down)", () => {
      const belt = createMockBelt("entity-1", 5, 5, 90);
      const inputTile = getInputTile(belt);
      expect(inputTile).toEqual({ x: 5, y: 4 });
    });

    it("returns right tile for rotation 180 (facing left)", () => {
      const belt = createMockBelt("entity-1", 5, 5, 180);
      const inputTile = getInputTile(belt);
      expect(inputTile).toEqual({ x: 6, y: 5 });
    });

    it("returns bottom tile for rotation 270 (facing up)", () => {
      const belt = createMockBelt("entity-1", 5, 5, 270);
      const inputTile = getInputTile(belt);
      expect(inputTile).toEqual({ x: 5, y: 6 });
    });
  });

  describe("getOutputTile", () => {
    describe("turn: none", () => {
      it("returns right tile for rotation 0", () => {
        const belt = createMockBelt("entity-1", 5, 5, 0, "none");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 6, y: 5 });
      });

      it("returns bottom tile for rotation 90", () => {
        const belt = createMockBelt("entity-1", 5, 5, 90, "none");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 5, y: 6 });
      });

      it("returns left tile for rotation 180", () => {
        const belt = createMockBelt("entity-1", 5, 5, 180, "none");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 4, y: 5 });
      });

      it("returns top tile for rotation 270", () => {
        const belt = createMockBelt("entity-1", 5, 5, 270, "none");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 5, y: 4 });
      });
    });

    describe("turn: left", () => {
      it("returns top tile for rotation 0 (turns to 270)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 0, "left");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 5, y: 4 });
      });

      it("returns right tile for rotation 90 (turns to 0)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 90, "left");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 6, y: 5 });
      });

      it("returns bottom tile for rotation 180 (turns to 90)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 180, "left");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 5, y: 6 });
      });

      it("returns left tile for rotation 270 (turns to 180)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 270, "left");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 4, y: 5 });
      });
    });

    describe("turn: right", () => {
      it("returns bottom tile for rotation 0 (turns to 90)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 0, "right");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 5, y: 6 });
      });

      it("returns left tile for rotation 90 (turns to 180)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 90, "right");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 4, y: 5 });
      });

      it("returns top tile for rotation 180 (turns to 270)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 180, "right");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 5, y: 4 });
      });

      it("returns right tile for rotation 270 (turns to 0)", () => {
        const belt = createMockBelt("entity-1", 5, 5, 270, "right");
        const outputTile = getOutputTile(belt);
        expect(outputTile).toEqual({ x: 6, y: 5 });
      });
    });
  });

  describe("getAdjacentBelts", () => {
    it("returns all 4 adjacent tiles with null belts when no neighbors", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const adjacent = getAdjacentBelts(belt, state);

      expect(adjacent.top).toEqual({ tile: { x: 5, y: 4 }, belt: null });
      expect(adjacent.right).toEqual({ tile: { x: 6, y: 5 }, belt: null });
      expect(adjacent.bottom).toEqual({ tile: { x: 5, y: 6 }, belt: null });
      expect(adjacent.left).toEqual({ tile: { x: 4, y: 5 }, belt: null });
    });

    it("returns adjacent belts when neighbors exist", () => {
      const state = createMockAppState();
      const centerBelt = createMockBelt("entity-1", 5, 5, 0);
      const topBelt = createMockBelt("entity-2", 5, 4, 90);
      const rightBelt = createMockBelt("entity-3", 6, 5, 0);
      const bottomBelt = createMockBelt("entity-4", 5, 6, 90);
      const leftBelt = createMockBelt("entity-5", 4, 5, 0);

      addBeltToState(state, centerBelt);
      addBeltToState(state, topBelt);
      addBeltToState(state, rightBelt);
      addBeltToState(state, bottomBelt);
      addBeltToState(state, leftBelt);

      const adjacent = getAdjacentBelts(centerBelt, state);

      expect(adjacent.top.belt).toEqual(topBelt);
      expect(adjacent.right.belt).toEqual(rightBelt);
      expect(adjacent.bottom.belt).toEqual(bottomBelt);
      expect(adjacent.left.belt).toEqual(leftBelt);
    });
  });

  describe("getInputBelt", () => {
    it("returns null when no input belt exists", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const inputBelt = getInputBelt(belt, state);
      expect(inputBelt).toBeNull();
    });

    it("returns input belt when it exists", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 4, 5, 0); // Input belt
      const belt2 = createMockBelt("entity-2", 5, 5, 0); // Current belt

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      const inputBelt = getInputBelt(belt2, state);
      expect(inputBelt).toEqual(belt1);
    });
  });

  describe("getOutputBelt", () => {
    it("returns null when no output belt exists", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const outputBelt = getOutputBelt(belt, state);
      expect(outputBelt).toBeNull();
    });

    it("returns output belt when it exists (straight)", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 5, 5, 0); // Current belt
      const belt2 = createMockBelt("entity-2", 6, 5, 0); // Output belt

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      const outputBelt = getOutputBelt(belt1, state);
      expect(outputBelt).toEqual(belt2);
    });

    it("returns correct output belt for left turn", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 5, 5, 0, "left"); // Turns left (to 270/up)
      const belt2 = createMockBelt("entity-2", 5, 4, 0); // Output belt above

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      const outputBelt = getOutputBelt(belt1, state);
      expect(outputBelt).toEqual(belt2);
    });

    it("returns correct output belt for right turn", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 5, 5, 0, "right"); // Turns right (to 90/down)
      const belt2 = createMockBelt("entity-2", 5, 6, 0); // Output belt below

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      const outputBelt = getOutputBelt(belt1, state);
      expect(outputBelt).toEqual(belt2);
    });
  });

  describe("canItemMove", () => {
    const createItem = (position: number): BeltItem => ({
      itemType: "iron",
      position,
    });

    it("allows item to move when no obstacles", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const lane: BeltItem[] = [createItem(10)];
      const canMove = canItemMove(belt, lane, 10, 1, null);

      expect(canMove).toBe(true);
    });

    it("blocks item when another item is too close ahead", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const lane: BeltItem[] = [createItem(10), createItem(20)];
      const canMove = canItemMove(belt, lane, 10, 1, null);

      expect(canMove).toBe(false); // 20 - 10 = 10, less than required spacing of 17
    });

    it("allows item to move when ahead item is far enough", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const lane: BeltItem[] = [createItem(10), createItem(30)];
      const canMove = canItemMove(belt, lane, 10, 1, null);

      expect(canMove).toBe(true); // 30 - 10 = 20, more than required spacing of 17
    });

    it("blocks item at end of belt when no output belt", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const lane: BeltItem[] = [createItem(63)];
      const canMove = canItemMove(belt, lane, 63, 1, null);

      expect(canMove).toBe(false); // Would move to 64, but no output belt
    });

    it("allows item to transfer to output belt when output is empty", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 5, 5, 0);
      const belt2 = createMockBelt("entity-2", 6, 5, 0);
      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      const lane: BeltItem[] = [createItem(63)];
      const outputBelt = getOutputBelt(belt1, state);
      const canMove = canItemMove(belt1, lane, 63, 1, outputBelt);

      expect(canMove).toBe(true); // Can transfer to empty output belt
    });

    it("blocks item from transferring when output belt has item too close", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 5, 5, 0);
      const belt2 = createMockBelt("entity-2", 6, 5, 0);
      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      // Put item at position 10 in output belt
      belt2.leftLane = [createItem(10)];

      const lane: BeltItem[] = [createItem(63)];
      const outputBelt = getOutputBelt(belt1, state);
      const canMove = canItemMove(belt1, lane, 63, 1, outputBelt);

      expect(canMove).toBe(false); // Position 10 is too close (< 17 spacing required)
    });

    it("blocks item from transferring when output belt has item at start", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 5, 5, 0);
      const belt2 = createMockBelt("entity-2", 6, 5, 0);
      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      // Put item at position 0 in output belt
      belt2.leftLane = [createItem(0)];

      const lane: BeltItem[] = [createItem(63)];
      const outputBelt = getOutputBelt(belt1, state);
      const canMove = canItemMove(belt1, lane, 63, 1, outputBelt);

      expect(canMove).toBe(false); // Item at position 0 blocks transfer
    });
  });

  describe("computeBeltNetworks", () => {
    it("returns empty networks when no belts exist", () => {
      const state = createMockAppState();
      const networks = computeBeltNetworks(state);

      expect(networks.terminalNetworks).toHaveLength(0);
      expect(networks.cycleNetworks).toHaveLength(0);
    });

    it("creates terminal network for single belt", () => {
      const state = createMockAppState();
      const belt = createMockBelt("entity-1", 5, 5, 0);
      addBeltToState(state, belt);

      const networks = computeBeltNetworks(state);

      expect(networks.terminalNetworks).toHaveLength(1);
      expect(networks.cycleNetworks).toHaveLength(0);
      expect(networks.terminalNetworks[0].belts).toHaveLength(1);
      expect(networks.terminalNetworks[0].hasCycle).toBe(false);
    });

    it("creates terminal network for straight belt chain", () => {
      const state = createMockAppState();
      // Manually create connected belts to ensure they connect properly
      const belt1 = createMockBelt("entity-1", 0, 0, 0); // Facing right
      const belt2 = createMockBelt("entity-2", 1, 0, 0); // Facing right
      const belt3 = createMockBelt("entity-3", 2, 0, 0); // Facing right

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);
      addBeltToState(state, belt3);

      const networks = computeBeltNetworks(state);

      expect(networks.terminalNetworks).toHaveLength(1);
      expect(networks.cycleNetworks).toHaveLength(0);
      expect(networks.terminalNetworks[0].belts).toHaveLength(3);
      expect(networks.terminalNetworks[0].hasCycle).toBe(false);
    });

    it("orders belts correctly in terminal network (output first)", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 0, 0, 0); // First in chain
      const belt2 = createMockBelt("entity-2", 1, 0, 0); // Middle
      const belt3 = createMockBelt("entity-3", 2, 0, 0); // Last (terminal)

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);
      addBeltToState(state, belt3);

      const networks = computeBeltNetworks(state);
      const network = networks.terminalNetworks[0];

      // Terminal belt should be first in the ordered list
      expect(network.belts[0].id).toBe("entity-3");
      expect(network.belts[1].id).toBe("entity-2");
      expect(network.belts[2].id).toBe("entity-1");
    });

    it("detects cycle network", () => {
      const state = createMockAppState();
      // Create a square cycle: right -> down -> left -> up -> back to start
      const belt1 = createMockBelt("entity-1", 0, 0, 0); // Facing right
      const belt2 = createMockBelt("entity-2", 1, 0, 90); // Facing down
      const belt3 = createMockBelt("entity-3", 1, 1, 180); // Facing left
      const belt4 = createMockBelt("entity-4", 0, 1, 270); // Facing up

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);
      addBeltToState(state, belt3);
      addBeltToState(state, belt4);

      const networks = computeBeltNetworks(state);

      expect(networks.terminalNetworks).toHaveLength(0);
      expect(networks.cycleNetworks).toHaveLength(1);
      expect(networks.cycleNetworks[0].belts).toHaveLength(4);
      expect(networks.cycleNetworks[0].hasCycle).toBe(true);
    });

    it("handles multiple separate networks", () => {
      const state = createMockAppState();

      // Network 1: Simple chain
      const belt1 = createMockBelt("entity-1", 0, 0, 0);
      const belt2 = createMockBelt("entity-2", 1, 0, 0);
      addBeltToState(state, belt1);
      addBeltToState(state, belt2);

      // Network 2: Separate chain
      const belt3 = createMockBelt("entity-3", 10, 10, 90);
      const belt4 = createMockBelt("entity-4", 10, 11, 90);
      addBeltToState(state, belt3);
      addBeltToState(state, belt4);

      const networks = computeBeltNetworks(state);

      expect(networks.terminalNetworks).toHaveLength(2);
      expect(networks.cycleNetworks).toHaveLength(0);
    });

    it("handles network with turn", () => {
      const state = createMockAppState();
      const belt1 = createMockBelt("entity-1", 0, 0, 0, "none"); // Straight right
      const belt2 = createMockBelt("entity-2", 1, 0, 0, "right"); // Turn right (down)
      const belt3 = createMockBelt("entity-3", 1, 1, 90, "none"); // Straight down

      addBeltToState(state, belt1);
      addBeltToState(state, belt2);
      addBeltToState(state, belt3);

      const networks = computeBeltNetworks(state);

      expect(networks.terminalNetworks).toHaveLength(1);
      expect(networks.terminalNetworks[0].belts).toHaveLength(3);
      expect(networks.terminalNetworks[0].hasCycle).toBe(false);
    });
  });
});
