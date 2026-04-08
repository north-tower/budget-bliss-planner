import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LogOut, Save } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CURRENCY_OPTIONS } from "@/components/onboarding/OnboardingPreferences";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import Index from "./pages/Index.tsx";
import History from "./pages/History.tsx";
import Login from "./pages/Login.tsx";
import Profile from "./pages/Profile.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout() {
  const { user, signOut } = useAuth();
  const { preferences, setCurrency } = useUserPreferences(user?.id);
  const location = useLocation();
  const isPlannerRoute = location.pathname === "/";
  const isAuthRoute = location.pathname === "/login";

  return (
    <div className="min-h-screen bg-background">
      {!isAuthRoute ? (
        <header className="border-b border-border bg-card/60 backdrop-blur">
          <div className="mx-auto max-w-[900px] px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm font-semibold tracking-wide text-foreground">NorthStack</span>
            {user ? (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={preferences.currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code}
                    </option>
                  ))}
                </select>
                {isPlannerRoute ? (
                  <button
                    onClick={() => window.dispatchEvent(new Event("planner-save-request"))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Budget
                  </button>
                ) : null}
                <Link to="/history" className="text-sm text-muted-foreground hover:text-foreground">
                  Local History
                </Link>
                <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground">
                  Profile
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log out
                </button>
              </div>
            ) : null}
          </div>
        </header>
      ) : null}
      <Routes>
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
