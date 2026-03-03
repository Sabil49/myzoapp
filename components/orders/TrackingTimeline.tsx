// src/components/orders/TrackingTimeline.tsx

import { COLORS, SPACING } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Typography } from "../ui/Typography";

interface StatusHistoryItem {
  status: string;
  notes?: string;
  createdAt: string;
}

interface TrackingTimelineProps {
  statusHistory: StatusHistoryItem[];
  currentStatus: string;
}

const STATUS_ORDER = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];
const STATUS_LABELS: Record<string, string> = {
  PLACED: "Order Placed",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  statusHistory,
  currentStatus,
}) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {STATUS_ORDER.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const historyItem = statusHistory.find((h) => h.status === status);

        return (
          <View key={status} style={styles.step}>
            <View style={styles.leftColumn}>
              <View
                style={[
                  styles.iconContainer,
                  isCompleted && styles.iconContainerCompleted,
                ]}
              >
                <Ionicons
                  name={isCompleted ? "checkmark" : "ellipse-outline"}
                  size={20}
                  color={isCompleted ? COLORS.cream[100] : COLORS.espresso[300]}
                />
              </View>
              {index < STATUS_ORDER.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </View>

            <View style={styles.rightColumn}>
              <Typography
                variant="body"
                style={{
                  ...styles.statusLabel,
                  ...(isCompleted ? styles.statusLabelCompleted : {}),
                }}
              >
                {STATUS_LABELS[status]}
              </Typography>
              {historyItem && (
                <>
                  <Typography variant="caption" style={styles.date}>
                    {new Date(historyItem.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Typography>

                  {historyItem.notes && (
                    <Typography variant="caption" style={styles.notes}>
                      {historyItem.notes}
                    </Typography>
                  )}
                </>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  step: {
    flexDirection: "row",
    minHeight: 80,
  },
  leftColumn: {
    alignItems: "center",
    marginRight: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cream[300],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.espresso[300],
  },
  iconContainerCompleted: {
    backgroundColor: COLORS.espresso[500],
    borderColor: COLORS.espresso[500],
  },
  connector: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.espresso[200],
    marginVertical: SPACING.xs,
  },
  connectorCompleted: {
    backgroundColor: COLORS.espresso[500],
  },
  rightColumn: {
    flex: 1,
    paddingTop: SPACING.sm,
  },
  statusLabel: {
    marginBottom: SPACING.xs,
  },
  statusLabelCompleted: {
    fontFamily: "Inter-SemiBold",
    color: COLORS.espresso[500],
  },
  date: {
    marginBottom: SPACING.xs,
  },
  notes: {
    color: COLORS.text.muted,
    fontStyle: "italic",
  },
});
