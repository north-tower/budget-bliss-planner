import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-54px)] px-5 py-14">
      <div className="max-w-[900px] mx-auto">
        <section className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground mb-2">
            Budget Bliss Planner
          </p>
          <h1 className="text-[clamp(2rem,6vw,3.6rem)] font-black tracking-tight leading-none mb-3">
            50 / 30 / 20
          </h1>
          <p className="text-muted-foreground max-w-[680px]">
            The 50/30/20 rule helps you split income into needs (50%), wants (30%), and savings or debt
            payoff (20%). This app lets you track each month, save progress, and review history.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
            <div className="rounded-xl bg-needs px-4 py-3">
              <p className="text-xs uppercase tracking-widest opacity-70">50% Needs</p>
              <p className="text-sm mt-1">Rent, groceries, transport, essentials</p>
            </div>
            <div className="rounded-xl bg-wants px-4 py-3">
              <p className="text-xs uppercase tracking-widest opacity-70">30% Wants</p>
              <p className="text-sm mt-1">Lifestyle spending and enjoyment</p>
            </div>
            <div className="rounded-xl bg-savings px-4 py-3">
              <p className="text-xs uppercase tracking-widest opacity-70">20% Savings</p>
              <p className="text-sm mt-1">Emergency fund, investing, debt payoff</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Proceed to Login
            </Link>
            <span className="text-sm text-muted-foreground">Create an account or sign in to start planning.</span>
          </div>
        </section>
      </div>
    </div>
  );
}
