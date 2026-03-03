// utils/currency.ts
export const formatCurrency = (
  amount: number,
  currency: string = "USD",
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const parseCurrency = (formatted: string): number => {
  if (!formatted || typeof formatted !== "string") {
    return NaN;
  }
  // Handle negative formats: both '-' prefix and accounting parentheses ()
  const isNegative =
    formatted.includes("-") ||
    (formatted.includes("(") && formatted.includes(")"));
  // Remove all non-numeric characters except decimal point
  const cleaned = formatted.replace(/[^0-9.]+/g, "");
  const value = parseFloat(cleaned);
  return isNegative ? -value : value;
};
