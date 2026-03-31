import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  createBudgetItem,
  deleteBudgetItem,
  listBudgetItems,
  updateBudgetItem,
} from "@/lib/supabase/budget-api";
import { subscribeToBudgetItems, unsubscribeFromChannel } from "@/lib/supabase/realtime";
import type { BudgetCategory, BudgetItemRow } from "@/lib/supabase/types";
import type { BudgetItem } from "@/types/budget";

const DEFAULT_LABELS: Record<BudgetCategory, string[]> = {
  needs: ["Rent/Mortgage", "Utilities", "Groceries", "Insurance", "Transportation", "Healthcare"],
  wants: ["Dining Out", "Entertainment", "Shopping", "Subscriptions", "Travel", "Hobbies"],
  savings: ["Emergency Fund", "Retirement", "Investments", "Debt Payment"],
};

/**
 * Manages CRUD, optimistic updates, and realtime sync for monthly line items.
 */
export function useBudgetItems(budgetId: string | null, userId: string | null) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const grouped = useMemo(
    () => ({
      needs: items.filter((i) => i.category === "needs"),
      wants: items.filter((i) => i.category === "wants"),
      savings: items.filter((i) => i.category === "savings"),
    }),
    [items]
  );

  useEffect(() => {
    if (!budgetId) {
      setItems([]);
      return;
    }
    let active = true;
    setIsLoading(true);

    async function load() {
      try {
        const data = await listBudgetItems(budgetId);
        if (!active) return;
        setItems(data as BudgetItem[]);

        if (data.length === 0) {
          for (const category of ["needs", "wants", "savings"] as const) {
            for (const [index, label] of DEFAULT_LABELS[category].entries()) {
              await createBudgetItem({
                budget_id: budgetId,
                category,
                label,
                budget_amount: 0,
                actual_amount: 0,
                position: index,
              });
            }
          }
          const seeded = await listBudgetItems(budgetId);
          if (active) setItems(seeded as BudgetItem[]);
        }
      } catch {
        toast.error("Failed to load budget items.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [budgetId]);

  useEffect(() => {
    if (!userId) return;
    const channel = subscribeToBudgetItems(userId, async () => {
      if (!budgetId) return;
      const refreshed = await listBudgetItems(budgetId);
      setItems(refreshed as BudgetItem[]);
    });
    return () => {
      unsubscribeFromChannel(channel);
    };
  }, [budgetId, userId]);

  const addItem = async (category: BudgetCategory, label = "") => {
    if (!budgetId) return;
    const position = grouped[category].length;
    const created = await createBudgetItem({
      budget_id: budgetId,
      category,
      label,
      budget_amount: 0,
      actual_amount: 0,
      position,
    });
    setItems((prev) => [...prev, created as BudgetItem]);
  };

  const updateItem = async (itemId: string, updates: Partial<BudgetItemRow>) => {
    const before = items;
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...updates } : item)));
    try {
      await updateBudgetItem(itemId, updates);
    } catch {
      setItems(before);
      toast.error("Could not save item changes.");
    }
  };

  const removeItem = async (itemId: string) => {
    const before = items;
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    try {
      await deleteBudgetItem(itemId);
    } catch {
      setItems(before);
      toast.error("Could not delete item.");
    }
  };

  return { items, grouped, addItem, updateItem, deleteItem: removeItem, isLoading };
}
