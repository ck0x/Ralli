"use client";

import { ArrowRight, ClipboardList, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-blue-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Track Your
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                    {" "}
                    Racquet Stringing{" "}
                  </span>
                  Workflow
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  A lightweight kiosk intake form and order dashboard for
                  badminton racquet stringing. Collect orders in-store and
                  update their status in seconds.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/form">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Start taking orders
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button
                    variant="outline"
                    size="lg"
                    className="group border-2 border-gray-300 hover:border-emerald-600 px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    View Orders
                    <ClipboardList className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative animate-fade-in-right">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-3xl blur-3xl opacity-20 animate-pulse" />
              <img
                src="/images/IMG_8916.jpg?height=1000&width=1000"
                alt="Professional badminton player"
                className="relative z-10 w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 lg:py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ClipboardList,
                title: "Fast Intake",
                description:
                  "Large-format kiosk form optimized for in-store iPad collection of customer & racket details.",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: Zap,
                title: "Zero Setup",
                description:
                  "This service is offered as a web application, meaning no installation or manual labour required",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: CheckCircle2,
                title: "Simple Statuses",
                description:
                  "Move orders from Pending → In Progress → Ready → Picked Up with one click.",
                color: "from-purple-500 to-purple-600",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <h2 className="text-3xl font-bold">Designed for any Pro Shop</h2>
          <p className="text-emerald-100 text-lg max-w-3xl mx-auto">
            Simply open the website on your device, and it's ready to go!
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Ready to Log Your First Order?
          </h2>
          <p className="text-xl text-gray-600">
            Open the kiosk form and start tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/form">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                New Order
              </Button>
            </Link>
            <Link href="/orders">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-emerald-600 px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
              >
                View Orders
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
