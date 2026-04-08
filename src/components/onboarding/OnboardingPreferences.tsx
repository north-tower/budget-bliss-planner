import { useState } from "react";

const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "EUR" },
  { code: "GBP", symbol: "GBP" },
  { code: "KES", symbol: "Ksh" },
  { code: "CAD", symbol: "CAD" },
  { code: "AUD", symbol: "AUD" },
  { code: "INR", symbol: "INR" },
  { code: "NGN", symbol: "NGN" },
  { code: "ZAR", symbol: "ZAR" },
];

interface OnboardingPreferencesProps {
  open: boolean;
  initialCurrency: string;
  onComplete: (currency: string) => void;
}

export function OnboardingPreferences({ open, initialCurrency, onComplete }: OnboardingPreferencesProps) {
  const [currency, setCurrency] = useState(initialCurrency);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[420px] relative overflow-hidden rounded-[20px] border border-border bg-card px-8 pt-10 pb-8 shadow-lg">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-needs-accent via-wants-accent to-savings-accent" />

        <div className="flex items-center gap-1.5 mb-7">
          <div className="h-1.5 w-5 rounded-full bg-primary" />
          <div className="h-1.5 w-1.5 rounded-full bg-border" />
          <div className="h-1.5 w-1.5 rounded-full bg-border" />
        </div>

        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-1">
          Getting started
        </p>
        <h2 className="text-[26px] font-normal leading-tight text-foreground mb-2">
          Your{" "}
          <em className="italic text-primary" style={{ fontStyle: "italic" }}>
            preferred
          </em>{" "}
          currency
        </h2>
        <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-7">
          Choose the currency you use most often. You can always update this in settings later.
        </p>

        <label className="block text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2.5">
          Select currency
        </label>
        <div className="grid grid-cols-3 gap-2 mb-7">
          {CURRENCY_OPTIONS.map(({ code, symbol }) => {
            const isSelected = currency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`h-12 flex flex-col items-center justify-center gap-px rounded-[10px] border transition-all duration-150 ${
                  isSelected
                    ? "border-[1.5px] border-primary bg-primary/10 text-foreground"
                    : "border-border bg-muted/50 text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}
              >
                <span className="text-base font-light leading-none">{symbol}</span>
                <span className="text-[11px] font-medium tracking-wide leading-none">{code}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onComplete(currency)}
          className="w-full h-[46px] flex items-center justify-center gap-2 rounded-[10px] bg-primary text-primary-foreground text-[14px] font-medium tracking-wide hover:opacity-90 active:scale-[0.99] transition-all duration-150"
        >
          <span>Continue with {currency}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export { CURRENCY_OPTIONS };
