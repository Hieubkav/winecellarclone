// Brand color constants - centralized for consistency
export const BRAND_COLORS = {
  wine: "#9B2C3B",      // Đỏ burgundy - primary wine color
  spirit: "#ECAA4D",    // Vàng gold - spirit/highlight color
  dark: "#1C1C1C",      // Text dark
  white: "#FFFFFF",     // White
} as const;

// Legacy aliases for backward compatibility
export const WINE_COLOR = BRAND_COLORS.wine;
export const SPIRIT_COLOR = BRAND_COLORS.spirit;

// Timing constants
export const ANIMATION_TIMINGS = {
  autoplayDelay: 3000,  // Carousel autoplay delay in ms
  transitionDuration: 500, // Default transition duration
} as const;
