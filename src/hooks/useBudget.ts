import { useEffect, useRef, useState } from "react";
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
        if (!active) return;
        setBudget(null);
        setIncome("0");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadBudget();
    return () => {
      active = false;
    };
  }, [month]);

  useEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(async () => {
      const parsedIncome = Number(income || 0);
      if (Number.isNaN(parsedIncome) || parsedIncome < 0) return;

      try {
        const id = await upsertBudget(month, parsedIncome);
        const latest = await getBudgetByMonth(month);
        setBudget({ ...latest, id });
      } catch {
        // noop: UI toasts are handled where inputs are edited
      }
    }, 600);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [income, month]);

  return { budget, income, setIncome, isLoading };
}
