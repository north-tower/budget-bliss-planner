-- 50/30/20 Budget Planner backend schema + RLS + RPC for Supabase

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Keep updated_at timestamps current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Stores one budget per user per month
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month DATE NOT NULL,
  income NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (income >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT budgets_user_month_unique UNIQUE(user_id, month),
  CONSTRAINT budgets_month_is_first_day CHECK (month = date_trunc('month', month)::date)
);

CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_month_idx ON public.budgets(month);

DROP TRIGGER IF EXISTS budgets_set_updated_at ON public.budgets;
CREATE TRIGGER budgets_set_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Line items belong to a budget
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('needs', 'wants', 'savings')),
  label TEXT NOT NULL,
  budget_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (budget_amount >= 0),
  actual_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (actual_amount >= 0),
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS budget_items_budget_id_idx ON public.budget_items(budget_id);
CREATE INDEX IF NOT EXISTS budget_items_user_id_idx ON public.budget_items(user_id);
CREATE INDEX IF NOT EXISTS budget_items_budget_category_idx ON public.budget_items(budget_id, category);
CREATE INDEX IF NOT EXISTS budget_items_budget_position_idx ON public.budget_items(budget_id, position);

DROP TRIGGER IF EXISTS budget_items_set_updated_at ON public.budget_items;
CREATE TRIGGER budget_items_set_updated_at
BEFORE UPDATE ON public.budget_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Ensure budget_items.user_id always matches owning budget.user_id
CREATE OR REPLACE FUNCTION public.enforce_budget_item_owner()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_budget_user_id UUID;
BEGIN
  SELECT user_id INTO v_budget_user_id
  FROM public.budgets
  WHERE id = NEW.budget_id;

  IF v_budget_user_id IS NULL THEN
    RAISE EXCEPTION 'Budget % does not exist', NEW.budget_id;
  END IF;

  NEW.user_id = v_budget_user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS budget_items_enforce_owner ON public.budget_items;
CREATE TRIGGER budget_items_enforce_owner
BEFORE INSERT OR UPDATE ON public.budget_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_budget_item_owner();

-- Row Level Security
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users own their budgets" ON public.budgets;
CREATE POLICY "Users own their budgets"
  ON public.budgets
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users own their budget items" ON public.budget_items;
CREATE POLICY "Users own their budget items"
  ON public.budget_items
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Upsert monthly budget header
CREATE OR REPLACE FUNCTION public.upsert_budget(
  p_month DATE,
  p_income NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_month DATE := date_trunc('month', p_month)::date;
BEGIN
  INSERT INTO public.budgets (user_id, month, income)
  VALUES (auth.uid(), v_month, GREATEST(p_income, 0))
  ON CONFLICT (user_id, month)
  DO UPDATE SET income = EXCLUDED.income, updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Get summary totals for a month
CREATE OR REPLACE FUNCTION public.get_budget_summary(p_month DATE)
RETURNS TABLE (
  income NUMERIC,
  needs_budget NUMERIC,
  needs_actual NUMERIC,
  wants_budget NUMERIC,
  wants_actual NUMERIC,
  savings_budget NUMERIC,
  savings_actual NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    b.income,
    COALESCE(SUM(CASE WHEN i.category = 'needs' THEN i.budget_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN i.category = 'needs' THEN i.actual_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN i.category = 'wants' THEN i.budget_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN i.category = 'wants' THEN i.actual_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN i.category = 'savings' THEN i.budget_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN i.category = 'savings' THEN i.actual_amount ELSE 0 END), 0)
  FROM public.budgets b
  LEFT JOIN public.budget_items i ON i.budget_id = b.id
  WHERE b.user_id = auth.uid()
    AND b.month = date_trunc('month', p_month)::date
  GROUP BY b.income;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_budget(DATE, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_budget_summary(DATE) TO authenticated;

-- Realtime for budget_items
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.budget_items;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;
