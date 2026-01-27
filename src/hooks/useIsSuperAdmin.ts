import { useUser } from "@clerk/clerk-react";

export const useIsSuperAdmin = () => {
  const { user, isLoaded } = useUser();
  const configuredAdminId = import.meta.env.VITE_ADMIN_USER_ID;

  // Ensure robust check suppressing whitespace
  const isSuperAdmin =
    isLoaded &&
    !!user?.id &&
    !!configuredAdminId &&
    user.id.trim() === configuredAdminId.trim();

  return { isSuperAdmin, isLoaded };
};
