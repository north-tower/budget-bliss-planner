export type BudgetCategory = "needs" | "wants" | "savings";

export interface BudgetRow {
  id: string;
  user_id: string;
  month: string;
  income: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetItemRow {
  id: string;
  budget_id: string;
  user_id: string;
  category: BudgetCategory;
  label: string;
  budget_amount: number;
  actual_amount: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummaryRow {
  income: number;
  needs_budget: number;
  needs_actual: number;
  wants_budget: number;
  wants_actual: number;
  savings_budget: number;
  savings_actual: number;
}

export interface UserPreferencesRow {
  id: string;
  user_id: string;
  currency: string;
  completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export type BudgetItemInput = Pick<
  BudgetItemRow,
  "budget_id" | "category" | "label" | "budget_amount" | "actual_amount" | "position"
>;
