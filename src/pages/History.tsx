import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { loadHistory, deleteFromHistory, fmt, sumField, type SavedBudget } from "@/lib/budget-storage";
import { BudgetTable } from "@/components/BudgetTable";

function BudgetDetail({ budget }: { budget: SavedBudget }) {
  const incomeNum = parseFloat(budget.income) || 0;
  const totalActual = sumField(budget.needsRows, "actual") + sumField(budget.wantsRows, "actual") + sumField(budget.savingsRows, "actual");
  const totalBudget = sumField(budget.needsRows, "budget") + sumField(budget.wantsRows, "budget") + sumField(budget.savingsRows, "budget");
  const remaining = incomeNum - totalActual;

  return (
    <div className="space-y-4 animate-[fade-up_0.3s_ease_both]">
      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Income", value: incomeNum },
          { label: "Budgeted", value: totalBudget },
          { label: "Actual", value: totalActual },
          { label: remaining >= 0 ? "Remaining" : "Over Budget", value: Math.abs(remaining), warn: remaining < 0 },
        ].map((item) => (
          <div key={item.label} className="bg-card rounded-xl border border-border px-4 py-3">
            <div className="text-[0.7rem] tracking-wider uppercase text-muted-foreground mb-1">{item.label}</div>
            <div className={`text-[1.15rem] font-bold font-mono ${item.warn ? "text-destructive" : ""}`}>{fmt(item.value)}</div>
          </div>
        ))}
      </div>
      {/* Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BudgetTable title="Needs" pct="50%" rows={budget.needsRows} onChange={() => {}} colorClass="needs" readOnly />
        <BudgetTable title="Wants" pct="30%" rows={budget.wantsRows} onChange={() => {}} colorClass="wants" readOnly />
        <BudgetTable title="Savings" pct="20%" rows={budget.savingsRows} onChange={() => {}} colorClass="savings" readOnly />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState(loadHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setHistory(loadHistory());
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="min-h-screen px-5 pt-10 pb-20 max-w-[1000px] mx-auto">
      <header className="flex items-center gap-4 mb-10 animate-[fade-down_0.6s_ease_both]">
        <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-[0.85rem]">
          <ArrowLeft className="w-4 h-4" /> Planner
        </Link>
        <h1 className="text-[clamp(1.8rem,4vw,2.8rem)] font-black tracking-tight leading-none">
          Budget History
        </h1>
      </header>

      {history.length === 0 ? (
        <div className="text-center py-20 animate-[fade-up_0.6s_ease_both]">
          <p className="text-muted-foreground text-lg mb-2">No saved budgets yet</p>
          <p className="text-muted-foreground text-[0.85rem]">
            Go back to the planner and save your first budget.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-[fade-up_0.6s_0.1s_ease_both]">
          {history.map((budget) => {
            const isOpen = expandedId === budget.id;
            const incomeNum = parseFloat(budget.income) || 0;
            const totalActual = sumField(budget.needsRows, "actual") + sumField(budget.wantsRows, "actual") + sumField(budget.savingsRows, "actual");
            const date = new Date(budget.date);

            return (
              <div key={budget.id} className="rounded-2xl border-[1.5px] border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : budget.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-foreground/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div>
                      <div className="font-bold text-[1.05rem] truncate">{budget.label}</div>
                      <div className="text-[0.75rem] text-muted-foreground">
                        {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-[0.7rem] text-muted-foreground uppercase tracking-wider">Income</div>
                      <div className="font-mono font-semibold text-[0.95rem]">{fmt(incomeNum)}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="text-[0.7rem] text-muted-foreground uppercase tracking-wider">Spent</div>
                      <div className="font-mono font-semibold text-[0.95rem]">{fmt(totalActual)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(budget.id); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                        aria-label="Delete budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <BudgetDetail budget={budget} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
