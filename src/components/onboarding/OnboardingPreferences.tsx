import { useState } from "react";

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "KES", "CAD", "AUD", "INR", "NGN", "ZAR"];

interface OnboardingPreferencesProps {
  open: boolean;
  initialCurrency: string;
  onComplete: (currency: string) => void;
}

export function OnboardingPreferences({ open, initialCurrency, onComplete }: OnboardingPreferencesProps) {
  const [currency, setCurrency] = useState(initialCurrency);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-xl font-bold">Welcome to Budget Bliss</h2>
        <p className="text-sm text-muted-foreground">
          Let us set a couple of basics for your account. You can change this anytime later.
        </p>
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => onComplete(currency)}
          className="w-full rounded-lg bg-primary px-3 py-2 text-primary-foreground"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export { CURRENCY_OPTIONS };
