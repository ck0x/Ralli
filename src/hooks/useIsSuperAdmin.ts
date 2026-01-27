import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { checkAdminRole } from "@/lib/api";

export const useIsSuperAdmin = () => {
  const { user, isLoaded } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["adminRole", user?.id],
    queryFn: () => checkAdminRole(user?.id),
    enabled: isLoaded && !!user?.id,
  });

  const role = data?.role ?? (isLoading ? "loading" : "anonymous");

  return {
    isSuperAdmin: role === "super_admin",
    isLoaded: isLoaded && !isLoading,
    role,
    merchant: data?.merchant,
  };
};
