import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

/**
 * Tracks Clerk auth state and exposes logout for guarded app routes.
 */
export function useAuth() {
  const { isLoaded, signOut } = useClerkAuth();
  const { user } = useUser();

  return {
    user,
    isLoading: !isLoaded,
    signOut,
  };
}
