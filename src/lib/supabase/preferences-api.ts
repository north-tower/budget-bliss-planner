import { supabase } from "@/lib/supabase/client";
import type { UserPreferencesRow } from "@/lib/supabase/types";

export async function getUserPreferences() {
  const { data, error } = await supabase.from("user_preferences").select("*").maybeSingle();
  if (error) throw error;
  return (data ?? null) as UserPreferencesRow | null;
}

export async function upsertUserPreferences(preferences: {
  user_id: string;
  currency: string;
  completed_onboarding: boolean;
}) {
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(preferences, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) throw error;
  return data as UserPreferencesRow;
}
