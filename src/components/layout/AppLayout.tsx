import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  UserButton,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

type AppLayoutProps = {
  children: ReactNode;
  showAdminActions?: boolean;
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { t } = useTranslation();
  const { isSuperAdmin, isLoaded } = useIsSuperAdmin();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  // If on landing page, we let the landing page handle its own layout/header
  if (isLanding) {
    return <main className="app-main p-0">{children}</main>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link
          to="/"
          className="brand hover:no-underline flex items-center gap-3"
        >
          <img
            src="/Ralli_Logo.png"
            alt="Ralli Logo"
            className="brand-mark h-8 w-8"
          />
          <div>
            <p className="brand-title text-xl font-bold">{t("appName")}</p>
            <p className="brand-subtitle text-xs text-neutral-400">
              Badminton Stringing Tracker
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
            {isLoaded &&
              isSuperAdmin &&
              location.pathname !== "/super-admin" && (
                <Link
                  to="/super-admin"
                  className="text-sm font-bold text-indigo-400 hover:text-indigo-300"
                >
                  Super Admin
                </Link>
              )}
            {isLoaded &&
              !isSuperAdmin &&
              location.pathname !== "/admin" &&
              location.pathname !== "/" && (
                <Link
                  to="/admin"
                  className="text-sm font-bold text-gray-400 hover:text-white"
                >
                  Dashboard
                </Link>
              )}
            {isLoaded && !isSuperAdmin && location.pathname === "/admin" && (
              <Link
                to="/kiosk"
                className="text-sm font-bold text-gray-400 hover:text-white"
              >
                Kiosk
              </Link>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-bold bg-white text-black px-3 py-1.5 rounded hover:bg-gray-200">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
};
