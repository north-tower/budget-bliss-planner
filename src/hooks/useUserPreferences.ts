import { useEffect, useState } from "react";

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
    if (!userId) {
      setPreferences(DEFAULT_PREFERENCES);
      setIsReady(true);
      return;
    }
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UserPreferences>;
        setPreferences({
          currency: typeof parsed.currency === "string" ? parsed.currency : "USD",
          completedOnboarding: Boolean(parsed.completedOnboarding),
        });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setIsReady(true);
    }
  }, [userId]);

  const savePreferences = (next: UserPreferences) => {
    setPreferences(next);
    if (!userId) return;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
  };

  const setCurrency = (currency: string) => {
    savePreferences({ ...preferences, currency });
  };

  const completeOnboarding = (currency: string) => {
    savePreferences({ currency, completedOnboarding: true });
  };

  return {
    preferences,
    isReady,
    setCurrency,
    completeOnboarding,
  };
}
