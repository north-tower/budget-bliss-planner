// Supabase Edge Function
// Clones previous month's budget template into current month with actual_amount reset to 0.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Missing Supabase env vars", { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date();
  const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const previousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const currentMonthStr = currentMonth.toISOString().slice(0, 10);
  const previousMonthStr = previousMonth.toISOString().slice(0, 10);

  const { data: previousBudgets, error: previousBudgetsError } = await admin
    .from("budgets")
    .select("id,user_id,income")
    .eq("month", previousMonthStr);

  if (previousBudgetsError) {
    return new Response(previousBudgetsError.message, { status: 500 });
  }

  for (const previousBudget of previousBudgets ?? []) {
    const { data: currentBudget, error: upsertBudgetError } = await admin
      .from("budgets")
      .upsert(
        {
          user_id: previousBudget.user_id,
          month: currentMonthStr,
          income: previousBudget.income,
        },
        { onConflict: "user_id,month" }
      )
      .select("id")
      .single();

    if (upsertBudgetError || !currentBudget) {
      return new Response(upsertBudgetError?.message ?? "Unable to upsert current month budget", {
        status: 500,
      });
    }

    const { data: previousItems, error: previousItemsError } = await admin
      .from("budget_items")
      .select("user_id,category,label,budget_amount,position")
      .eq("budget_id", previousBudget.id)
      .order("position", { ascending: true });

    if (previousItemsError) {
      return new Response(previousItemsError.message, { status: 500 });
    }

    const { error: clearItemsError } = await admin
      .from("budget_items")
      .delete()
      .eq("budget_id", currentBudget.id);

    if (clearItemsError) {
      return new Response(clearItemsError.message, { status: 500 });
    }

    if (previousItems && previousItems.length > 0) {
      const nextItems = previousItems.map((item) => ({
        budget_id: currentBudget.id,
        user_id: item.user_id,
        category: item.category,
        label: item.label,
        budget_amount: item.budget_amount,
        actual_amount: 0,
        position: item.position,
      }));

      const { error: insertItemsError } = await admin.from("budget_items").insert(nextItems);
      if (insertItemsError) {
        return new Response(insertItemsError.message, { status: 500 });
      }
    }
  }

  return new Response("Monthly budget templates cloned.", { status: 200 });
});
