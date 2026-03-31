import type { BudgetItem, BudgetSummary } from "@/types/budget";

/**
 * Returns allocation targets for the 50/30/20 budgeting model.
 */
export function getAllocations(income: number) {
  return {
    needs: income * 0.5,
    wants: income * 0.3,
    savings: income * 0.2,
  };
}

/**
 * Aggregates item totals by category and overall spending.
 */
export function summarizeItems(income: number, items: BudgetItem[]): BudgetSummary {
  return {
    income,
    needs_budget: items.filter((i) => i.category === "needs").reduce((sum, i) => sum + i.budget_amount, 0),
    needs_actual: items.filter((i) => i.category === "needs").reduce((sum, i) => sum + i.actual_amount, 0),
    wants_budget: items.filter((i) => i.category === "wants").reduce((sum, i) => sum + i.budget_amount, 0),
    wants_actual: items.filter((i) => i.category === "wants").reduce((sum, i) => sum + i.actual_amount, 0),
    savings_budget: items.filter((i) => i.category === "savings").reduce((sum, i) => sum + i.budget_amount, 0),
    savings_actual: items.filter((i) => i.category === "savings").reduce((sum, i) => sum + i.actual_amount, 0),
  };
}
