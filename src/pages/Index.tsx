import { useState, useCallback, useMemo } from "react";

interface TableRow {
  name: string;
  budget: string;
  actual: string;
}

const NEEDS_DEFAULT: TableRow[] = [
  "Rent / Mortgage", "Utilities", "Groceries", "Insurance",
  "Transportation", "Healthcare", "Childcare", "Other Need",
].map((name) => ({ name, budget: "", actual: "" }));

const WANTS_DEFAULT: TableRow[] = [
  "Dining Out", "Entertainment", "Shopping", "Subscriptions",
  "Travel", "Hobbies", "Personal Care", "Other Want",
].map((name) => ({ name, budget: "", actual: "" }));

const SAVINGS_DEFAULT: TableRow[] = [
  "Emergency Fund", "Retirement", "Investments", "Debt Payment", "Other Savings",
].map((name) => ({ name, budget: "", actual: "" }));

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function sumField(rows: TableRow[], field: "budget" | "actual") {
  return rows.reduce((s, r) => s + (parseFloat(r[field]) || 0), 0);
}

interface BudgetTableProps {
  title: string;
  pct: string;
  rows: TableRow[];
  onChange: (rows: TableRow[]) => void;
  colorClass: "needs" | "wants" | "savings";
}

function BudgetTable({ title, pct, rows, onChange, colorClass }: BudgetTableProps) {
  const headerBg = {
    needs: "bg-needs",
    wants: "bg-wants",
    savings: "bg-savings",
  }[colorClass];

  const updateRow = useCallback(
    (i: number, field: keyof TableRow, value: string) => {
      const next = [...rows];
      next[i] = { ...next[i], [field]: value };
      onChange(next);
    },
    [rows, onChange]
  );

  const budgetTotal = sumField(rows, "budget");
  const actualTotal = sumField(rows, "actual");

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card overflow-hidden">
      <div className={`flex items-center justify-between px-[18px] py-[14px] pb-3 border-b-[1.5px] border-border ${headerBg}`}>
        <h2 className="text-[1.3rem] font-bold">{title}</h2>
        <span className="text-[0.82rem] font-medium px-3 py-1 rounded-full">{pct}</span>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-[0.72rem] font-medium tracking-wider uppercase text-muted-foreground px-3.5 py-2.5 text-left border-b border-border w-[45%]">Category</th>
            <th className="text-[0.72rem] font-medium tracking-wider uppercase text-muted-foreground px-3.5 py-2.5 text-left border-b border-border">Budget</th>
            <th className="text-[0.72rem] font-medium tracking-wider uppercase text-muted-foreground px-3.5 py-2.5 text-left border-b border-border">Actual</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              <td className="p-0">
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  className="w-full border-none outline-none px-3.5 py-[11px] text-[0.9rem] bg-transparent text-foreground focus:bg-foreground/[0.02] placeholder:text-muted-foreground"
                  placeholder="Category"
                />
              </td>
              <td className="p-0">
                <input
                  type="number"
                  value={row.budget}
                  onChange={(e) => updateRow(i, "budget", e.target.value)}
                  className="w-full border-none outline-none px-3.5 py-[11px] text-[0.9rem] bg-transparent text-foreground focus:bg-foreground/[0.02]"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </td>
              <td className="p-0">
                <input
                  type="number"
                  value={row.actual}
                  onChange={(e) => updateRow(i, "actual", e.target.value)}
                  className="w-full border-none outline-none px-3.5 py-[11px] text-[0.9rem] bg-transparent text-foreground focus:bg-foreground/[0.02]"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="px-3.5 py-3 font-semibold text-[0.9rem] bg-foreground/[0.02] border-t-2 border-border">Total</td>
            <td className="px-3.5 py-3 font-semibold text-[1rem] bg-foreground/[0.02] border-t-2 border-border font-mono">{fmt(budgetTotal)}</td>
            <td className="px-3.5 py-3 font-semibold text-[1rem] bg-foreground/[0.02] border-t-2 border-border font-mono">{fmt(actualTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function BudgetPlanner() {
  const [income, setIncome] = useState("");
  const [needsRows, setNeedsRows] = useState(NEEDS_DEFAULT);
  const [wantsRows, setWantsRows] = useState(WANTS_DEFAULT);
  const [savingsRows, setSavingsRows] = useState(SAVINGS_DEFAULT);

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
      </header>

      {/* Income Input */}
      <div className="max-w-[500px] mx-auto mb-9 animate-[fade-down_0.6s_0.1s_ease_both]">
        <label className="block text-[0.78rem] font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Monthly Take-Home Income
        </label>
        <div className="flex items-center border-2 border-foreground rounded-xl bg-card overflow-hidden transition-shadow focus-within:shadow-[0_0_0_4px_rgba(0,0,0,0.08)]">
          <span className="px-3.5 text-[1.2rem] font-medium text-muted-foreground border-r-2 border-border">
            $
          </span>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="border-none outline-none px-4 py-3.5 text-[1.3rem] font-medium w-full bg-transparent text-foreground"
          />
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

      {/* Tables Grid - Needs & Wants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[900px] mx-auto mb-5 animate-[fade-up_0.6s_0.2s_ease_both]">
        <BudgetTable title="Needs" pct="50%" rows={needsRows} onChange={setNeedsRows} colorClass="needs" />
        <BudgetTable title="Wants" pct="30%" rows={wantsRows} onChange={setWantsRows} colorClass="wants" />
      </div>

      {/* Savings & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[900px] mx-auto animate-[fade-up_0.6s_0.3s_ease_both]">
        <BudgetTable title="Savings / Debt" pct="20%" rows={savingsRows} onChange={setSavingsRows} colorClass="savings" />

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
                <div className="text-[0.72rem] tracking-wider uppercase text-muted-foreground mb-1.5">
                  {item.label}
                </div>
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
