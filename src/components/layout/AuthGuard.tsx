import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

type AuthGuardProps = {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
};

export const AuthGuard = ({ children, requireSuperAdmin }: AuthGuardProps) => {
  const { isLoaded, isSignedIn } = useUser();
  const { role, isLoaded: isRoleLoaded, merchant } = useIsSuperAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded || !isRoleLoaded) return;

    if (!isSignedIn) {
      navigate("/");
      return;
    }

    // Logic routing based on role
    if (!requireSuperAdmin) {
      if (role === "none") {
        navigate("/onboarding");
      } else if (role === "merchant" && merchant?.status !== "approved") {
        navigate("/pending");
      } else if (role === "merchant" && merchant?.status === "approved") {
        // Good to go
      }
    }

    if (requireSuperAdmin && role !== "super_admin") {
      navigate("/"); // Or some unauthorized page
    }
  }, [
    isLoaded,
    isRoleLoaded,
    isSignedIn,
    role,
    merchant,
    navigate,
    requireSuperAdmin,
    location.pathname,
  ]);

  if (!isLoaded || !isRoleLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 w-4 bg-indigo-600 rounded-full mb-2 animate-bounce"></div>
          <p className="text-sm font-medium text-neutral-500">
            Loading Ralli...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null; // Will redirect

  // If we're here, we passed checks?
  // Wait, the useEffect handles navigation, but we might render children briefly.
  // Ideally we return null if the conditions aren't met yet.

  if (role === "none") return null;
  if (role === "merchant" && merchant?.status !== "approved") return null;
  if (requireSuperAdmin && role !== "super_admin") return null;

  return <>{children}</>;
};
