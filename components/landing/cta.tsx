"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function CTA() {
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
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-white">
            Ready to modernize your stringing business?
          </h2>
          <p className="text-xl text-emerald-50">
            Join racquet shops across the country using Ralli to streamline
            their operations. Get started in minutes, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!loading && userStore?.hasStore && userStore.shopSlug ? (
              <Link href={`/dashboard/${userStore.shopSlug}`}>
                <Button
                  size="lg"
                  className="group bg-white text-emerald-600 hover:bg-gray-50 px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link href="/apply">
                <Button
                  size="lg"
                  className="group bg-white text-emerald-600 hover:bg-gray-50 px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-full"
              >
                Schedule a Demo
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-emerald-50 text-sm pt-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Free during beta</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
