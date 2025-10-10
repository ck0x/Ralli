"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, LogIn } from "lucide-react";

interface AuthRequiredProps {
  title?: string;
  message?: string;
}

export function AuthRequired({
  title = "Authentication Required",
  message = "Please log in to access this page.",
}: AuthRequiredProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base">{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/auth/login" className="block">
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
              <LogIn className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Go to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
