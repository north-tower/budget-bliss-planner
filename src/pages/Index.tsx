import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { BudgetTable } from "@/components/BudgetTable";
import { MonthPicker } from "@/components/budget/MonthPicker";
import { IncomeInput } from "@/components/budget/IncomeInput";
import { SummaryPanel } from "@/components/budget/SummaryPanel";
import { OnboardingPreferences } from "@/components/onboarding/OnboardingPreferences";
import { useAuth } from "@/hooks/useAuth";
import { useBudget } from "@/hooks/useBudget";
import { useBudgetItems } from "@/hooks/useBudgetItems";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { toMonthStartISO } from "@/lib/supabase/budget-api";
import type { BudgetCategory } from "@/lib/supabase/types";
import type { BudgetItem } from "@/types/budget";
import type { TableRow } from "@/lib/budget-storage";
import { sumField } from "@/lib/budget-storage";

export default function BudgetPlanner() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMonth = normalizeMonth(searchParams.get("month")) ?? toMonthStartISO();
  const { user, isLoading: authLoading } = useAuth();
  const { preferences, isReady: prefsReady, completeOnboarding } = useUserPreferences(user?.id);
  const [month, setMonth] = useState(initialMonth);
  const { budget, income, setIncome, isLoading: budgetLoading, persistIncomeNow } = useBudget(month);
  const { grouped, addItem, updateItem, deleteItem, isLoading: itemsLoading } = useBudgetItems(
    budget?.id ?? null,
    user?.id ?? null
  );
  const syncTimers = useRef<Record<string, number>>({});
  const saveHandlerRef = useRef<(() => Promise<void>) | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const incomeNum = Number(income || 0);

  const needsRows = useMemo(() => toRows(grouped.needs), [grouped.needs]);
  const wantsRows = useMemo(() => toRows(grouped.wants), [grouped.wants]);
  const savingsRows = useMemo(() => toRows(grouped.savings), [grouped.savings]);
  const needsBudget = useMemo(() => sumField(needsRows, "budget"), [needsRows]);
  const needsActual = useMemo(() => sumField(needsRows, "actual"), [needsRows]);
  const wantsBudget = useMemo(() => sumField(wantsRows, "budget"), [wantsRows]);
  const wantsActual = useMemo(() => sumField(wantsRows, "actual"), [wantsRows]);
  const savingsBudget = useMemo(() => sumField(savingsRows, "budget"), [savingsRows]);
  const savingsActual = useMemo(() => sumField(savingsRows, "actual"), [savingsRows]);

  const handleCategoryChange = (category: BudgetCategory, rows: TableRow[]) => {
    if (!budget?.id) {
      toast.error("No budget found for this month yet. Try setting income first.");
      return;
    }
    const currentItems = grouped[category];

    // Make add/remove row actions immediate so table controls feel responsive.
    if (rows.length > currentItems.length) {
      const addedRow = rows[rows.length - 1];
      addItem(category, addedRow?.name || "New Item").catch((error) => {
        const message = error instanceof Error ? error.message : "Could not add row.";
        toast.error(message);
      });
      return;
    }

    if (rows.length < currentItems.length) {
      const removed = currentItems[currentItems.length - 1];
      if (removed) {
        deleteItem(removed.id).catch((error) => {
          const message = error instanceof Error ? error.message : "Could not remove row.";
          toast.error(message);
        });
      }
      return;
    }

    const key = `${category}-${month}`;
    if (syncTimers.current[key]) window.clearTimeout(syncTimers.current[key]);
    syncTimers.current[key] = window.setTimeout(() => {
      syncCategoryRows(category, rows, currentItems, {
        addItem,
        updateItem,
        deleteItem,
      }).catch(() => toast.error("Could not sync category changes."));
    }, 400);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const hadBudgetId = Boolean(budget?.id);
      const persistedBudget = await persistIncomeNow();

      if (!persistedBudget?.id) {
        toast.error("Could not save budget header. Please try again.");
        return;
      }

      if (!hadBudgetId) {
        toast.success("Income saved. You can now continue editing this month.");
        return;
      }

      Object.values(syncTimers.current).forEach((timer) => window.clearTimeout(timer));
      await syncCategoryRows("needs", needsRows, grouped.needs, { addItem, updateItem, deleteItem });
      await syncCategoryRows("wants", wantsRows, grouped.wants, { addItem, updateItem, deleteItem });
      await syncCategoryRows("savings", savingsRows, grouped.savings, { addItem, updateItem, deleteItem });
      toast.success("Budget saved. You can switch months using the month picker.");
    } catch {
      toast.error("Could not save budget changes.");
    } finally {
      setIsSaving(false);
    }
  };
  saveHandlerRef.current = handleSave;

  const isLoading = authLoading || budgetLoading || itemsLoading || !prefsReady;

  useEffect(() => {
    const handleExternalSave = () => {
      if (saveHandlerRef.current) {
        void saveHandlerRef.current();
      }
    };
    window.addEventListener("planner-save-request", handleExternalSave);

    return () => {
      Object.values(syncTimers.current).forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("planner-save-request", handleExternalSave);
    };
  }, []);

  useEffect(() => {
    const fromUrl = normalizeMonth(searchParams.get("month"));
    if (fromUrl && fromUrl !== month) {
      setMonth(fromUrl);
    }
  }, [searchParams, month]);

  useEffect(() => {
    if (searchParams.get("month") !== month) {
      setSearchParams({ month }, { replace: true });
    }
  }, [month, searchParams, setSearchParams]);

  if (authLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen px-5 pt-10 pb-20">
      <header className="max-w-[900px] mx-auto mb-6">
        <h1 className="text-center text-[clamp(2rem,5vw,3rem)] font-black tracking-tight leading-none">
          50 / 30 / 20
        </h1>
        <div className="mt-4 flex justify-center">
          <MonthPicker month={month} onChange={setMonth} />
        </div>
      </header>

      <IncomeInput income={income} onChange={setIncome} currency={preferences.currency} />

      {isLoading ? <div className="text-center text-muted-foreground pb-6">Loading budget...</div> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[900px] mx-auto mb-5">
        <BudgetTable
          title="Needs"
          pct="50%"
          rows={needsRows}
          onChange={(rows) => handleCategoryChange("needs", rows)}
          colorClass="needs"
          currency={preferences.currency}
          maxCategoryTotal={incomeNum > 0 ? incomeNum * 0.5 : undefined}
        />
        <BudgetTable
          title="Wants"
          pct="30%"
          rows={wantsRows}
          onChange={(rows) => handleCategoryChange("wants", rows)}
          colorClass="wants"
          currency={preferences.currency}
          maxCategoryTotal={incomeNum > 0 ? incomeNum * 0.3 : undefined}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[900px] mx-auto">
        <BudgetTable
          title="Savings / Debt"
          pct="20%"
          rows={savingsRows}
          onChange={(rows) => handleCategoryChange("savings", rows)}
          colorClass="savings"
          currency={preferences.currency}
          maxCategoryTotal={incomeNum > 0 ? incomeNum * 0.2 : undefined}
        />
        <SummaryPanel
          income={incomeNum}
          needsBudget={needsBudget}
          needsActual={needsActual}
          wantsBudget={wantsBudget}
          wantsActual={wantsActual}
          savingsBudget={savingsBudget}
          savingsActual={savingsActual}
          currency={preferences.currency}
        />
      </div>
      <OnboardingPreferences
        open={prefsReady && !preferences.completedOnboarding}
        initialCurrency={preferences.currency}
        onComplete={completeOnboarding}
      />
    </div>
  );
}

function normalizeMonth(value: string | null) {
  if (!value) return null;
  const valid = /^\d{4}-\d{2}-01$/.test(value);
  return valid ? value : null;
}

function toRows(items: BudgetItem[]): TableRow[] {
  return items
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      name: item.label,
      budget: String(item.budget_amount || ""),
      actual: String(item.actual_amount || ""),
    }));
}

async function syncCategoryRows(
  category: BudgetCategory,
  rows: TableRow[],
  existingItems: BudgetItem[],
  actions: {
    addItem: (category: BudgetCategory, label?: string) => Promise<void>;
    updateItem: (itemId: string, updates: Partial<BudgetItem>) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
  }
) {
  const sorted = existingItems.slice().sort((a, b) => a.position - b.position);
  const max = Math.max(rows.length, sorted.length);
  for (let idx = 0; idx < max; idx += 1) {
    const nextRow = rows[idx];
    const prev = sorted[idx];

    if (!prev && nextRow) {
      await actions.addItem(category, nextRow.name || "New Item");
      continue;
    }
    if (prev && !nextRow) {
      await actions.deleteItem(prev.id);
      continue;
    }
    if (!prev || !nextRow) continue;

    const updates: Partial<BudgetItem> = {
      label: nextRow.name,
      budget_amount: Number(nextRow.budget || 0),
      actual_amount: Number(nextRow.actual || 0),
      position: idx,
    };
    await actions.updateItem(prev.id, updates);
  }
}
