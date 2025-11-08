import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { Auth0Provider } from "@auth0/nextjs-auth0";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ralli - Modern Racquet Stringing Management",
  description:
    "Streamline your racquet stringing business with Ralli. Kiosk intake forms, order tracking, and customer management for badminton and tennis shops.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <LayoutWrapper>{children}</LayoutWrapper>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
