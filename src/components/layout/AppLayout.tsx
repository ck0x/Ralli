import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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

export const AppLayout = ({ children, showAdminActions }: AppLayoutProps) => {
  const { t } = useTranslation();
  const { isSuperAdmin } = useIsSuperAdmin();
  const clerkEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">🏸</div>
          <div>
            <p className="brand-title">{t("appName")}</p>
            <p className="brand-subtitle">Badminton Stringing Tracker</p>
          </div>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
          {showAdminActions && clerkEnabled ? (
            <div className="auth-actions">
              <SignedIn>
                {isSuperAdmin ? (
                  <a
                    href="/admin"
                    className="btn secondary small"
                    style={{ marginRight: "1rem" }}
                  >
                    {t("adminTitle")}
                  </a>
                ) : (
                  <a
                    href="/admin"
                    className="btn secondary small"
                    style={{ marginRight: "1rem" }}
                  >
                    {"Orders"}
                  </a>
                )}
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="btn secondary">
                    {t("actions.signIn")}
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          ) : null}
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
};
