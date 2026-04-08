import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { listBudgets } from "@/lib/supabase/budget-api";
import type { BudgetRow } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export default function HistoryPage() {
  const [budgets, setBudgets] = useState<BudgetRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listBudgets()
      .then((data) => {
        if (active) setBudgets(data);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen px-5 pt-10 pb-20 max-w-[900px] mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[0.85rem]">
          <ArrowLeft className="w-4 h-4" /> Planner
        </Link>
        <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black tracking-tight leading-none">Saved Months</h1>
      </header>

      {isLoading ? (
        <p className="text-muted-foreground">Loading saved months...</p>
      ) : budgets.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-2">No saved budgets yet</p>
          <p className="text-muted-foreground text-[0.85rem]">
            Save a budget from the planner, then come back here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => {
            const monthLabel = new Date(`${budget.month}T00:00:00Z`).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            });
            return (
              <Link
                key={budget.id}
                to={`/?month=${budget.month}`}
                className="block rounded-2xl border border-border bg-card px-5 py-4 hover:bg-foreground/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-semibold">{monthLabel}</p>
                      <p className="text-xs text-muted-foreground">Click to open in planner</p>
                    </div>
                  </div>
                  <p className="font-mono text-sm">{formatCurrency(Number(budget.income ?? 0))}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
