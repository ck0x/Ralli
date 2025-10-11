"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList, Store, Users, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  pendingApplications: number;
  activeStores: number;
  totalUsers: number;
  recentActivity: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingApplications: 0,
    activeStores: 0,
    totalUsers: 0,
    recentActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      icon: ClipboardList,
      description: "Applications awaiting review",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      href: "/admin/applications",
    },
    {
      title: "Active Stores",
      value: stats.activeStores,
      icon: Store,
      description: "Currently operating stores",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/admin/stores",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Store owners and staff",
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/stores",
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity,
      icon: Activity,
      description: "Actions in last 24 hours",
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/admin/activity",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the Ralli admin panel. Manage applications, stores, and
          users.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {loading ? "-" : stat.value}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`${stat.bg} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/applications">
            <Button variant="outline" className="w-full justify-start">
              <ClipboardList className="mr-2 h-4 w-4" />
              Review Applications
            </Button>
          </Link>
          <Link href="/admin/stores">
            <Button variant="outline" className="w-full justify-start">
              <Store className="mr-2 h-4 w-4" />
              Manage Stores
            </Button>
          </Link>
          <Link href="/admin/activity">
            <Button variant="outline" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              View Activity Log
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Applications Preview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>
            Latest business applications submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>View detailed applications in the Applications section</p>
            <Link href="/admin/applications">
              <Button className="mt-4">Go to Applications</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
