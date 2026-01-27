import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { fetchMerchants, updateMerchantStatus } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Merchant } from "@/types/merchant";

export const SuperAdminDashboard = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const adminUserId = user?.id;

  const {
    data: merchants = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchants"],
    queryFn: () => fetchMerchants(adminUserId!),
    enabled: !!adminUserId,
  });

  const handleStatusChange = async (
    merchantId: string,
    status: "approved" | "rejected",
  ) => {
    if (!adminUserId) return;
    try {
      await updateMerchantStatus(merchantId, status, adminUserId);
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="admin p-4">
        <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
        <Card className="p-8 text-center text-gray-500">
          Loading merchants...
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin p-4">
        <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
        <Card className="p-8 text-center border-red-500 text-red-500">
          <p>Failed to load merchants.</p>
          <p className="text-sm mt-2">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="admin p-4">
      <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>

      {merchants.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No merchants registered yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {merchants.map((merchant: Merchant) => (
            <Card
              key={merchant.id}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-bold">
                  {merchant.businessName || merchant.clerkUserId}
                </h3>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span className={`status-${merchant.status}`}>
                    {merchant.status}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Submitted:{" "}
                  <span className="text-xs text-gray-400">
                    {merchant.createdAt
                      ? new Date(merchant.createdAt).toLocaleString()
                      : "—"}
                  </span>
                </p>
                <div className="text-xs text-gray-400 mt-1">
                  <p>ID: {merchant.id}</p> <p>User: {merchant.clerkUserId}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {merchant.status === "pending" && (
                  <>
                    <Button
                      onClick={() =>
                        handleStatusChange(merchant.id, "approved")
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleStatusChange(merchant.id, "rejected")
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}
                {merchant.status === "approved" && (
                  <Button
                    variant="secondary"
                    onClick={() => handleStatusChange(merchant.id, "rejected")}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
