import { Link, useLocation } from "react-router-dom";
import { Save, LogOut, ChevronDown, DollarSign, Info } from "lucide-react";
import { CURRENCY_OPTIONS } from "@/components/onboarding/OnboardingPreferences";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  user: unknown;
  preferences: { currency: string };
  setCurrency: (currency: string) => void;
  signOut: () => Promise<void>;
  showTips?: boolean;
  onDismissTips?: () => void;
}

export function Header({ user, preferences, setCurrency, signOut, showTips, onDismissTips }: HeaderProps) {
  const location = useLocation();
  const isPlannerRoute = location.pathname === "/";

  return (
    <header className="border-b border-border/60 bg-card/80 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-[900px] px-5 h-[54px] flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-[26px] h-[26px] rounded-[7px] bg-primary flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2L12 11H2L7 2Z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <span className="text-[17px] font-medium tracking-tight text-foreground">NorthStack</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            <div className="relative group">
              <select
                value={preferences.currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="appearance-none h-8 pl-7 pr-6 rounded-lg border border-border/60 bg-muted/50 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
              >
                {CURRENCY_OPTIONS.map(({ code }) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            </div>
            {showTips ? (
              <HeaderTip text="Choose your preferred currency for all amounts." />
            ) : null}

            <div className="w-px h-4 bg-border/60 mx-1" />

            {isPlannerRoute ? (
              <button
                onClick={() => window.dispatchEvent(new Event("planner-save-request"))}
                className="h-8 px-3 flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-medium hover:opacity-90 active:scale-[0.98] transition-all"
              >
                <Save className="w-3 h-3" />
                Save budget
              </button>
            ) : null}
            {showTips && isPlannerRoute ? <HeaderTip text="Save commits income and category rows for this month." /> : null}

            <div className="w-px h-4 bg-border/60 mx-1" />

            <Link
              to="/history"
              className="h-8 px-2.5 flex items-center rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all no-underline"
            >
              History
            </Link>
            {showTips ? <HeaderTip text="Open saved months and jump back to planner." /> : null}
            <Link
              to="/profile"
              className="h-8 px-2.5 flex items-center rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all no-underline"
            >
              Profile
            </Link>
            {showTips ? <HeaderTip text="Manage account and preferences like currency." /> : null}

            <div className="w-px h-4 bg-border/60 mx-1" />

            <button
              onClick={() => {
                void signOut();
              }}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg border border-border/60 text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border active:scale-[0.98] transition-all"
            >
              <LogOut className="w-3 h-3" />
              Log out
            </button>
            {showTips ? <HeaderTip text="Securely sign out of your account." /> : null}
            {showTips ? (
              <button
                onClick={onDismissTips}
                className="h-8 px-2.5 ml-1 rounded-lg border border-border/60 text-[12px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                Got it
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function HeaderTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="h-6 w-6 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
          <Info className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}
