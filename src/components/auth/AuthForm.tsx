import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSignIn, useSignUp } from "@clerk/clerk-react";

export function AuthForm() {
  const navigate = useNavigate();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
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
        if (!signInLoaded) throw new Error("Sign in is not ready yet.");
        const result = await signIn.create({
          identifier: email,
          password,
        });
        if (result.status !== "complete") throw new Error("Could not complete sign in.");
        await setSignInActive({ session: result.createdSessionId });
        navigate("/");
      } else {
        if (!signUpLoaded) throw new Error("Sign up is not ready yet.");
        const result = await signUp.create({ emailAddress: email, password });
        if (result.status !== "complete") {
          toast.success("Account created. Verify your email to continue.");
          setMode("login");
          return;
        }
        await setSignUpActive({ session: result.createdSessionId });
        navigate("/");
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
