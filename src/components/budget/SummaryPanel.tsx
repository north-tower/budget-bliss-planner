import { formatCurrency } from "@/lib/utils/formatCurrency";

interface SummaryPanelProps {
  income: number;
  needsBudget: number;
  needsActual: number;
  wantsBudget: number;
  wantsActual: number;
  savingsBudget: number;
  savingsActual: number;
  currency: string;
}

export function SummaryPanel({
  income,
  needsBudget,
  needsActual,
  wantsBudget,
  wantsActual,
  savingsBudget,
  savingsActual,
  currency,
}: SummaryPanelProps) {
  const totalActual = needsActual + wantsActual + savingsActual;
  const totalBudget = needsBudget + wantsBudget + savingsBudget;
  const remaining = income - totalActual;
  const base = Math.max(income, totalActual, 1);

  return (
    <div className="rounded-2xl border-[1.5px] border-border bg-card overflow-hidden">
      <div className="bg-summary px-5 py-3.5 border-b-[1.5px] border-border">
        <h2 className="text-[1.3rem] font-bold">Summary</h2>
      </div>
      <div className="grid grid-cols-3 max-sm:grid-cols-1">
        <Metric label="Income" value={income} currency={currency} />
        <Metric label="Total Budget" value={totalBudget} currency={currency} />
        <Metric label="Total Actual" value={totalActual} currency={currency} />
      </div>
      <div className="px-[22px] py-[18px] border-t-[1.5px] border-border">
        <div className="flex justify-between text-[0.78rem] text-muted-foreground mb-2">
          <span>Spending Breakdown</span>
          <span
            className={`font-mono text-right whitespace-nowrap text-[0.72rem] sm:text-[0.78rem] ${remaining >= 0 ? "text-needs-accent" : "text-destructive"}`}
          >
            {formatCurrency(Math.abs(remaining), currency)} {remaining >= 0 ? "remaining" : "over budget"}
          </span>
        </div>
        <div className="bg-border rounded-full h-2.5 overflow-hidden flex">
          <div className="bg-needs-accent h-full" style={{ width: `${Math.min((needsActual / base) * 100, 100)}%` }} />
          <div className="bg-wants-accent h-full" style={{ width: `${Math.min((wantsActual / base) * 100, 100)}%` }} />
          <div className="bg-savings-accent h-full" style={{ width: `${Math.min((savingsActual / base) * 100, 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, currency }: { label: string; value: number; currency: string }) {
  return (
    <div className="px-[22px] py-5 border-r border-border max-sm:border-r-0 max-sm:border-b last:border-r-0">
      <div className="text-[0.72rem] tracking-wider uppercase text-muted-foreground mb-1.5">{label}</div>
      <div className="font-bold font-mono leading-tight text-[0.78rem] sm:text-[0.88rem] lg:text-[0.95rem] break-words">
        {formatCurrency(value, currency)}
      </div>
    </div>
  );
}
