import { ClerkProvider } from "@clerk/clerk-react";
import type { ReactNode } from "react";

type ClerkProviderWrapperProps = {
  children: ReactNode;
};

export const ClerkProviderWrapper = ({
  children,
}: ClerkProviderWrapperProps) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <div className="missing-config">
        <h1>Missing Clerk Key</h1>
        <p>Set VITE_CLERK_PUBLISHABLE_KEY to enable authentication.</p>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
  );
};
