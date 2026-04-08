import { Link, Navigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { CURRENCY_OPTIONS } from "@/components/onboarding/OnboardingPreferences";

export default function ProfilePage() {
  const { user, isLoading, signOut } = useAuth();
  const { preferences, isReady, setCurrency } = useUserPreferences(user?.id);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen px-5 pt-10 pb-20">
      <div className="max-w-[760px] mx-auto">
        <header className="mb-8">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Planner
          </Link>
          <h1 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-black tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm">Manage your account and preferences.</p>
        </header>

        <div className="rounded-2xl border border-border bg-card p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">{user.email ?? "No email available"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-4">Preferences</h2>
          <div className="max-w-[280px]">
            <label className="block text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
              Currency
            </label>
            <select
              value={preferences.currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={!isReady}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.code} ({option.symbol})
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              Saved to your account and synced across devices.
            </p>
          </div>

          <button
            onClick={async () => {
              await signOut();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 mt-6 rounded-lg border border-border text-sm hover:bg-muted/40"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
