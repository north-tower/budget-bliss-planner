import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/Header";
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
  const isAuthRoute = location.pathname === "/login";
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setShowTips(false);
      return;
    }
    const key = `tips-dismissed-${user.id}`;
    setShowTips(localStorage.getItem(key) !== "1");
  }, [user?.id]);

  const dismissTips = () => {
    if (user?.id) {
      localStorage.setItem(`tips-dismissed-${user.id}`, "1");
    }
    setShowTips(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isAuthRoute ? (
        <Header
          user={user}
          preferences={preferences}
          setCurrency={setCurrency}
          signOut={async () => {
            await signOut();
          }}
          showTips={showTips}
          onDismissTips={dismissTips}
        />
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
