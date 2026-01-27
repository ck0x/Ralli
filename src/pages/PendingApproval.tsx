import { Card } from "@/components/ui/Card";
import { UserButton } from "@clerk/clerk-react";

export const PendingApproval = () => {
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center text-black">
        <div className="flex justify-center mb-6">
          <UserButton />
        </div>
        <h2 className="text-2xl font-bold mb-2">Account Pending</h2>
        <p className="text-gray-600">
          Your merchant account is currently pending approval by the platform
          administrator. Please check back later.
        </p>
      </Card>
    </div>
  );
};
