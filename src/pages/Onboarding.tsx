import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { registerMerchant } from "@/lib/api";
import {
  normalizePhone,
  isValidPhone,
  formatPhoneForDisplay,
} from "@/lib/phone";

export const Onboarding = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const handleRegister = async () => {
    if (!user?.id || !businessName) return;

    // Validate email if provided
    if (businessEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(businessEmail)) {
      setEmailError("Invalid email format");
      return;
    }

    // Normalize and validate phone if provided
    let normalizedPhone: string | undefined;
    if (businessPhone) {
      const normalized = normalizePhone(businessPhone);
      if (!normalized) {
        setPhoneError("Invalid phone number");
        return;
      }
      normalizedPhone = normalized;
    }

    setIsSubmitting(true);
    try {
      await registerMerchant(
        user.id,
        businessName,
        businessEmail ? businessEmail : undefined,
        normalizedPhone ? normalizedPhone : undefined,
      );
      // Invalidate to trigger checks in parent or redirect
      await queryClient.invalidateQueries({ queryKey: ["adminRole"] });
      await queryClient.invalidateQueries({ queryKey: ["merchants"] });
      // Ideally we redirect, but the AuthGuard will handle it upon data refresh
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-black">
        <h2 className="text-2xl font-bold mb-4">Setup Your Shop</h2>
        <p className="mb-6 text-gray-600">
          Register your business to start tracking stringing jobs.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Business Name
            </label>
            <input
              className="w-full border p-2 rounded"
              placeholder="e.g. Ace Badminton"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Business Email
            </label>
            <input
              className="w-full border p-2 rounded"
              placeholder="contact@yourshop.com (optional)"
              value={businessEmail}
              onChange={(e) => {
                setEmailError(null);
                setBusinessEmail(e.target.value);
              }}
              onBlur={() => {
                if (
                  businessEmail &&
                  !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(businessEmail)
                ) {
                  setEmailError("Invalid email format");
                }
              }}
              disabled={isSubmitting}
            />
            {emailError && (
              <p className="text-xs text-red-500 mt-1">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Business Phone
            </label>
            <input
              className="w-full border p-2 rounded"
              placeholder="+1 555-555-5555 (optional)"
              value={businessPhone}
              onChange={(e) => {
                setPhoneError(null);
                setBusinessPhone(e.target.value);
              }}
              onBlur={() => {
                if (businessPhone) {
                  if (isValidPhone(businessPhone)) {
                    setBusinessPhone(formatPhoneForDisplay(businessPhone));
                  } else {
                    setPhoneError("Invalid phone number");
                  }
                }
              }}
              disabled={isSubmitting}
            />
            {phoneError && (
              <p className="text-xs text-red-500 mt-1">{phoneError}</p>
            )}
          </div>
          <Button
            onClick={handleRegister}
            disabled={
              !businessName ||
              isSubmitting ||
              (!!businessEmail && !!emailError) ||
              (!!businessPhone && !!phoneError)
            }
            className="w-full"
          >
            {isSubmitting ? "Registering..." : "Register Shop"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
