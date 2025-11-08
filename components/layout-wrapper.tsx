"use client";

import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isKioskMode = pathname?.includes("/kiosk");

  return (
    <main className={isKioskMode ? "" : "pt-16"}>
      {children}
    </main>
  );
}
