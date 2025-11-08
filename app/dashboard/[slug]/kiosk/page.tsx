"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  X,
  CheckCircle,
  Loader2,
  Store,
  ArrowLeft,
  Monitor,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StoreData {
  id: number;
  name: string;
  shop_slug: string;
}

export default function KioskMode() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [exitAttempts, setExitAttempts] = useState(0);

  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    racketBrand: "",
    racketModel: "",
    stringType: "",
    serviceType: "standard",
    additionalNotes: "",
  });

  useEffect(() => {
    const loadStore = async () => {
      try {
        const storeRes = await fetch(`/api/stores/by-slug/${slug}`);
        if (!storeRes.ok) throw new Error("Failed to load store");
        const storeData = await storeRes.json();
        setStore(storeData);
      } catch (error) {
        console.error("Store load error:", error);
        router.push(`/dashboard/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    loadStore();

    // Request fullscreen
    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err) => {
          console.log("Fullscreen request failed:", err);
        });
      }
    };

    // Small delay to avoid issues
    setTimeout(enterFullscreen, 100);

    return () => {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create order");
      }

      const { data } = await res.json();
      setOrderNumber(data.id);
      setShowSuccess(true);

      // Reset form after showing success
      setTimeout(() => {
        setFormData({
          customerName: "",
          contactNumber: "",
          email: "",
          racketBrand: "",
          racketModel: "",
          stringType: "",
          serviceType: "standard",
          additionalNotes: "",
        });
        setShowSuccess(false);
        setOrderNumber(null);
      }, 5000);
    } catch (error: any) {
      console.error("Order creation error:", error);
      alert(
        error.message || "Failed to create order. Please ask staff for help."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitKiosk = () => {
    setExitAttempts((prev) => prev + 1);

    if (exitAttempts >= 2) {
      // Third click - exit
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      router.push(`/dashboard/${slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 p-8">
        <Card className="max-w-2xl w-full text-center shadow-2xl">
          <CardContent className="p-12">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-16 w-16 text-emerald-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Order Received!
            </h1>
            <p className="text-2xl text-gray-600 mb-8">Your order number is</p>
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl p-8 mb-8">
              <p className="text-6xl font-bold">#{orderNumber}</p>
            </div>
            <p className="text-lg text-gray-600">
              Please keep this number for reference.
              <br />
              We'll notify you when your racket is ready!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Exit Button (Hidden - Triple click to exit) */}
      <button
        onClick={handleExitKiosk}
        className="fixed top-4 left-4 z-50 p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all"
        title={`Click ${3 - exitAttempts} more time(s) to exit kiosk mode`}
      >
        <Monitor className="h-5 w-5 text-gray-600" />
      </button>

      <div className="max-w-4xl mx-auto p-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Store className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {store?.name}
          </h1>
          <p className="text-2xl text-gray-600">Racket Stringing Service</p>
          <p className="text-lg text-gray-500 mt-2">
            Please fill in your details below
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-2xl">
            <CardContent className="p-8 space-y-8">
              {/* Customer Name */}
              <div className="space-y-3">
                <Label htmlFor="customerName" className="text-xl font-semibold">
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                  className="h-14 text-lg"
                  required
                  autoFocus
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="contactNumber"
                    className="text-xl font-semibold"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        contactNumber: e.target.value,
                      }))
                    }
                    placeholder="(555) 123-4567"
                    className="h-14 text-lg"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-xl font-semibold">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="john@example.com"
                    className="h-14 text-lg"
                  />
                </div>
              </div>

              {/* Racket Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="racketBrand"
                    className="text-xl font-semibold"
                  >
                    Racket Brand <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="racketBrand"
                    value={formData.racketBrand}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        racketBrand: e.target.value,
                      }))
                    }
                    placeholder="Yonex, Victor, Li-Ning"
                    className="h-14 text-lg"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="racketModel"
                    className="text-xl font-semibold"
                  >
                    Racket Model <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="racketModel"
                    value={formData.racketModel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        racketModel: e.target.value,
                      }))
                    }
                    placeholder="Astrox 99, Thruster K"
                    className="h-14 text-lg"
                    required
                  />
                </div>
              </div>

              {/* String Type */}
              <div className="space-y-3">
                <Label htmlFor="stringType" className="text-xl font-semibold">
                  String Type (Optional)
                </Label>
                <Input
                  id="stringType"
                  value={formData.stringType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      stringType: e.target.value,
                    }))
                  }
                  placeholder="BG80, Aerobite, NBG95"
                  className="h-14 text-lg"
                />
              </div>

              {/* Service Type */}
              <div className="space-y-3">
                <Label htmlFor="serviceType" className="text-xl font-semibold">
                  Service Type
                </Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, serviceType: value }))
                  }
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard" className="text-lg py-3">
                      Standard Stringing
                    </SelectItem>
                    <SelectItem value="express" className="text-lg py-3">
                      Express Service
                    </SelectItem>
                    <SelectItem value="restring" className="text-lg py-3">
                      Restring
                    </SelectItem>
                    <SelectItem value="repair" className="text-lg py-3">
                      Repair
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Notes */}
              <div className="space-y-3">
                <Label
                  htmlFor="additionalNotes"
                  className="text-xl font-semibold"
                >
                  Special Requests (Optional)
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalNotes: e.target.value,
                    }))
                  }
                  placeholder="Tension preferences, special instructions..."
                  className="text-lg min-h-24"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-16 text-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                    Submitting Order...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-6 w-6 mr-3" />
                    Submit Order
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
