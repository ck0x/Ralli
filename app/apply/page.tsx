"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugCheckTimeout, setSlugCheckTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    shopSlug: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    businessAddress: "",
    businessType: "",
    hearAbout: "",
    reason: "",
  });

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/auth/profile");
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);

          // Pre-fill form with user data
          setFormData((prev) => ({
            ...prev,
            ownerName: userData.name || "",
            ownerEmail: userData.email || "",
          }));

          // Check if user already has a store
          const storeCheck = await fetch(
            `/api/stores/check?email=${encodeURIComponent(userData.email)}`
          );
          if (storeCheck.ok) {
            const { hasStore, shopSlug } = await storeCheck.json();
            if (hasStore) {
              // Redirect to their dashboard
              toast({
                title: "Welcome back!",
                description: "Redirecting to your dashboard...",
              });
              router.push(`/dashboard/${shopSlug}`);
              return;
            }
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, toast]);

  // Validate shop slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    setCheckingSlug(true);
    try {
      const res = await fetch(
        `/api/stores/check-slug?slug=${encodeURIComponent(slug)}`
      );
      const { available } = await res.json();
      setSlugAvailable(available);
    } catch (error) {
      console.error("Slug check failed:", error);
    } finally {
      setCheckingSlug(false);
    }
  };

  // Generate slug from business name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);
  };

  const handleBusinessNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, businessName: value }));

    // Auto-generate slug if it's empty or matches previous generated slug
    if (
      !formData.shopSlug ||
      formData.shopSlug === generateSlug(formData.businessName)
    ) {
      const newSlug = generateSlug(value);
      setFormData((prev) => ({ ...prev, shopSlug: newSlug }));
      if (newSlug.length >= 3) {
        checkSlugAvailability(newSlug);
      }
    }
  };

  const handleSlugChange = (value: string) => {
    const cleanSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 50);

    setFormData((prev) => ({ ...prev, shopSlug: cleanSlug }));

    // Clear previous timeout
    if (slugCheckTimeout) {
      clearTimeout(slugCheckTimeout);
    }

    // Debounce slug check
    if (cleanSlug.length >= 3) {
      const timer = setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 500);
      setSlugCheckTimeout(timer);
    } else {
      setSlugAvailable(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit your application",
        variant: "destructive",
      });
      return;
    }

    if (!slugAvailable) {
      toast({
        title: "Shop URL not available",
        description: "Please choose a different shop URL",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit application");
      }

      toast({
        title: "Application submitted!",
        description:
          "We'll review your application and get back to you within 24-48 hours.",
      });

      router.push("/apply/success");
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Apply for Ralli</CardTitle>
            <CardDescription>
              Sign in with Google to start your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/auth/login?returnTo=/apply">
              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </a>
            <p className="text-sm text-gray-600 text-center mt-4">
              We use Google Sign-In to verify your identity and pre-fill your
              application.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-emerald-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Apply to Join Ralli
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your business and we'll review your application within
            24-48 hours
          </p>
        </div>

        {/* User Info Card */}
        <Card className="mb-8 border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-4 p-4">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">
                Signed in as {user.name}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Application Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                All fields marked with * are required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Business Name *
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleBusinessNameChange(e.target.value)}
                  placeholder="Ace Tennis Pro Shop"
                  required
                />
              </div>

              {/* Shop URL */}
              <div className="space-y-2">
                <Label htmlFor="shopSlug">
                  <Store className="w-4 h-4 inline mr-2" />
                  Shop URL *
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">ralli.com/</span>
                  <Input
                    id="shopSlug"
                    value={formData.shopSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="ace-tennis-pro"
                    className="flex-1"
                    required
                  />
                  {checkingSlug && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {slugAvailable === true && (
                    <span className="text-emerald-600 text-sm">
                      ✓ Available
                    </span>
                  )}
                  {slugAvailable === false && (
                    <span className="text-red-600 text-sm">✗ Taken</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  This will be your kiosk URL. Use lowercase letters, numbers,
                  and dashes only.
                </p>
              </div>

              {/* Owner Name */}
              <div className="space-y-2">
                <Label htmlFor="ownerName">
                  <User className="w-4 h-4 inline mr-2" />
                  Owner Name *
                </Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownerName: e.target.value,
                    }))
                  }
                  required
                  disabled
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ownerEmail: e.target.value,
                    }))
                  }
                  required
                  disabled
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              {/* Business Address */}
              <div className="space-y-2">
                <Label htmlFor="businessAddress">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Business Address
                </Label>
                <Textarea
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessAddress: e.target.value,
                    }))
                  }
                  placeholder="123 Main St, City, State 12345"
                  rows={2}
                />
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, businessType: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="badminton-club">
                      Badminton Club
                    </SelectItem>
                    <SelectItem value="tennis-club">Tennis Club</SelectItem>
                    <SelectItem value="sports-shop">Sports Shop</SelectItem>
                    <SelectItem value="pro-shop">Pro Shop</SelectItem>
                    <SelectItem value="racquet-specialist">
                      Racquet Specialist
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* How did you hear about us */}
              <div className="space-y-2">
                <Label htmlFor="hearAbout">How did you hear about Ralli?</Label>
                <Input
                  id="hearAbout"
                  value={formData.hearAbout}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      hearAbout: e.target.value,
                    }))
                  }
                  placeholder="Google search, friend, social media, etc."
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Why do you want to use Ralli? *
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Tell us about your stringing business and how Ralli can help..."
                  rows={4}
                  required
                />
              </div>

              {/* Info Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We review all applications manually to ensure quality. You'll
                  receive an email within 24-48 hours with next steps.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                disabled={submitting || !slugAvailable}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
