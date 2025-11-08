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
  Mail,
  User,
  Phone,
  Clock,
  ArrowRight,
  Repeat,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface StoreData {
  id: number;
  name: string;
  shop_slug: string;
}

interface CustomerData {
  id: number;
  name: string;
  phone: string;
  email: string;
  memberSince: string;
}

interface RecentOrder {
  id: number;
  racketBrand: string;
  racketModel: string;
  stringType: string | null;
  serviceType: string;
  notes: string | null;
  date: string;
}

type FormStep = "email" | "customer-type" | "details" | "review";

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

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState<FormStep>("email");
  const [email, setEmail] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store || !email.trim()) return;

    setIsCheckingEmail(true);

    try {
      const res = await fetch(
        `/api/customers/lookup?email=${encodeURIComponent(
          email.trim()
        )}&storeId=${store.id}`
      );

      if (!res.ok) throw new Error("Failed to lookup customer");

      const data = await res.json();

      if (data.exists && data.customer) {
        // Returning customer
        setIsReturningCustomer(true);
        setCustomerData(data.customer);
        setRecentOrders(data.recentOrders || []);
        setFormData((prev) => ({
          ...prev,
          email: data.customer.email,
          customerName: data.customer.name,
          contactNumber: data.customer.phone,
        }));
        setCurrentStep("customer-type");
      } else {
        // New customer
        setIsReturningCustomer(false);
        setCustomerData(null);
        setRecentOrders([]);
        setFormData((prev) => ({
          ...prev,
          email: email.trim(),
        }));
        setCurrentStep("details");
      }
    } catch (error) {
      console.error("Email lookup error:", error);
      alert("Failed to lookup customer. Please try again.");
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSelectPreviousOrder = (order: RecentOrder) => {
    setFormData((prev) => ({
      ...prev,
      racketBrand: order.racketBrand || "",
      racketModel: order.racketModel || "",
      stringType: order.stringType || "",
      serviceType: order.serviceType || "standard",
      additionalNotes: order.notes || "",
    }));
    setCurrentStep("details");
  };

  const handleNewOrder = () => {
    setCurrentStep("details");
  };

  const resetForm = () => {
    setCurrentStep("email");
    setEmail("");
    setCustomerData(null);
    setRecentOrders([]);
    setIsReturningCustomer(false);
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
    setOrderNumber(null);
    setShowSuccess(false);
  };

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
        resetForm();
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
            {currentStep === "email" && "Enter your email to get started"}
            {currentStep === "customer-type" &&
              `Welcome back, ${customerData?.name}!`}
            {currentStep === "details" && "Tell us about your racket"}
            {currentStep === "review" && "Review your order"}
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep !== "email" && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  currentStep === "customer-type" ||
                  currentStep === "details" ||
                  currentStep === "review"
                    ? "bg-emerald-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`w-3 h-3 rounded-full ${
                  currentStep === "details" || currentStep === "review"
                    ? "bg-emerald-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`w-3 h-3 rounded-full ${
                  currentStep === "review" ? "bg-emerald-600" : "bg-gray-300"
                }`}
              />
            </div>
          </div>
        )}

        {/* Step 1: Email Identification */}
        {currentStep === "email" && (
          <form onSubmit={handleEmailSubmit} className="animate-fade-in-scale">
            <Card className="shadow-2xl">
              <CardContent className="p-12 space-y-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Let's get started
                  </h2>
                  <p className="text-gray-600">
                    We'll use your email to notify you when your racket is ready
                  </p>
                </div>

                <div className="space-y-4">
                  <Label
                    htmlFor="email-input"
                    className="text-xl font-semibold"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-16 text-2xl text-center"
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-16 text-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                  disabled={isCheckingEmail}
                >
                  {isCheckingEmail ? (
                    <>
                      <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-6 w-6 ml-3" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 2: Returning Customer - Show Previous Orders */}
        {currentStep === "customer-type" && isReturningCustomer && (
          <Card className="shadow-2xl animate-fade-in-scale">
            <CardContent className="p-12 space-y-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {customerData?.name}!
                </h2>
                <p className="text-gray-600">
                  Member since{" "}
                  {new Date(
                    customerData?.memberSince || ""
                  ).toLocaleDateString()}
                </p>
              </div>

              {recentOrders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Your Recent Orders
                  </h3>
                  <div className="grid gap-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleSelectPreviousOrder(order)}
                        className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Repeat className="h-5 w-5 text-emerald-600" />
                              <span className="font-semibold text-lg">
                                {order.racketBrand} {order.racketModel}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              {order.stringType && (
                                <p>String: {order.stringType}</p>
                              )}
                              <p>Service: {order.serviceType}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(order.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="group-hover:bg-emerald-600 group-hover:text-white"
                          >
                            Repeat Order
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleNewOrder}
                size="lg"
                variant="outline"
                className="w-full h-16 text-xl border-2"
              >
                Start a New Order
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Racket & Service Details */}
        {currentStep === "details" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentStep("review");
            }}
            className="animate-fade-in-scale"
          >
            <Card className="shadow-2xl">
              <CardContent className="p-8 space-y-8">
                {/* Customer Info (only for new customers) */}
                {!isReturningCustomer && (
                  <>
                    <div className="space-y-3">
                      <Label
                        htmlFor="customerName"
                        className="text-xl font-semibold"
                      >
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
                  </>
                )}

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

                <div className="space-y-3">
                  <Label
                    htmlFor="serviceType"
                    className="text-xl font-semibold"
                  >
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

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentStep(
                        isReturningCustomer ? "customer-type" : "email"
                      )
                    }
                    size="lg"
                    variant="outline"
                    className="flex-1 h-16 text-xl"
                  >
                    <ArrowLeft className="h-6 w-6 mr-3" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-16 text-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                  >
                    Review Order
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === "review" && (
          <form onSubmit={handleSubmit} className="animate-fade-in-scale">
            <Card className="shadow-2xl">
              <CardContent className="p-12 space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Review Your Order
                  </h2>
                  <p className="text-gray-600">
                    Please confirm your details before submitting
                  </p>
                </div>

                <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer</p>
                    <p className="text-xl font-semibold">
                      {formData.customerName}
                    </p>
                    <p className="text-gray-600">{formData.contactNumber}</p>
                    <p className="text-gray-600">{formData.email}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 mb-1">Racket</p>
                    <p className="text-xl font-semibold">
                      {formData.racketBrand} {formData.racketModel}
                    </p>
                    {formData.stringType && (
                      <p className="text-gray-600">
                        String: {formData.stringType}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500 mb-1">Service</p>
                    <p className="text-xl font-semibold capitalize">
                      {formData.serviceType}
                    </p>
                    {formData.additionalNotes && (
                      <p className="text-gray-600 mt-2">
                        {formData.additionalNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("details")}
                    size="lg"
                    variant="outline"
                    className="flex-1 h-16 text-xl"
                  >
                    <ArrowLeft className="h-6 w-6 mr-3" />
                    Edit
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-16 text-xl bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6 mr-3" />
                        Submit Order
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}
