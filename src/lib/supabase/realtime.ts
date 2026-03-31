import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export function subscribeToBudgetItems(userId: string, onChange: () => void): RealtimeChannel {
  return supabase
    .channel(`budget-items-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "budget_items",
        filter: `user_id=eq.${userId}`,
      },
      onChange
    )
    .subscribe();
}

export function unsubscribeFromChannel(channel: RealtimeChannel) {
  return supabase.removeChannel(channel);
}
