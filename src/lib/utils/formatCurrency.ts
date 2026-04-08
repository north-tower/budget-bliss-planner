/**
 * Formats values as currency for consistent budget display.
 */
export function formatCurrency(value: number, currency = "USD") {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
