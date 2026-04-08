import { useEffect, useState } from "react";
import { getUserPreferences, upsertUserPreferences } from "@/lib/supabase/preferences-api";

interface UserPreferences {
  currency: string;
  completedOnboarding: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  currency: "USD",
  completedOnboarding: false,
};

function getStorageKey(userId: string) {
  return `budget-preferences-${userId}`;
}

export function useUserPreferences(userId: string | undefined) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setPreferences(DEFAULT_PREFERENCES);
      setIsReady(true);
      return;
    }

    // Fast local hydrate so UI does not flash while network resolves.
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserPreferences>;
        if (active) {
          setPreferences({
            currency: typeof parsed.currency === "string" ? parsed.currency : "USD",
            completedOnboarding: Boolean(parsed.completedOnboarding),
          });
        }
      }
    } catch {
      if (active) setPreferences(DEFAULT_PREFERENCES);
    }

    async function loadRemote() {
      try {
        const remote = await getUserPreferences();
        if (!active) return;
        if (remote) {
          const next = {
            currency: remote.currency || "USD",
            completedOnboarding: remote.completed_onboarding,
          };
          setPreferences(next);
          localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
        } else {
          setPreferences(DEFAULT_PREFERENCES);
        }
      } catch {
        // If remote fetch fails, keep local/default preferences.
      } finally {
        if (active) setIsReady(true);
      }
    }

    loadRemote();

    return () => {
      active = false;
    };
  }, [userId]);

  const savePreferences = async (next: UserPreferences) => {
    setPreferences(next);
    if (!userId) return;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
    try {
      await upsertUserPreferences({
        user_id: userId,
        currency: next.currency,
        completed_onboarding: next.completedOnboarding,
      });
    } catch {
      // Keep local value; next successful write will reconcile remote state.
    }
  };

  const setCurrency = (currency: string) => {
    void savePreferences({ ...preferences, currency });
  };

  const completeOnboarding = (currency: string) => {
    void savePreferences({ currency, completedOnboarding: true });
  };

  return {
    preferences,
    isReady,
    setCurrency,
    completeOnboarding,
  };
}
