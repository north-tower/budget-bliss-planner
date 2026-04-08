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
        const { error: err } = await signInWithEmail(email, password);
        if (err) throw err;
        navigate("/planner");
      } else {
        const { error: err } = await signUpWithEmail(email, password);
        if (err) throw err;
        toast.success("Account created. You can now sign in.");
        setMode("login");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="w-full max-w-[400px] relative">
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-needs-accent via-wants-accent to-savings-accent z-10" />
      <div className="rounded-2xl border border-border bg-card px-8 pt-10 pb-8 shadow-sm">
        <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-1">
          Welcome
        </p>
        <h1 className="text-[28px] font-normal leading-tight text-foreground mb-7">
          {isLogin ? (
            <>
              Sign in to{" "}
              <em className="italic text-primary" style={{ fontStyle: "italic" }}>
                continue
              </em>
            </>
          ) : (
            <>
              Create an{" "}
              <em className="italic text-primary" style={{ fontStyle: "italic" }}>
                account
              </em>
            </>
          )}
        </h1>

        <div className="flex bg-muted rounded-lg p-[3px] mb-7">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={`flex-1 h-8 text-[13px] font-medium rounded-md transition-all duration-150 ${
                mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
              Email address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 rounded-lg border border-border bg-muted/50 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 rounded-lg border border-border bg-muted/50 px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-[13px] text-destructive">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[46px] mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium tracking-wide hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
          >
            <span>{isSubmitting ? "Please wait..." : isLogin ? "Log in" : "Sign up"}</span>
            {!isSubmitting ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : null}
          </button>
        </form>
      </div>
    </div>
  );
}
