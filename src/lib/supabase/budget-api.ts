import { supabase } from "@/lib/supabase/client";
import type { BudgetItemInput, BudgetItemRow, BudgetRow, BudgetSummaryRow } from "@/lib/supabase/types";

export function toMonthStartISO(date: Date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export async function upsertBudget(month: string, income: number) {
  const { data, error } = await supabase.rpc("upsert_budget", {
    p_month: month,
    p_income: income,
  });
  if (error) throw error;
  return data as string;
}

export async function getBudgetByMonth(month: string) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("month", month)
    .single();
  if (error) throw error;
  return data as BudgetRow;
}

export async function listBudgets() {
  const { data, error } = await supabase
    .from("budgets")
    .select("*")
    .order("month", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BudgetRow[];
}

export async function listBudgetItems(budgetId: string) {
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("budget_id", budgetId)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? []) as BudgetItemRow[];
}

export async function createBudgetItem(item: BudgetItemInput) {
  const { data, error } = await supabase
    .from("budget_items")
    .insert(item)
    .select("*")
    .single();
  if (error) throw error;
  return data as BudgetItemRow;
}

export async function updateBudgetItem(itemId: string, updates: Partial<BudgetItemInput>) {
  const { data, error } = await supabase
    .from("budget_items")
    .update(updates)
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) throw error;
  return data as BudgetItemRow;
}

export async function deleteBudgetItem(itemId: string) {
  const { error } = await supabase.from("budget_items").delete().eq("id", itemId);
  if (error) throw error;
}

export async function getBudgetSummary(month: string) {
  const { data, error } = await supabase.rpc("get_budget_summary", { p_month: month });
  if (error) throw error;
  return ((data ?? [])[0] ?? null) as BudgetSummaryRow | null;
}
