import { Navigate } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-53px)] flex flex-col items-center justify-center px-5 py-10 gap-3">
      {mode === "signin" ? <SignIn forceRedirectUrl="/" /> : <SignUp forceRedirectUrl="/" />}
      <button
        type="button"
        className="text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setMode((prev) => (prev === "signin" ? "signup" : "signin"))}
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>
    </div>
  );
}
