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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function NewOrderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [storeId, setStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        const store = await storeRes.json();
        setStoreId(store.id);
      } catch (error) {
        console.error("Store load error:", error);
        router.push(`/dashboard/${slug}`);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          ...formData,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create order");
      }

      const { data } = await res.json();
      router.push(`/dashboard/${slug}/orders/${data.id}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      alert(error.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/${slug}/orders`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Order</h1>
        <p className="text-gray-600 mt-1">Create a new racket stringing order</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Enter the customer's contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">
                    Customer Name <span className="text-red-500">*</span>
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
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">
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
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Racket Information */}
            <Card>
              <CardHeader>
                <CardTitle>Racket Information</CardTitle>
                <CardDescription>
                  Specify the racket details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="racketBrand">
                      Brand <span className="text-red-500">*</span>
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
                      placeholder="Yonex, Victor, Li-Ning, etc."
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="racketModel">
                      Model <span className="text-red-500">*</span>
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
                      placeholder="Astrox 99, Thruster K, etc."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stringType">String Type (Optional)</Label>
                  <Input
                    id="stringType"
                    value={formData.stringType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stringType: e.target.value,
                      }))
                    }
                    placeholder="BG80, Aerobite, NBG95, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>
                  Specify the service type and any additional notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, serviceType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Standard Stringing
                      </SelectItem>
                      <SelectItem value="express">Express Service</SelectItem>
                      <SelectItem value="restring">Restring</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">
                    Additional Notes (Optional)
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
                    placeholder="Tension preferences, special requests, etc."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  {formData.customerName && (
                    <div>
                      <div className="text-gray-600">Customer</div>
                      <div className="font-medium">{formData.customerName}</div>
                    </div>
                  )}

                  {formData.contactNumber && (
                    <div>
                      <div className="text-gray-600">Phone</div>
                      <div className="font-medium">{formData.contactNumber}</div>
                    </div>
                  )}

                  {(formData.racketBrand || formData.racketModel) && (
                    <div>
                      <div className="text-gray-600">Racket</div>
                      <div className="font-medium">
                        {formData.racketBrand} {formData.racketModel}
                      </div>
                    </div>
                  )}

                  {formData.stringType && (
                    <div>
                      <div className="text-gray-600">String</div>
                      <div className="font-medium">{formData.stringType}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-gray-600">Service</div>
                    <div className="font-medium capitalize">
                      {formData.serviceType}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
