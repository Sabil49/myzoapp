// constants/theme.ts

export const COLORS = {
  // Primary colors
  espresso: {
    100: "#F5F1ED",
    200: "#E8DED2",
    300: "#CBBAA4",
    400: "#9B7E5D",
    500: "#6B4E3D",
    600: "#543E31",
    700: "#3D2E25",
  },
  cream: {
    100: "#FFFFFF",
    200: "#FAF8F5",
    300: "#F5F1EB",
    400: "#EDE8DF",
  },
  gold: {
    100: "#F9F6F0",
    200: "#E8DCC8",
    300: "#D4C2A0",
    400: "#B8A57D",
  },

  // Semantic colors
  background: "#FAF8F5",
  surface: "#FFFFFF",
  border: "#E8DED2",

  // Text colors
  text: {
    primary: "#1A1A1A",
    secondary: "#6B4E3D",
    muted: "#9B8777",
  },

  // Status colors
  success: "#4A6B4E",
  error: "#8B3A3A",
  warning: "#B8A57D",
  info: "#6B4E3D",
};

export const TYPOGRAPHY = {
  fonts: {
    heading: "PlayfairDisplay-Regular",
    headingBold: "PlayfairDisplay-Bold",
    body: "Inter-Regular",
    bodyMedium: "Inter-Medium",
    bodySemiBold: "Inter-SemiBold",
  },
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 24,
    "2xl": 32,
    "3xl": 40,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const LAYOUT = {
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};
