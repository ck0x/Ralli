"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Free (Beta)",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Unlimited orders",
      "1 kiosk location",
      "2 staff members",
      "Email notifications",
      "Order tracking dashboard",
      "Customer database",
      "Priority support",
    ],
    cta: "Get Started Free",
    highlighted: true,
  },
  {
    name: "Pro (Coming Soon)",
    price: "$29",
    description: "For growing businesses",
    features: [
      "Everything in Free",
      "Multiple locations",
      "Unlimited staff",
      "SMS notifications",
      "Custom branding",
      "Advanced analytics",
      "API access",
      "White-label option",
    ],
    cta: "Join Waitlist",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600">
            Start free during our beta period. No credit card required.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.highlighted
                  ? "border-2 border-emerald-600 shadow-xl scale-105"
                  : "border-2 border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-4 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6 pb-8">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/apply" className="block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Questions about pricing?{" "}
            <Link
              href="/contact"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
