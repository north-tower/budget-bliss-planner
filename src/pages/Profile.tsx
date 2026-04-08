import { Link, Navigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { CURRENCY_OPTIONS } from "@/components/onboarding/OnboardingPreferences";

export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();
  const { preferences, isReady, setCurrency } = useUserPreferences(user?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[13px] text-muted-foreground animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-20">
      <div className="max-w-[760px] mx-auto">
        <Link
          to="/planner"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors no-underline"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Planner
        </Link>

        <h1 className="text-[clamp(1.8rem,4vw,2.4rem)] font-normal leading-tight text-foreground mt-2 mb-1">
          Profile
        </h1>
        <p className="text-[13.5px] text-muted-foreground mb-8">Manage your account and preferences.</p>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden mb-3">
          <div className="px-6 py-4 border-b border-border/40">
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">Account</span>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-foreground leading-tight">
                  {user.user_metadata?.full_name ?? "Your Account"}
                </p>
                <p className="text-[13px] text-muted-foreground mt-0.5">{user.email ?? "No email available"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">Preferences</span>
          </div>

          <div className="px-6 py-2 divide-y divide-border/40">
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-[13.5px] font-medium text-foreground">Currency</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Synced across all your devices.</p>
              </div>
              <div className="relative shrink-0">
                <select
                  value={preferences.currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={!isReady}
                  className="appearance-none h-[34px] pl-3 pr-7 rounded-lg border border-border/60 bg-muted/50 text-[13px] font-medium text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {CURRENCY_OPTIONS.map(({ code }) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-muted/30 border-t border-border/40">
            <button
              onClick={() => {
                void signOut();
              }}
              className="h-[34px] px-3.5 inline-flex items-center gap-2 rounded-lg border border-border/60 text-[13px] text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 active:scale-[0.98] transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
