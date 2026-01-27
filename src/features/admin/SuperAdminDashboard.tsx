import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { fetchMerchants, updateMerchantStatus } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Loading";
import { formatPhoneForDisplay } from "@/lib/phone";
import { CheckCircle, AlertCircle } from "lucide-react";
import type { Merchant } from "@/types/merchant";

export const SuperAdminDashboard = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const adminUserId = user?.id;

  // Modal State
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    status: "approved" | "rejected" | "pending";
    name: string;
  } | null>(null);

  // Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const {
    data: merchants = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["merchants"],
    queryFn: () => fetchMerchants(adminUserId!),
    enabled: !!adminUserId,
  });

  const handleStatusChange = async () => {
    if (!adminUserId || !pendingAction) return;
    const { id, status, name } = pendingAction;
    setPendingAction(null);

    try {
      await updateMerchantStatus(id, status, adminUserId);
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
      setToast({
        message: `Successfully ${status === "approved" ? "approved" : status === "rejected" ? "rejected" : "reverted"} ${name}`,
        type: "success",
      });
    } catch (err: any) {
      console.error(err);
      setToast({
        message: err.message || "Failed to update status",
        type: "error",
      });
    }
  };

  const openConfirmation = (
    id: string,
    status: "approved" | "rejected" | "pending",
    name?: string,
  ) => {
    setPendingAction({ id, status, name: name || "this merchant" });
  };

  if (isLoading) {
    return (
      <div className="admin p-4">
        <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
        <div className="grid gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
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
                <p className="text-sm text-gray-500">
                  Email:{" "}
                  <span className="text-xs text-gray-400">
                    {merchant.businessEmail ? merchant.businessEmail : "—"}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Phone:{" "}
                  <span className="text-xs text-gray-400">
                    {merchant.businessPhone
                      ? formatPhoneForDisplay(merchant.businessPhone)
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
                        openConfirmation(
                          merchant.id,
                          "approved",
                          merchant.businessName,
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        openConfirmation(
                          merchant.id,
                          "rejected",
                          merchant.businessName,
                        )
                      }
                    >
                      Reject
                    </Button>
                  </>
                )}

                {merchant.status === "rejected" && (
                  <>
                    <Button
                      onClick={() =>
                        openConfirmation(
                          merchant.id,
                          "approved",
                          merchant.businessName,
                        )
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        openConfirmation(
                          merchant.id,
                          "pending",
                          merchant.businessName,
                        )
                      }
                    >
                      Revert
                    </Button>
                  </>
                )}

                {merchant.status === "approved" && (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      openConfirmation(
                        merchant.id,
                        "rejected",
                        merchant.businessName,
                      )
                    }
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!pendingAction}
        onClose={() => setPendingAction(null)}
        title="Confirm Action"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingAction(null)}>
              Cancel
            </Button>
            <Button
              className={
                pendingAction?.status === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : ""
              }
              onClick={handleStatusChange}
            >
              Confirm{" "}
              {pendingAction?.status === "approved"
                ? "Approval"
                : pendingAction?.status === "rejected"
                  ? "Rejection"
                  : "Revert"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to{" "}
          <span className="font-bold">
            {pendingAction?.status === "approved"
              ? "approve"
              : pendingAction?.status === "rejected"
                ? "reject"
                : "revert"}
          </span>{" "}
          <span className="text-indigo-600 font-semibold">
            {pendingAction?.name}
          </span>
          ?
        </p>
        <p className="mt-2 text-sm text-gray-500">
          This will update the merchant's access to the platform immediately.
        </p>
      </Modal>

      {/* Persistence Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right-full ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};
