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
  Zap,
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

type FormStep =
  | "email"
  | "customer-type"
  | "customer-info"
  | "racket-details"
  | "string-service"
  | "review";

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
    tension: "",
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
        setCurrentStep("customer-info");
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
    setCurrentStep("racket-details");
  };

  const handleNewOrder = () => {
    setCurrentStep("racket-details");
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
      tension: "",
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 p-4">
        <Card className="max-w-xl w-full text-center shadow-2xl">
          <CardContent className="p-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Order Received!
            </h1>
            <p className="text-xl text-gray-600 mb-6">Your order number is</p>
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-2xl p-6 mb-6">
              <p className="text-5xl font-bold">#{orderNumber}</p>
            </div>
            <p className="text-base text-gray-600">
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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 flex flex-col items-center justify-center p-4">
      {/* Exit Button (Hidden - Triple click to exit) */}
      <button
        onClick={handleExitKiosk}
        className="fixed top-4 left-4 z-50 p-3 bg-white/50 hover:bg-white/80 rounded-lg transition-all"
        title={`Click ${3 - exitAttempts} more time(s) to exit kiosk mode`}
      >
        <Monitor className="h-5 w-5 text-gray-600" />
      </button>

      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {store?.name}
          </h1>
          <p className="text-xl text-gray-600">Racket Stringing Service</p>
          <p className="text-base text-gray-500 mt-1">
            {currentStep === "email" && "Enter your email to get started"}
            {currentStep === "customer-type" &&
              `Welcome back, ${customerData?.name}!`}
            {currentStep === "customer-info" && "Tell us about yourself"}
            {currentStep === "racket-details" && "Tell us about your racket"}
            {currentStep === "string-service" &&
              "Choose your string and service"}
            {currentStep === "review" && "Review your order"}
          </p>
        </div>

        {/* Progress Indicator */}
        {currentStep !== "email" && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  currentStep === "customer-type" ||
                  currentStep === "customer-info" ||
                  currentStep === "racket-details" ||
                  currentStep === "string-service" ||
                  currentStep === "review"
                    ? "bg-emerald-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  currentStep === "customer-info" ||
                  currentStep === "racket-details" ||
                  currentStep === "string-service" ||
                  currentStep === "review"
                    ? "bg-emerald-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  currentStep === "racket-details" ||
                  currentStep === "string-service" ||
                  currentStep === "review"
                    ? "bg-emerald-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  currentStep === "string-service" || currentStep === "review"
                    ? "bg-emerald-600"
                    : "bg-gray-300"
                }`}
              />
              <div
                className={`w-2.5 h-2.5 rounded-full ${
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
              <CardContent className="p-8 space-y-6">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-7 w-7 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Let's get started
                  </h2>
                  <p className="text-gray-600 text-sm">
                    We'll use your email to notify you when your racket is ready
                  </p>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="email-input"
                    className="text-lg font-semibold"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-14 text-xl text-center"
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                  disabled={isCheckingEmail}
                >
                  {isCheckingEmail ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 2: Returning Customer - Show Previous Orders */}
        {currentStep === "customer-type" && isReturningCustomer && (
          <Card className="shadow-2xl animate-fade-in-scale max-h-[calc(100vh-200px)] overflow-y-auto">
            <CardContent className="p-8 space-y-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {customerData?.name}!
                </h2>
                <p className="text-gray-600 text-sm">
                  Member since{" "}
                  {new Date(
                    customerData?.memberSince || ""
                  ).toLocaleDateString()}
                </p>
              </div>

              {recentOrders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Your Recent Orders
                  </h3>
                  <div className="grid gap-3">
                    {recentOrders.slice(0, 2).map((order) => (
                      <button
                        key={order.id}
                        onClick={() => handleSelectPreviousOrder(order)}
                        className="p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Repeat className="h-4 w-4 text-emerald-600" />
                              <span className="font-semibold text-base">
                                {order.racketBrand} {order.racketModel}
                              </span>
                            </div>
                            <div className="space-y-0.5 text-xs text-gray-600">
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
                            className="group-hover:bg-emerald-600 group-hover:text-white text-xs"
                          >
                            Repeat
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
                className="w-full h-14 text-lg border-2"
              >
                Start a New Order
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3a: Customer Information (New Customers Only) */}
        {currentStep === "customer-info" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formData.customerName || !formData.contactNumber) return;
              setCurrentStep("racket-details");
            }}
            className="animate-fade-in-scale"
          >
            <Card className="shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Customer Information
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="customerName"
                      className="text-base font-medium"
                    >
                      Name <span className="text-red-500">*</span>
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
                      className="h-12 text-base"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactNumber"
                      className="text-base font-medium"
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
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("email")}
                    size="lg"
                    variant="outline"
                    className="flex-1 h-12 text-base"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 3b: Racket Details */}
        {currentStep === "racket-details" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formData.racketBrand || !formData.racketModel) return;
              setCurrentStep("string-service");
            }}
            className="animate-fade-in-scale"
          >
            <Card className="shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Store className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Racket Details
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="racketBrand"
                      className="text-base font-medium"
                    >
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
                      placeholder="Yonex, Victor, Li-Ning"
                      className="h-12 text-base"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="racketModel"
                      className="text-base font-medium"
                    >
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
                      placeholder="Astrox 99, Thruster K"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() =>
                      setCurrentStep(
                        isReturningCustomer ? "customer-type" : "customer-info"
                      )
                    }
                    size="lg"
                    variant="outline"
                    className="flex-1 h-12 text-base"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}

        {/* Step 3c: String & Service */}
        {currentStep === "string-service" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setCurrentStep("review");
            }}
            className="animate-fade-in-scale"
          >
            <Card className="shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="h-6 w-6 text-emerald-600" />
                  <h3 className="text-2xl font-semibold text-gray-900">
                    String & Service
                  </h3>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="stringType"
                      className="text-base font-medium"
                    >
                      String Product
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
                      className="h-12 text-base"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 mt-1"
                    >
                      <span>Not sure on string? We can help</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tension" className="text-base font-medium">
                      Tension (lbs)
                    </Label>
                    <Input
                      id="tension"
                      type="text"
                      value={formData.tension}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tension: e.target.value,
                        }))
                      }
                      placeholder="24-26"
                      className="h-12 text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="serviceType"
                      className="text-base font-medium"
                    >
                      Service Speed
                    </Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          serviceType: value,
                        }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard" className="text-base py-3">
                          Standard
                        </SelectItem>
                        <SelectItem value="express" className="text-base py-3">
                          Express
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("racket-details")}
                    size="lg"
                    variant="outline"
                    className="flex-1 h-12 text-base"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                  >
                    Review Order
                    <ArrowRight className="h-4 w-4 ml-2" />
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
              <CardContent className="p-8 space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Review Your Order
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Please confirm your details before submitting
                  </p>
                </div>

                <div className="space-y-4 bg-gray-50 p-5 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                    <p className="text-lg font-semibold">
                      {formData.customerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.contactNumber}
                    </p>
                    <p className="text-sm text-gray-600">{formData.email}</p>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-500 mb-1">Racket</p>
                    <p className="text-lg font-semibold">
                      {formData.racketBrand} {formData.racketModel}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-xs text-gray-500 mb-1">
                      String & Service
                    </p>
                    {formData.stringType && (
                      <p className="text-sm text-gray-600">
                        String: {formData.stringType}
                      </p>
                    )}
                    {formData.tension && (
                      <p className="text-sm text-gray-600">
                        Tension: {formData.tension} lbs
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Speed:{" "}
                      <span className="capitalize">{formData.serviceType}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setCurrentStep("string-service")}
                    size="lg"
                    variant="outline"
                    className="flex-1 h-12 text-base"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="flex-1 h-12 text-base bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
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
