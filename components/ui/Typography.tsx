// components/ui/Typography.tsx
import { COLORS, TYPOGRAPHY } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, TextProps, TextStyle } from "react-native";

type Variant = "h1" | "h2" | "h3" | "body" | "caption" | "label";

interface TypographyProps extends TextProps {
  variant?: Variant;
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  align?: "left" | "center" | "right";
}

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  children,
  style,
  color,
  align = "left",
  ...props
}) => {
  const textStyle: TextStyle[] = [
    styles[variant],
    align !== "left" && { textAlign: align },
    color && { color },
    style,
  ].filter(Boolean) as TextStyle[];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: TYPOGRAPHY.fonts.headingBold,
    fontSize: TYPOGRAPHY.sizes["3xl"],
    lineHeight: 48,
    letterSpacing: -0.5,
    color: COLORS.text.primary,
  },
  h2: {
    fontFamily: TYPOGRAPHY.fonts.heading,
    fontSize: TYPOGRAPHY.sizes["2xl"],
    lineHeight: 40,
    letterSpacing: -0.3,
    color: COLORS.text.primary,
  },
  h3: {
    fontFamily: TYPOGRAPHY.fonts.heading,
    fontSize: TYPOGRAPHY.sizes.xl,
    lineHeight: 32,
    color: COLORS.text.primary,
  },
  body: {
    fontFamily: TYPOGRAPHY.fonts.body,
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 24,
    color: COLORS.text.primary,
  },
  caption: {
    fontFamily: TYPOGRAPHY.fonts.body,
    fontSize: TYPOGRAPHY.sizes.sm,
    lineHeight: 20,
    color: COLORS.text.muted,
  },
  label: {
    fontFamily: TYPOGRAPHY.fonts.bodyMedium,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: COLORS.text.secondary,
  },
});
