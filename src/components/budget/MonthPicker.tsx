import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthPickerProps {
  month: string;
  onChange: (month: string) => void;
}

function shiftMonth(month: string, delta: number) {
  const date = new Date(`${month}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + delta);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export function MonthPicker({ month, onChange }: MonthPickerProps) {
  const display = new Date(`${month}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex items-center justify-center gap-3">
      <button className="p-2 rounded-lg border border-border" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      <p className="min-w-44 text-center font-semibold">{display}</p>
      <button className="p-2 rounded-lg border border-border" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
