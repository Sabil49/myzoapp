// components/cart/CartItem.tsx
import { COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Typography } from "../ui/Typography";

interface CartItemProps {
  item: {
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
      styleCode: string;
    };
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const handleDecrease = () => {
    onUpdateQuantity(item.productId, item.quantity - 1);
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.productId, item.quantity + 1);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            item.product.images[0] || "https://placeholder-url.com/default.png",
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Typography variant="body" style={styles.name}>
              {item.product.name}
            </Typography>
            <Typography variant="caption" color={COLORS.text.muted}>
              {item.product.styleCode}
            </Typography>
          </View>

          <TouchableOpacity
            onPress={() => onRemove(item.productId)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={COLORS.text.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              onPress={handleDecrease}
              style={styles.quantityButton}
              disabled={item.quantity <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={
                  item.quantity <= 1 ? COLORS.text.muted : COLORS.espresso[500]
                }
              />
            </TouchableOpacity>

            <Typography variant="body" style={styles.quantity}>
              {item.quantity}
            </Typography>

            <TouchableOpacity
              onPress={handleIncrease}
              style={styles.quantityButton}
            >
              <Ionicons name="add" size={20} color={COLORS.espresso[500]} />
            </TouchableOpacity>
          </View>

          <Typography variant="body" style={styles.price}>
            ${(item.product.price * item.quantity).toLocaleString()}
          </Typography>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  image: {
    width: 100,
    height: 120,
    backgroundColor: COLORS.cream[300],
    marginRight: SPACING.md,
  },
  details: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  info: {
    flex: 1,
    gap: SPACING.xs,
  },
  name: {
    marginBottom: SPACING.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  quantity: {
    minWidth: 40,
    textAlign: "center",
    fontFamily: "Inter-SemiBold",
  },
  price: {
    fontFamily: "Inter-SemiBold",
    color: COLORS.espresso[500],
  },
});
