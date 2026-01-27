import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { checkAdminRole } from "@/lib/api";

export const useIsSuperAdmin = () => {
  const { user, isLoaded } = useUser();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminRole", user?.id],
    queryFn: () => {
      console.log("Calling checkAdminRole for user:", user?.id);
      return checkAdminRole(user?.id);
    },
    enabled: isLoaded && !!user?.id,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  if (isError) {
    console.error("useIsSuperAdmin Query Error:", error);
    // If there's an error, we mark as loaded but with no special role to prevent getting stuck
    return { isSuperAdmin: false, isLoaded: true, role: "anonymous", error };
  }

  const role = data?.role ?? (isLoading ? "loading" : "anonymous");

  // If clerk is not loaded, we are definitely loading
  if (!isLoaded) {
    return { isSuperAdmin: false, isLoaded: false, role: "loading" };
  }

  // If user is not logged in, we are loaded and anonymous
  if (!user?.id) {
    return { isSuperAdmin: false, isLoaded: true, role: "anonymous" };
  }

  return {
    isSuperAdmin: role === "super_admin",
    isLoaded: !isLoading,
    role,
    merchant: data?.merchant,
  };
};
