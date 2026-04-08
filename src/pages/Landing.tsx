import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-54px)] px-5 py-14 bg-background">
      <div className="max-w-[900px] mx-auto">
        <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-needs-accent via-wants-accent to-savings-accent" />

          <div className="px-8 sm:px-10 pt-10 pb-8">
            <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-3">
              NorthStack · Budget Planner
            </p>
            <h1 className="text-[clamp(2.8rem,8vw,4.5rem)] font-normal leading-none tracking-tight text-foreground mb-4">
              <span className="italic text-needs-accent">50</span>
              {" / "}
              <span className="italic text-wants-accent">30</span>
              {" / "}
              <span className="italic text-savings-accent">20</span>
            </h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-[600px] mb-8">
              A simple rule for a healthier financial life. Split your take-home income into needs,
              wants, and savings — then track, review, and stay on course every month.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-needs p-5">
                <p className="text-[2rem] font-normal leading-none text-foreground mb-1">
                  50%
                </p>
                <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Needs
                </p>
                <p className="text-[12.5px] text-foreground/75 leading-relaxed">
                  Rent, groceries, transport, essentials
                </p>
              </div>

              <div className="rounded-2xl bg-wants p-5">
                <p className="text-[2rem] font-normal leading-none text-foreground mb-1">
                  30%
                </p>
                <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Wants
                </p>
                <p className="text-[12.5px] text-foreground/75 leading-relaxed">
                  Lifestyle spending and enjoyment
                </p>
              </div>

              <div className="rounded-2xl bg-savings p-5">
                <p className="text-[2rem] font-normal leading-none text-foreground mb-1">
                  20%
                </p>
                <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Savings
                </p>
                <p className="text-[12.5px] text-foreground/75 leading-relaxed">
                  Emergency fund, investing, debt payoff
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap px-8 sm:px-10 py-5 bg-muted/30 border-t border-border/40">
            <Link
              to="/login"
              className="h-[42px] px-5 inline-flex items-center gap-2 rounded-[10px] bg-primary text-primary-foreground text-[13.5px] font-medium hover:opacity-90 active:scale-[0.99] transition-all no-underline"
            >
              Get started
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <span className="text-[13px] text-muted-foreground">
              Create an account or sign in to start planning.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
