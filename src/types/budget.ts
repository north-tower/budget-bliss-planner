export type Budget = {
  id: string;
  user_id: string;
  month: string;
  income: number;
  created_at: string;
  updated_at: string;
};

export type BudgetItem = {
  id: string;
  budget_id: string;
  user_id: string;
  category: "needs" | "wants" | "savings";
  label: string;
  budget_amount: number;
  actual_amount: number;
  position: number;
};

export type BudgetSummary = {
  income: number;
  needs_budget: number;
  needs_actual: number;
  wants_budget: number;
  wants_actual: number;
  savings_budget: number;
  savings_actual: number;
};
