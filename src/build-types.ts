import z from "zod";
import { entityTypeSchema } from "./types";

export const emptySearchSchema = z.strictObject({
  selectedEntityType: z.undefined(),
});

const rotationSchema = z.union([
  z.literal(0),
  z.literal(90),
  z.literal(180),
  z.literal(270),
]);

export const basicSearchSchema = z.strictObject({
  selectedEntityType: z.union([
    z.literal(entityTypeSchema.enum["burner-inserter"]),
    z.literal(entityTypeSchema.enum["burner-mining-drill"]),
    z.literal(entityTypeSchema.enum["stone-furnace"]),
    z.literal(entityTypeSchema.enum["home-storage"]),
    z.literal(entityTypeSchema.enum["test-belt-input"]),
    z.literal(entityTypeSchema.enum["test-belt-output"]),
  ]),
  rotation: rotationSchema,
});

export const beltSearchSchema = z.strictObject({
  selectedEntityType: z.literal(entityTypeSchema.enum.belt),
  rotation: rotationSchema,
  turn: z.enum(["none", "left", "right"]),
  sourceId: z.string().nullable(),
});
export const searchSchema = z.union([
  emptySearchSchema,
  basicSearchSchema,
  beltSearchSchema,
]);

export type BuildRouteSearch = z.infer<typeof searchSchema>;

export function isBelt(
  search: BuildRouteSearch,
): search is z.infer<typeof beltSearchSchema> {
  return search.selectedEntityType === entityTypeSchema.enum.belt;
}
