"use client";

import { Tablet, LineChart, Bell, Zap, Shield, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Tablet,
    title: "Kiosk Mode",
    description:
      "Turn any tablet into a customer intake station. Large touch-friendly interface perfect for in-store use.",
    color: "emerald",
  },
  {
    icon: LineChart,
    title: "Order Tracking",
    description:
      "See all orders at a glance. Update status with one tap. Filter by pending, in-progress, or completed.",
    color: "blue",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Get email alerts for new orders. Optional SMS notifications to keep customers updated (coming soon).",
    color: "purple",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Built for speed. Submit orders in seconds. No complicated workflows or unnecessary features.",
    color: "yellow",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your data is protected with enterprise-grade security. Each store's data is completely isolated.",
    color: "red",
  },
  {
    icon: Users,
    title: "Multi-User Support",
    description:
      "Add staff members to help manage orders. Set different permission levels for owners, managers, and staff.",
    color: "indigo",
  },
];

const colorClasses: Record<string, { bg: string; text: string; icon: string }> =
  {
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      icon: "text-emerald-600",
    },
    blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-600" },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      icon: "text-purple-600",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      icon: "text-yellow-600",
    },
    red: { bg: "bg-red-50", text: "text-red-600", icon: "text-red-600" },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      icon: "text-indigo-600",
    },
  };

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
            Everything you need to run your shop
          </h2>
          <p className="text-xl text-gray-600">
            Purpose-built for racquet stringing businesses. No bloat, just the
            features that matter.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = colorClasses[feature.color];

            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-200 cursor-pointer"
              >
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
