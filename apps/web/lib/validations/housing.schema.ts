import { z } from "zod";

// ============================================================
// Mirrors HousingFeatures from OpenAPI spec exactly
// All constraints match spec: min/max, exclusiveMinimum, etc.
// ============================================================

export const housingFeaturesSchema = z.object({
  square_footage: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .gt(0, "Must be greater than 0")
    .max(50000, "Cannot exceed 50,000 sq ft"),

  bedrooms: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Cannot be negative")
    .max(20, "Cannot exceed 20"),

  bathrooms: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(20, "Cannot exceed 20")
    .refine((v) => v * 2 === Math.floor(v * 2), "Must be 0.5 increments"),

  year_built: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(1800, "Year must be ≥ 1800")
    .max(2100, "Year must be ≤ 2100"),

  lot_size: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .gt(0, "Must be greater than 0")
    .max(5_000_000, "Cannot exceed 5,000,000 sq ft"),

  distance_to_city_center: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(500, "Cannot exceed 500 miles"),

  school_rating: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Cannot be negative")
    .max(10, "Cannot exceed 10"),
});

export type HousingFeaturesForm = z.infer<typeof housingFeaturesSchema>;

// Default values for the form (matches OpenAPI example)
export const housingFeaturesDefaults: HousingFeaturesForm = {
  square_footage: 1850,
  bedrooms: 3,
  bathrooms: 2.0,
  year_built: 2005,
  lot_size: 6500,
  distance_to_city_center: 4.5,
  school_rating: 8.2,
};

// Human-readable field labels + hints
export const fieldMeta: Record<
  keyof HousingFeaturesForm,
  { label: string; hint: string; unit: string; step?: number }
> = {
  square_footage: {
    label: "Square Footage",
    hint: "Total liveable area",
    unit: "sq ft",
    step: 50,
  },
  bedrooms: {
    label: "Bedrooms",
    hint: "Number of bedrooms",
    unit: "rooms",
    step: 1,
  },
  bathrooms: {
    label: "Bathrooms",
    hint: "0.5 increments allowed",
    unit: "baths",
    step: 0.5,
  },
  year_built: {
    label: "Year Built",
    hint: "Year constructed",
    unit: "year",
    step: 1,
  },
  lot_size: {
    label: "Lot Size",
    hint: "Total lot area",
    unit: "sq ft",
    step: 100,
  },
  distance_to_city_center: {
    label: "Distance to City",
    hint: "Distance to city centre",
    unit: "miles",
    step: 0.1,
  },
  school_rating: {
    label: "School Rating",
    hint: "Nearest school quality (0–10)",
    unit: "/10",
    step: 0.1,
  },
};