// src/components/ui/Button.tsx

import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [styles.base];

    if (variant === "primary") baseStyles.push(styles.primary);
    if (variant === "secondary") baseStyles.push(styles.secondary);
    if (variant === "ghost") baseStyles.push(styles.ghost);

    if (size === "sm") baseStyles.push(styles.sm);
    if (size === "md") baseStyles.push(styles.md);
    if (size === "lg") baseStyles.push(styles.lg);

    if (fullWidth) baseStyles.push(styles.fullWidth);
    if (disabled || loading) baseStyles.push(styles.disabled);
    if (style) baseStyles.push(style);

    return baseStyles;
  };

  const getTextStyle = (): TextStyle[] => {
    const textStyles: TextStyle[] = [styles.text];

    if (variant === "primary") textStyles.push(styles.primaryText);
    if (variant === "secondary") textStyles.push(styles.secondaryText);
    if (variant === "ghost") textStyles.push(styles.ghostText);

    if (size === "sm") textStyles.push(styles.smText);
    if (size === "md") textStyles.push(styles.mdText);
    if (size === "lg") textStyles.push(styles.lgText);

    return textStyles;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" ? COLORS.cream[100] : COLORS.espresso[500]
          }
        />
      ) : typeof children === "string" ? (
        <Text style={getTextStyle()} numberOfLines={1}>
          {children}
        </Text>
      ) : (
        <View style={styles.contentContainer}>
          {React.Children.map(children, (child) =>
            typeof child === "string" ? (
              <Text style={getTextStyle()} numberOfLines={1}>
                {child}
              </Text>
            ) : (
              child
            ),
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  primary: {
    backgroundColor: COLORS.espresso[500],
    borderColor: COLORS.espresso[500],
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: COLORS.espresso[500],
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: "transparent",
  },

  sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
  },
  md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 48,
  },
  lg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minHeight: 56,
  },

  fullWidth: {
    width: "100%",
  },

  disabled: {
    opacity: 0.5,
  },

  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },

  text: {
    fontFamily: TYPOGRAPHY.fonts.bodyMedium,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  primaryText: {
    color: COLORS.cream[100],
  },
  secondaryText: {
    color: COLORS.espresso[500],
  },
  ghostText: {
    color: COLORS.text.secondary,
  },
  smText: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  mdText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  lgText: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
});
