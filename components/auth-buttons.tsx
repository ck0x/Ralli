"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";

interface AuthButtonsProps {
  user: any;
  isMobile?: boolean;
}

export function AuthButtons({ user, isMobile = false }: AuthButtonsProps) {
  if (user) {
    return (
      <div className={isMobile ? "space-y-2" : "flex items-center space-x-4"}>
        <div
          className={
            isMobile
              ? "flex items-center space-x-2 text-sm text-gray-600 mb-2"
              : "hidden md:flex items-center space-x-2 text-sm text-gray-600"
          }
        >
          <User className="h-4 w-4" />
          <span>{user.name || user.email}</span>
        </div>
        <Link href="/auth/logout">
          <Button
            variant="outline"
            className={`border-2 border-gray-300 hover:border-red-600 hover:text-red-600 rounded-full transition-all duration-300 ${
              isMobile ? "w-full" : ""
            }`}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <Link href="/auth/login" className={isMobile ? "block" : ""}>
      <Button
        className={`bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-full px-6 transition-all duration-300 transform hover:scale-105 ${
          isMobile ? "w-full" : ""
        }`}
      >
        <LogIn className="h-4 w-4 mr-2" />
        Login
      </Button>
    </Link>
  );
}
