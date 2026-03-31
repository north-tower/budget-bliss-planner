import { useCallback } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { type TableRow, sumField, fmt } from "@/lib/budget-storage";

interface BudgetTableProps {
  title: string;
  pct: string;
  rows: TableRow[];
  onChange: (rows: TableRow[]) => void;
  colorClass: "needs" | "wants" | "savings";
  readOnly?: boolean;
  maxCategoryTotal?: number;
}

export function BudgetTable({ title, pct, rows, onChange, colorClass, readOnly, maxCategoryTotal }: BudgetTableProps) {
  const headerBg = {
    needs: "bg-needs",
    wants: "bg-wants",
    savings: "bg-savings",
  }[colorClass];

  const updateRow = useCallback(
    (i: number, field: keyof TableRow, value: string) => {
      const next = [...rows];
      next[i] = { ...next[i], [field]: value };
      if ((field === "budget" || field === "actual") && typeof maxCategoryTotal === "number") {
        const nextTotal = sumField(next, field);
        if (nextTotal > maxCategoryTotal) {
          toast.error(`${title} ${field} total cannot exceed ${fmt(maxCategoryTotal)}.`);
          return;
        }
      }
      onChange(next);
    },
    [rows, onChange, maxCategoryTotal, title]
  );

  const addRow = () => onChange([...rows, { name: "", budget: "", actual: "" }]);
  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, idx) => idx !== i));
  };

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
            {!readOnly && <th className="w-8 border-b border-border" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-b-0 group">
              <td className="p-0">
                {readOnly ? (
                  <span className="px-3.5 py-[11px] text-[0.9rem] block">{row.name}</span>
                ) : (
                  <input type="text" value={row.name} onChange={(e) => updateRow(i, "name", e.target.value)}
                    className="w-full border-none outline-none px-3.5 py-[11px] text-[0.9rem] bg-transparent text-foreground focus:bg-foreground/[0.02] placeholder:text-muted-foreground" placeholder="Category" />
                )}
              </td>
              <td className="p-0">
                {readOnly ? (
                  <span className="px-3.5 py-[11px] text-[0.9rem] font-mono block">{row.budget ? fmt(parseFloat(row.budget)) : "—"}</span>
                ) : (
                  <input type="number" value={row.budget} onChange={(e) => updateRow(i, "budget", e.target.value)}
                    className="w-full border-none outline-none px-3.5 py-[11px] text-[0.9rem] bg-transparent text-foreground focus:bg-foreground/[0.02]" placeholder="0" min="0" step="0.01" />
                )}
              </td>
              <td className="p-0">
                {readOnly ? (
                  <span className="px-3.5 py-[11px] text-[0.9rem] font-mono block">{row.actual ? fmt(parseFloat(row.actual)) : "—"}</span>
                ) : (
                  <input type="number" value={row.actual} onChange={(e) => updateRow(i, "actual", e.target.value)}
                    className="w-full border-none outline-none px-3.5 py-[11px] text-[0.9rem] bg-transparent text-foreground focus:bg-foreground/[0.02]" placeholder="0" min="0" step="0.01" />
                )}
              </td>
              {!readOnly && (
                <td className="p-0 text-center">
                  <button onClick={() => removeRow(i)} className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive" aria-label="Remove row">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="px-3.5 py-3 font-semibold text-[0.9rem] bg-foreground/[0.02] border-t-2 border-border">Total</td>
            <td className="px-3.5 py-3 font-semibold text-[1rem] bg-foreground/[0.02] border-t-2 border-border font-mono">{fmt(budgetTotal)}</td>
            <td className="px-3.5 py-3 font-semibold text-[1rem] bg-foreground/[0.02] border-t-2 border-border font-mono">{fmt(actualTotal)}</td>
            {!readOnly && <td className="bg-foreground/[0.02] border-t-2 border-border" />}
          </tr>
        </tfoot>
      </table>
      {!readOnly && (
        <button onClick={addRow} className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[0.8rem] text-muted-foreground hover:text-foreground hover:bg-foreground/[0.02] transition-colors border-t border-border">
          <Plus className="w-3.5 h-3.5" /> Add Row
        </button>
      )}
    </div>
  );
}
