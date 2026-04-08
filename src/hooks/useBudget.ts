import { useCallback, useEffect, useRef, useState } from "react";
import { getBudgetByMonth, upsertBudget } from "@/lib/supabase/budget-api";
import type { Budget } from "@/types/budget";

/**
 * Handles selected-month budget header with debounced income autosave.
 */
export function useBudget(month: string) {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [income, setIncome] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBudget() {
      setIsLoading(true);
      try {
        const existing = await getBudgetByMonth(month);
        if (!active) return;
        setBudget(existing);
        setIncome(String(existing.income ?? 0));
      } catch {
        // Auto-create a month budget so row CRUD always has a valid budget_id.
        try {
          const createdId = await upsertBudget(month, 0);
          const created = await getBudgetByMonth(month);
          if (!active) return;
          setBudget({ ...created, id: createdId });
          setIncome(String(created.income ?? 0));
        } catch {
          if (!active) return;
          setBudget(null);
          setIncome("0");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadBudget();
    return () => {
      active = false;
    };
  }, [month]);

  const persistIncomeNow = useCallback(async () => {
    const parsedIncome = Number(income || 0);
    if (Number.isNaN(parsedIncome) || parsedIncome < 0) return null;

    const id = await upsertBudget(month, parsedIncome);
    const latest = await getBudgetByMonth(month);
    const next = { ...latest, id };
    setBudget(next);
    return next;
  }, [income, month]);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      try {
        await persistIncomeNow();
      } catch {
        // noop: UI toasts are handled where inputs are edited
      }
    }, 600);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [income, persistIncomeNow]);

  return { budget, income, setIncome, isLoading, persistIncomeNow };
}
