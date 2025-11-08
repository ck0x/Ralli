"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function Hero() {
  const [userStore, setUserStore] = useState<{
    hasStore: boolean;
    shopSlug: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStore = async () => {
      try {
        const res = await fetch("/auth/profile");
        if (res.ok) {
          const userData = await res.json();
          // Check if user has a store
          const storeCheck = await fetch(
            `/api/stores/check?email=${encodeURIComponent(userData.email)}`
          );
          if (storeCheck.ok) {
            const storeData = await storeCheck.json();
            setUserStore(storeData);
          }
        }
      } catch (error) {
        console.error("Failed to check user store:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserStore();
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-blue-600/5" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-40 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by racquet stringing shops across the country</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Streamline Your
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  {" "}
                  Racquet Stringing{" "}
                </span>
                Business
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                The modern order management system for badminton and tennis
                stringing shops. Take orders on a tablet, track status, and
                delight your customers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!loading && userStore?.hasStore && userStore.shopSlug ? (
                <Link href={`/dashboard/${userStore.shopSlug}`}>
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link href="/apply">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="group border-2 border-gray-300 hover:border-emerald-600 px-8 py-3 rounded-full transition-all duration-300"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span>Free during beta</span>
              </div>
            </div>
          </div>

          {/* Right column - Visual/Demo */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white p-8">
              {/* Mock interface */}
              <div className="space-y-4">
                <div className="h-4 bg-gradient-to-r from-emerald-600 to-blue-600 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-4/6" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-24 bg-emerald-50 rounded-lg border-2 border-emerald-200" />
                  <div className="h-24 bg-blue-50 rounded-lg border-2 border-blue-200" />
                </div>
                <div className="h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg" />
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="text-3xl font-bold text-emerald-600">24</div>
              <div className="text-xs text-gray-600">Orders Today</div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-1000">
              <div className="text-3xl font-bold text-blue-600">4.9★</div>
              <div className="text-xs text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
