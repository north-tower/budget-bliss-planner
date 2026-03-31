import { useEffect, useState } from "react";
import { getBudgetSummary } from "@/lib/supabase/budget-api";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import type { BudgetSummary } from "@/types/budget";

interface SummaryPanelProps {
  month: string;
}

export function SummaryPanel({ month }: SummaryPanelProps) {
  const [summary, setSummary] = useState<BudgetSummary | null>(null);

  useEffect(() => {
    let active = true;
    getBudgetSummary(month)
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch(() => {
        if (active) setSummary(null);
      });
    return () => {
      active = false;
    };
  }, [month]);

  const income = Number(summary?.income ?? 0);
  const totalActual = Number(summary?.needs_actual ?? 0) + Number(summary?.wants_actual ?? 0) + Number(summary?.savings_actual ?? 0);
  const totalBudget = Number(summary?.needs_budget ?? 0) + Number(summary?.wants_budget ?? 0) + Number(summary?.savings_budget ?? 0);
  const remaining = income - totalActual;
  const base = Math.max(income, totalActual, 1);

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card overflow-hidden">
      <div className="bg-summary px-5 py-3.5 border-b-[1.5px] border-border">
        <h2 className="text-[1.3rem] font-bold">Summary</h2>
      </div>
      <div className="grid grid-cols-3 max-sm:grid-cols-1">
        <Metric label="Income" value={income} />
        <Metric label="Total Budget" value={totalBudget} />
        <Metric label="Total Actual" value={totalActual} />
      </div>
      <div className="px-[22px] py-[18px] border-t-[1.5px] border-border">
        <div className="flex justify-between text-[0.78rem] text-muted-foreground mb-2">
          <span>Spending Breakdown</span>
          <span className={`font-mono ${remaining >= 0 ? "text-needs-accent" : "text-destructive"}`}>
            {formatCurrency(Math.abs(remaining))} {remaining >= 0 ? "remaining" : "over budget"}
          </span>
        </div>
        <div className="bg-border rounded-full h-2.5 overflow-hidden flex">
          <div className="bg-needs-accent h-full" style={{ width: `${Math.min((Number(summary?.needs_actual ?? 0) / base) * 100, 100)}%` }} />
          <div className="bg-wants-accent h-full" style={{ width: `${Math.min((Number(summary?.wants_actual ?? 0) / base) * 100, 100)}%` }} />
          <div className="bg-savings-accent h-full" style={{ width: `${Math.min((Number(summary?.savings_actual ?? 0) / base) * 100, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-[22px] py-5 border-r border-border max-sm:border-r-0 max-sm:border-b last:border-r-0">
      <div className="text-[0.72rem] tracking-wider uppercase text-muted-foreground mb-1.5">{label}</div>
      <div className="text-[1.4rem] font-bold font-mono">{formatCurrency(value)}</div>
    </div>
  );
}
