"use client";

import { CheckCircle, Home, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl">Application Submitted!</CardTitle>
          <CardDescription className="text-base">
            Thank you for applying to join Ralli. We're excited to learn more about your business.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 ml-6 list-disc">
              <li>We'll review your application within 24-48 hours</li>
              <li>You'll receive an email with our decision</li>
              <li>If approved, you'll get your unique shop URL and dashboard access</li>
              <li>We'll send onboarding instructions to help you get started</li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">In the meantime...</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✓ Check your email (including spam folder) for updates</p>
              <p>✓ Prepare a tablet or device for your kiosk</p>
              <p>✓ Think about which staff members you'd like to invite</p>
              <p>✓ Consider your store's branding (colors, logo)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700" size="lg">
                Have Questions?
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-gray-600">
            Need to update your application? Contact us at{" "}
            <a href="mailto:support@ralli.com" className="text-emerald-600 hover:underline">
              support@ralli.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
