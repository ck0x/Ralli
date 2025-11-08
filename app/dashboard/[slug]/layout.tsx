"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Users,
  BarChart3,
  Store,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StoreData {
  id: number;
  name: string;
  shop_slug: string;
  owner_email: string;
  owner_name: string;
  is_active: boolean;
}

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const slug = params.slug as string;

  const [store, setStore] = useState<StoreData | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get user profile
        const userRes = await fetch("/auth/profile");
        if (!userRes.ok) {
          router.push("/auth/login?returnTo=" + pathname);
          return;
        }
        const userData = await userRes.json();
        setUser(userData);

        // Check store access
        const storeCheck = await fetch(
          `/api/stores/check?email=${encodeURIComponent(userData.email)}`
        );
        if (!storeCheck.ok) throw new Error("Failed to check store access");

        const { hasStore, shopSlug } = await storeCheck.json();

        if (!hasStore || shopSlug !== slug) {
          router.push("/");
          return;
        }

        // Get store details
        const storeRes = await fetch(`/api/stores/by-slug/${slug}`);
        if (!storeRes.ok) throw new Error("Failed to load store");

        const storeData = await storeRes.json();
        setStore(storeData);
      } catch (error) {
        console.error("Dashboard load error:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, router, pathname]);

  const navItems = [
    {
      name: "Overview",
      href: `/dashboard/${slug}`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Orders",
      href: `/dashboard/${slug}/orders`,
      icon: ClipboardList,
    },
    {
      name: "Customers",
      href: `/dashboard/${slug}/customers`,
      icon: Users,
    },
    {
      name: "Analytics",
      href: `/dashboard/${slug}/analytics`,
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: `/dashboard/${slug}/settings`,
      icon: Settings,
    },
  ];

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname?.startsWith(item.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Store Name */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                {sidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {store.name}
                  </h1>
                  <p className="text-xs text-gray-500">
                    ralli.com/{store.shop_slug}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Visit Site
              </Link>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <a href="/auth/logout">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`
          fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
          w-64 bg-white border-r border-gray-200
          transition-transform duration-200 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-150
                    ${
                      active
                        ? "bg-emerald-50 text-emerald-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
