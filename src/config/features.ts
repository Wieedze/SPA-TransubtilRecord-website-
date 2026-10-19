// Feature flags — set to "true" in .env to re-enable a section.
// Both are off by default for the v2 showcase site.
export const FEATURE_STUDIO = import.meta.env.VITE_FEATURE_STUDIO === "true"
export const FEATURE_AUTH = import.meta.env.VITE_FEATURE_AUTH === "true"
