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
      <div className="flex items-center justify-center min-h-screen w-full bg-slate-50">
        <div className="flex flex-col items-center gap-4 max-w-sm px-6 py-8 bg-white rounded-2xl shadow-xl border border-slate-100">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-xl italic">R</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              Loading Ralli...
            </h2>
            <p className="text-slate-500 text-sm">
              Checking your access profile
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 w-full">
            <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium">
              Session Diagnostics
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
              <div className="px-2 py-1 bg-slate-50 rounded">
                Auth:{" "}
                <span className="font-semibold text-slate-700">
                  {isLoaded ? "Ready" : "Wait..."}
                </span>
              </div>
              <div className="px-2 py-1 bg-slate-50 rounded text-center">
                Role:{" "}
                <span className="font-semibold text-slate-700 font-mono">
                  {isRoleLoaded ? role : "Checking..."}
                </span>
              </div>
            </div>
          </div>
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
