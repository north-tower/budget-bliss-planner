import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function AuthForm() {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        const { error: signInError } = await signInWithEmail(email, password);
        if (signInError) throw signInError;
        navigate("/");
      } else {
        const { error: signUpError } = await signUpWithEmail(email, password);
        if (signUpError) throw signUpError;
        toast.success("Account created. You can now sign in.");
        setMode("login");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4">
      <h1 className="text-xl font-bold">{mode === "login" ? "Log In" : "Create Account"}</h1>
      <input
        className="w-full rounded-lg border border-border bg-background px-3 py-2"
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded-lg border border-border bg-background px-3 py-2"
        type="password"
        required
        minLength={6}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary px-3 py-2 text-primary-foreground disabled:opacity-60"
        type="submit"
      >
        {isSubmitting ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
      </button>
      <button
        type="button"
        className="w-full text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setMode((prev) => (prev === "login" ? "signup" : "login"))}
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
      </button>
    </form>
  );
}
