import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { registerMerchant } from "@/lib/api";

export const Onboarding = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!user?.id || !businessName) return;
    setIsSubmitting(true);
    try {
      await registerMerchant(user.id, businessName);
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
          <Button
            onClick={handleRegister}
            disabled={!businessName || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Registering..." : "Register Shop"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
