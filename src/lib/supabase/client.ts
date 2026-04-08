import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: (options?: { template?: string }) => Promise<string | null>;
      };
    };
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  accessToken: async () => {
    const clerkToken = await window.Clerk?.session?.getToken({ template: "supabase" });
    return clerkToken ?? null;
  },
});
