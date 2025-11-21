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

export const beltSearchBaseSchema = z.strictObject({
  selectedEntityType: z.literal(entityTypeSchema.enum.belt),
});

export const beltSimpleSearchSchema = beltSearchBaseSchema.extend({
  mode: z.literal("simple"),
  rotation: rotationSchema,
  turn: z.enum(["none", "left", "right"]),
});
export type BeltSimpleSearch = z.infer<typeof beltSimpleSearchSchema>;

export const beltAdvancedSearchSchema = beltSearchBaseSchema.extend({
  mode: z.literal("advanced"),
  start: z.string(),
});
export type BeltAdvancedSearch = z.infer<typeof beltAdvancedSearchSchema>;

export const beltSearchSchema = z.discriminatedUnion("mode", [
  beltSimpleSearchSchema,
  beltAdvancedSearchSchema,
]);

export const searchSchema = z.union([
  emptySearchSchema,
  basicSearchSchema,
  beltSearchSchema,
]);

export type BuildRouteSearch = z.infer<typeof searchSchema>;

export function isAdvancedBeltMode(
  search: BuildRouteSearch,
): search is BeltAdvancedSearch {
  return (
    search.selectedEntityType === entityTypeSchema.enum.belt &&
    search.mode === "advanced"
  );
}

export function isSimpleBeltMode(
  search: BuildRouteSearch,
): search is BeltSimpleSearch {
  return (
    search.selectedEntityType === entityTypeSchema.enum.belt &&
    search.mode === "simple"
  );
}
