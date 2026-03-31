import { getAllocations } from "@/lib/utils/budgetCalculations";
import { formatCurrency } from "@/lib/utils/formatCurrency";

interface IncomeInputProps {
  income: string;
  onChange: (next: string) => void;
}

export function IncomeInput({ income, onChange }: IncomeInputProps) {
  const incomeNumber = Number(income || 0);
  const allocation = getAllocations(incomeNumber);

  return (
    <>
      <div className="max-w-[500px] mx-auto mb-9">
        <label className="block text-[0.78rem] font-medium tracking-widest uppercase text-muted-foreground mb-2">
          Monthly Take-Home Income
        </label>
        <div className="flex items-center border-2 border-foreground rounded-xl bg-card overflow-hidden">
          <span className="px-3.5 text-[1.2rem] font-medium text-muted-foreground border-r-2 border-border">$</span>
          <input
            type="number"
            value={income}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="border-none outline-none px-4 py-3.5 text-[1.3rem] font-medium w-full bg-transparent text-foreground"
          />
        </div>
      </div>
      <div className="flex gap-3 justify-center mb-11 flex-wrap">
        <div className="bg-needs px-6 py-3 rounded-full text-center min-w-[130px]">
          <p className="text-[0.72rem] tracking-wider uppercase opacity-70">50% - Needs</p>
          <p className="text-[1.2rem] font-bold font-mono">{formatCurrency(allocation.needs)}</p>
        </div>
        <div className="bg-wants px-6 py-3 rounded-full text-center min-w-[130px]">
          <p className="text-[0.72rem] tracking-wider uppercase opacity-70">30% - Wants</p>
          <p className="text-[1.2rem] font-bold font-mono">{formatCurrency(allocation.wants)}</p>
        </div>
        <div className="bg-savings px-6 py-3 rounded-full text-center min-w-[130px]">
          <p className="text-[0.72rem] tracking-wider uppercase opacity-70">20% - Savings</p>
          <p className="text-[1.2rem] font-bold font-mono">{formatCurrency(allocation.savings)}</p>
        </div>
      </div>
    </>
  );
}
