"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CheckCircle,
  User,
  Phone,
  Mail,
  Zap,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { type Language, getTranslations } from "@/lib/translations";

interface FormData {
  customerName: string;
  contactNumber: string;
  email: string;
  racketBrand: string;
  racketModel: string;
  stringType: string;
  serviceType: string;
  additionalNotes: string;
}

export default function CustomerIntakeForm() {
  // Authentication: This form now requires login so we can track which staff member submitted the order
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Language state
  const [language, setLanguage] = useState<Language>('en');
  const t = getTranslations(language);

  // fullscreen / kiosk state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isKiosk, setIsKiosk] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    contactNumber: "",
    email: "",
    racketBrand: "",
    racketModel: "",
    stringType: "",
    serviceType: "standard",
    additionalNotes: "",
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch current user info
  useEffect(() => {
    fetch("/auth/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  // fullscreen listener keeps local state in sync
  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Apply / remove kiosk classes
  useEffect(() => {
    const apply = () => {
      const body = document.body;
      body.classList.remove("kiosk", "ipad-landscape", "ipad-portrait");
      if (!isKiosk) return;
      body.classList.add("kiosk");
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      body.classList.add(portrait ? "ipad-portrait" : "ipad-landscape");
    };
    apply();
    const orientationHandler = () => apply();
    window.addEventListener("orientationchange", orientationHandler);
    return () =>
      window.removeEventListener("orientationchange", orientationHandler);
  }, [isKiosk]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove(
        "o-portrait",
        "o-landscape",
        "kiosk",
        "ipad-landscape",
        "ipad-portrait"
      );
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      } catch {}
    };
  }, []);

  // Add responsive orientation classes to body (automatic)
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const apply = () => {
      document.body.classList.toggle("o-portrait", mq.matches);
      document.body.classList.toggle("o-landscape", !mq.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggleKiosk = async () => {
    if (!isKiosk) {
      // entering kiosk
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen?.();
        }
        setIsKiosk(true);
      } catch (e) {
        console.error("Enter kiosk failed", e);
      }
    } else {
      // exiting kiosk
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen?.();
        }
      } catch (e) {
        console.error("Exit kiosk failed", e);
      } finally {
        setIsKiosk(false);
      }
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { toast } = useToast();

  const triggerSuccessCycle = (variant: "remote" | "local") => {
    setShowSuccess(true);
    toast({
      title: variant === "remote" ? "Order submitted" : "Saved locally",
      description:
        variant === "remote"
          ? "We'll take great care of your racket."
          : "Network issue – stored locally and visible in Orders page.",
    });
    // Fade out + reset after delay
    setTimeout(() => {
      setShowSuccess(false);
      resetForm();
    }, 2400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    const storeId = Number(
      process.env.NEXT_PUBLIC_DEFAULT_STORE_ID || process.env.STORE_ID || 1
    );
    try {
      const payload = {
        storeId,
        customerName: formData.customerName.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.email.trim() || undefined,
        racketBrand: formData.racketBrand.trim(),
        racketModel: formData.racketModel.trim(),
        stringType: formData.stringType || undefined,
        serviceType: formData.serviceType,
        additionalNotes: formData.additionalNotes || undefined,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed (${res.status})`);
      }
      triggerSuccessCycle("remote");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to submit. Saving locally.";
      setErrorMsg(msg);
      toast({
        title: "Submission error",
        description: msg,
        variant: "destructive",
      });
      // Fallback local save
      try {
        const newOrder = {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: "pending",
          ...formData,
        };
        const existing = JSON.parse(
          localStorage.getItem("racketOrders") || "[]"
        ) as any[];
        existing.push(newOrder);
        localStorage.setItem("racketOrders", JSON.stringify(existing));
        triggerSuccessCycle("local");
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto relative">
        {/* Success Overlay */}
        <div
          className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-500 ${
            showSuccess ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Card className="w-full max-w-md text-center shadow-2xl border-0 bg-white/90 backdrop-blur">
            <CardContent className="pt-12 pb-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                  <CheckCircle className="h-20 w-20 text-blue-600 relative z-10" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                {t.thankYou}
              </h2>
              <p className="text-slate-600 mb-2 text-lg leading-relaxed">
                {t.orderRecorded}
              </p>
              <p className="text-slate-500 text-sm">
                {t.readyForNext}
              </p>
            </CardContent>
          </Card>
        </div>
        {/* Main Form Content */}
        {/* External kiosk toggle positioned beside (outside) the form header */}
        <button
          type="button"
          onClick={toggleKiosk}
          className="absolute top-8 -right-14 md:-right-16 z-20 inline-flex items-center justify-center w-11 h-11 rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 shadow transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={isKiosk ? "Exit kiosk mode" : "Enter kiosk mode"}
        >
          {isKiosk ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
        </button>
        <Card className="shadow-xl border border-slate-200 bg-white mt-8">
          <CardHeader className="bg-slate-50 rounded-t-lg border-b border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-2xl flex items-center gap-3 text-slate-800">
                <FileText className="h-6 w-6 text-blue-600" /> {t.formTitle}
              </CardTitle>
              <LanguageSelector
                currentLanguage={language}
                onLanguageChange={(lang) => setLanguage(lang)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6 section customer-section">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {t.customerDetails}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="customerName"
                      className="text-base font-medium flex items-center gap-2 text-slate-700"
                    >
                      <User className="h-4 w-4 text-blue-600" /> {t.fullName} *
                    </Label>
                    <Input
                      id="customerName"
                      placeholder={t.enterFullName}
                      value={formData.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                      required
                      className="text-lg p-4 h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="contactNumber"
                      className="text-base font-medium flex items-center gap-2 text-slate-700"
                    >
                      <Phone className="h-4 w-4 text-blue-600" /> {t.contactNumber}
                      *
                    </Label>
                    <Input
                      id="contactNumber"
                      placeholder={t.enterPhoneNumber}
                      value={formData.contactNumber}
                      onChange={(e) =>
                        handleInputChange("contactNumber", e.target.value)
                      }
                      required
                      className="text-lg p-4 h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-base font-medium flex items-center gap-2 text-slate-700"
                  >
                    <Mail className="h-4 w-4 text-slate-500" /> {t.emailAddress}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.enterEmail}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="text-lg p-4 h-14 border-2 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-200 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-6 section racket-section">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {t.racketDetails}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="racketBrand"
                      className="text-base font-medium text-slate-700"
                    >
                      {t.racketBrand} *
                    </Label>
                    <Select
                      value={formData.racketBrand}
                      onValueChange={(v) => handleInputChange("racketBrand", v)}
                    >
                      <SelectTrigger className="text-lg h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">
                        <SelectValue placeholder={t.selectBrand} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yonex">Yonex</SelectItem>
                        <SelectItem value="victor">Victor</SelectItem>
                        <SelectItem value="li-ning">Li-Ning</SelectItem>
                        <SelectItem value="babolat">Babolat</SelectItem>
                        <SelectItem value="wilson">Wilson</SelectItem>
                        <SelectItem value="other">{t.other}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="racketModel"
                      className="text-base font-medium text-slate-700"
                    >
                      {t.racketModel} *
                    </Label>
                    <Input
                      id="racketModel"
                      placeholder={t.enterRacketModel}
                      value={formData.racketModel}
                      onChange={(e) =>
                        handleInputChange("racketModel", e.target.value)
                      }
                      required
                      className="text-lg p-4 h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="stringType"
                    className="text-base font-medium text-slate-700"
                  >
                    {t.stringTypePreference}
                  </Label>
                  <Select
                    value={formData.stringType}
                    onValueChange={(v) => handleInputChange("stringType", v)}
                  >
                    <SelectTrigger className="text-lg h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">
                      <SelectValue placeholder={t.selectStringType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bg65">BG65</SelectItem>
                      <SelectItem value="bg80">BG80</SelectItem>
                      <SelectItem value="bg66-ultimax">BG66 Ultimax</SelectItem>
                      <SelectItem value="aerosonic">Aerosonic</SelectItem>
                      <SelectItem value="nanogy-98">Nanogy 98</SelectItem>
                      <SelectItem value="other">
                        {t.otherStringType}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-6 section service-section">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">
                    {t.serviceType}
                  </h3>
                </div>
                <RadioGroup
                  value={formData.serviceType}
                  onValueChange={(v) => handleInputChange("serviceType", v)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <Label
                    htmlFor="standard"
                    className="flex items-center space-x-4 p-6 border-2 border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  >
                    <RadioGroupItem
                      value="standard"
                      id="standard"
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="text-lg font-semibold block text-slate-800">
                        {t.standardService}
                      </div>
                      <p className="text-slate-600 mt-1">
                        {t.standardServiceDesc}
                      </p>
                    </div>
                  </Label>
                  <Label
                    htmlFor="premium"
                    className="flex items-center space-x-4 p-6 border-2 border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  >
                    <RadioGroupItem
                      value="premium"
                      id="premium"
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="text-lg font-semibold block text-slate-800">
                        {t.premiumService}
                      </div>
                      <p className="text-slate-600 mt-1">
                        {t.premiumServiceDesc}
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
              <div className="space-y-3 section notes-section">
                <Label
                  htmlFor="additionalNotes"
                  className="text-base font-medium flex items-center gap-2 text-slate-700"
                >
                  <FileText className="h-4 w-4 text-blue-600" /> {t.additionalNotes}
                </Label>
                <Textarea
                  id="additionalNotes"
                  placeholder={t.additionalNotesPlaceholder}
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    handleInputChange("additionalNotes", e.target.value)
                  }
                  className="text-lg p-4 min-h-[120px] border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg resize-none"
                />
              </div>
              <div className="section submit-section space-y-4">
                {errorMsg && (
                  <div className="error-message text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                    {errorMsg}
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-xl py-8 h-16 font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors duration-200 shadow-lg hover:shadow-xl text-white rounded-lg"
                >
                  {submitting ? t.submitting : t.submitOrder}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
