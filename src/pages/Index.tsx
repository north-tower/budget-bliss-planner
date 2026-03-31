import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Save, History, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { BudgetTable } from "@/components/BudgetTable";
import {
  type TableRow,
  NEEDS_DEFAULT, WANTS_DEFAULT, SAVINGS_DEFAULT,
  fmt, sumField, loadCurrent, saveCurrent, saveToHistory,
} from "@/lib/budget-storage";

export default function BudgetPlanner() {
  const saved = useRef(loadCurrent());
  const [income, setIncome] = useState(saved.current?.income ?? "");
  const [needsRows, setNeedsRows] = useState<TableRow[]>(saved.current?.needsRows ?? NEEDS_DEFAULT);
  const [wantsRows, setWantsRows] = useState<TableRow[]>(saved.current?.wantsRows ?? WANTS_DEFAULT);
  const [savingsRows, setSavingsRows] = useState<TableRow[]>(saved.current?.savingsRows ?? SAVINGS_DEFAULT);

  // Auto-persist current state
  useEffect(() => {
    saveCurrent({ income, needsRows, wantsRows, savingsRows });
  }, [income, needsRows, wantsRows, savingsRows]);

  const incomeNum = parseFloat(income) || 0;

  const totals = useMemo(() => {
    const nBudget = sumField(needsRows, "budget");
    const nActual = sumField(needsRows, "actual");
    const wBudget = sumField(wantsRows, "budget");
    const wActual = sumField(wantsRows, "actual");
    const sBudget = sumField(savingsRows, "budget");
    const sActual = sumField(savingsRows, "actual");
    const totalBudget = nBudget + wBudget + sBudget;
    const totalActual = nActual + wActual + sActual;
    const remaining = incomeNum - totalActual;
    const base = Math.max(incomeNum, totalActual);
    return { nActual, wActual, sActual, totalBudget, totalActual, remaining, base };
  }, [needsRows, wantsRows, savingsRows, incomeNum]);

  const barPct = (val: number) =>
    totals.base > 0 ? Math.min((val / totals.base) * 100, 100) + "%" : "0%";

  const handleSave = () => {
    const monthLabel = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
    saveToHistory({
      id: crypto.randomUUID(),
      label: monthLabel + " Budget",
      date: new Date().toISOString(),
      income,
      needsRows,
      wantsRows,
      savingsRows,
    });
    toast.success("Budget saved to history!");
  };

  const handleReset = () => {
    setIncome("");
    setNeedsRows(NEEDS_DEFAULT);
    setWantsRows(WANTS_DEFAULT);
    setSavingsRows(SAVINGS_DEFAULT);
    toast("Budget cleared");
  };

  return (
    <div className="min-h-screen px-5 pt-10 pb-20">
      {/* Header */}
      <header className="text-center mb-10 animate-[fade-down_0.6s_ease_both]">
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-black tracking-tight leading-none">
          50 / 30 / 20
        </h1>
        <p className="mt-2 text-muted-foreground text-[0.95rem] tracking-wider">
          Budget Planner — Needs · Wants · Savings
        </p>
        {/* Action bar */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <button onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[0.82rem] font-medium hover:opacity-90 transition-opacity">
            <Save className="w-3.5 h-3.5" /> Save Budget
          </button>
          <button onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-[0.82rem] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <Link to="/history"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-[0.82rem] font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/[0.03] transition-colors">
            <History className="w-3.5 h-3.5" /> History
          </Link>
        </div>
      </header>

      {/* Income Input */}
      <div className="max-w-[500px] mx-auto mb-9 animate-[fade-down_0.6s_0.1s_ease_both]">
        <label className="block text-[0.78rem] font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Monthly Take-Home Income
        </label>
        <div className="flex items-center border-2 border-foreground rounded-xl bg-card overflow-hidden transition-shadow focus-within:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]">
          <span className="px-3.5 text-[1.2rem] font-medium text-muted-foreground border-r-2 border-border">$</span>
          <input type="number" value={income} onChange={(e) => setIncome(e.target.value)}
            placeholder="0.00" step="0.01" min="0"
            className="border-none outline-none px-4 py-3.5 text-[1.3rem] font-medium w-full bg-transparent text-foreground" />
        </div>
      </div>

      {/* Allocation Pills */}
      <div className="flex gap-3 justify-center mb-11 flex-wrap animate-[fade-down_0.6s_0.15s_ease_both]">
        {[
          { label: "50% · Needs", value: incomeNum * 0.5, bg: "bg-needs" },
          { label: "30% · Wants", value: incomeNum * 0.3, bg: "bg-wants" },
          { label: "20% · Savings", value: incomeNum * 0.2, bg: "bg-savings" },
        ].map((pill) => (
          <div key={pill.label} className={`${pill.bg} px-6 py-3 rounded-full flex flex-col items-center gap-0.5 min-w-[130px]`}>
            <span className="text-[0.72rem] tracking-wider uppercase opacity-70">{pill.label}</span>
            <span className="text-[1.25rem] font-bold font-mono">{fmt(pill.value)}</span>
          </div>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[900px] mx-auto mb-5 animate-[fade-up_0.6s_0.2s_ease_both]">
        <BudgetTable
          title="Needs"
          pct="50%"
          rows={needsRows}
          onChange={setNeedsRows}
          colorClass="needs"
          maxCategoryTotal={incomeNum > 0 ? incomeNum * 0.5 : undefined}
        />
        <BudgetTable
          title="Wants"
          pct="30%"
          rows={wantsRows}
          onChange={setWantsRows}
          colorClass="wants"
          maxCategoryTotal={incomeNum > 0 ? incomeNum * 0.3 : undefined}
        />
      </div>

      {/* Savings & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[900px] mx-auto animate-[fade-up_0.6s_0.3s_ease_both]">
        <BudgetTable
          title="Savings / Debt"
          pct="20%"
          rows={savingsRows}
          onChange={setSavingsRows}
          colorClass="savings"
          maxCategoryTotal={incomeNum > 0 ? incomeNum * 0.2 : undefined}
        />

        {/* Summary Card */}
        <div className="rounded-2xl border-[1.5px] border-border bg-card overflow-hidden">
          <div className="bg-summary px-5 py-3.5 border-b-[1.5px] border-border">
            <h2 className="text-[1.3rem] font-bold">Summary</h2>
          </div>
          <div className="grid grid-cols-3 max-sm:grid-cols-1">
            {[
              { label: "Income", value: incomeNum },
              { label: "Total Budget", value: totals.totalBudget },
              { label: "Total Actual", value: totals.totalActual },
            ].map((item, i) => (
              <div key={item.label} className={`px-[22px] py-5 ${i < 2 ? "border-r border-border max-sm:border-r-0 max-sm:border-b" : ""}`}>
                <div className="text-[0.72rem] tracking-wider uppercase text-muted-foreground mb-1.5">{item.label}</div>
                <div className="text-[1.4rem] font-bold font-mono">{fmt(item.value)}</div>
              </div>
            ))}
          </div>
          <div className="px-[22px] py-[18px] border-t-[1.5px] border-border">
            <div className="flex justify-between text-[0.78rem] text-muted-foreground mb-2">
              <span>Spending Breakdown</span>
              <span className={`font-mono ${totals.remaining >= 0 ? "text-needs-accent" : "text-destructive"}`}>
                {fmt(Math.abs(totals.remaining))} {totals.remaining >= 0 ? "remaining" : "over budget"}
              </span>
            </div>
            <div className="bg-border rounded-full h-2.5 overflow-hidden flex">
              <div className="bg-needs-accent h-full transition-all duration-500" style={{ width: barPct(totals.nActual) }} />
              <div className="bg-wants-accent h-full transition-all duration-500" style={{ width: barPct(totals.wActual) }} />
              <div className="bg-savings-accent h-full transition-all duration-500" style={{ width: barPct(totals.sActual) }} />
            </div>
            <div className="flex gap-3.5 mt-2.5 flex-wrap">
              {[
                { label: "Needs", cls: "bg-needs-accent" },
                { label: "Wants", cls: "bg-wants-accent" },
                { label: "Savings", cls: "bg-savings-accent" },
              ].map((legend) => (
                <span key={legend.label} className="text-[0.75rem] flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${legend.cls} inline-block`} />
                  {legend.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
