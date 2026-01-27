import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fetchOrders, updateOrderStatus, registerMerchant } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { SuperAdminDashboard } from "./SuperAdminDashboard";

const STATUS_FILTERS: Array<{ value?: OrderStatus; labelKey: string }> = [
  { value: undefined, labelKey: "filters.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "in_progress", labelKey: "status.in_progress" },
  { value: "completed", labelKey: "status.completed" },
];

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const adminUserId = user?.id;

  // Super Admin Check
  const configuredAdminId = import.meta.env.VITE_ADMIN_USER_ID;
  const isSuperAdmin =
    adminUserId && configuredAdminId && adminUserId === configuredAdminId;

  // Merchant State
  const [isRegistering, setIsRegistering] = useState(false);
  const [businessName, setBusinessName] = useState("");

  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(
    "pending",
  );
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", statusFilter],
    queryFn: () => fetchOrders(statusFilter),
    enabled: !!adminUserId && !isSuperAdmin,
    retry: false,
  });

  const isMerchant = !isSuperAdmin && !error;
  const merchantNotApproved = error?.message?.includes(
    "Merchant account not approved",
  ); // This is loose, ideally check specific error code

  const handleRegister = async () => {
    if (!adminUserId || !businessName) return;
    try {
      await registerMerchant(adminUserId, businessName);
      alert("Registration submitted! Please wait for approval.");
      setIsRegistering(false);
    } catch (e) {
      alert("Registration failed.");
    }
  };

  const counts = useMemo(() => {
    const summary: Record<OrderStatus, number> = {
      pending: 0,
      in_progress: 0,
      completed: 0,
    };
    orders.forEach((order) => {
      summary[order.status] += 1;
    });
    return summary;
  }, [orders]);

  const handleStatusUpdate = async (order: Order, status: OrderStatus) => {
    if (!adminUserId) return;
    await updateOrderStatus(order.id, status, adminUserId);
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  if (merchantNotApproved) {
    return (
      <Card className="admin-locked">
        <h2>Account Pending</h2>
        <p className="muted">
          Your merchant account is pending approval by the platform
          administrator.
        </p>
      </Card>
    );
  }

  // If fetching orders fails with 403 (unauthorized/not a merchant), show registration
  if (error) {
    return (
      <Card className="admin-locked">
        <h2>Merchant Registration</h2>
        <p className="muted">
          You act as a merchant? Register your business below.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            className="border p-2 rounded text-black"
            placeholder="Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
          <Button onClick={handleRegister}>Register</Button>
        </div>

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#1a1a1a",
            borderRadius: "8px",
            border: "1px solid #333",
          }}
        >
          <h3
            style={{
              fontSize: "0.8rem",
              color: "#888",
              marginBottom: "0.5rem",
            }}
          >
            DEBUG INFO (Check this)
          </h3>
          <p
            style={{ fontFamily: "monospace", fontSize: "0.75rem", margin: 0 }}
          >
            Your ID:{" "}
            <span style={{ color: "#fff" }}>{adminUserId || "NONE"}</span>
          </p>
          <p
            style={{ fontFamily: "monospace", fontSize: "0.75rem", margin: 0 }}
          >
            Env Target ID:{" "}
            <span style={{ color: "#fff" }}>
              {configuredAdminId || "NOT SET"}
            </span>
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              margin: "0.5rem 0 0",
              color: isSuperAdmin ? "#4CAF50" : "#FF5252",
            }}
          >
            Match: {isSuperAdmin ? "YES" : "NO"}
          </p>
          {!isSuperAdmin && (
            <p style={{ fontSize: "0.7rem", color: "#666", marginTop: "1rem" }}>
              * If you want to be Super Admin, copy "Your ID" and put it into
              .env as VITE_ADMIN_USER_ID
            </p>
          )}
        </div>
      </Card>
    );
  }

  if (!adminUserId) {
    return (
      <Card className="admin-locked">
        <h2>{t("adminTitle")}</h2>
        <p className="muted">{t("messages.adminOnlyView")}</p>
      </Card>
    );
  }

  return (
    <div className="admin">
      <Card className="admin-summary">
        <h2>{t("adminTitle")}</h2>
        <div className="summary-grid">
          <div>
            <span className="label">{t("status.pending")}</span>
            <strong>{counts.pending}</strong>
          </div>
          <div>
            <span className="label">{t("status.in_progress")}</span>
            <strong>{counts.in_progress}</strong>
          </div>
          <div>
            <span className="label">{t("status.completed")}</span>
            <strong>{counts.completed}</strong>
          </div>
        </div>
        <div className="row">
          <select
            value={statusFilter ?? ""}
            onChange={(event) => {
              const value = event.target.value;
              setStatusFilter(value ? (value as OrderStatus) : undefined);
            }}
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.labelKey} value={filter.value ?? ""}>
                {t(filter.labelKey)}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["orders"] })
            }
          >
            {t("actions.refresh")}
          </Button>
        </div>
      </Card>

      <div className="admin-list">
        {isLoading && <p className="muted">{t("messages.loading")}</p>}
        {!isLoading && orders.length === 0 && (
          <p className="muted">{t("messages.noOrders")}</p>
        )}
        {orders.map((order) => (
          <Card key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>{order.customerName}</h3>
                <p className="muted">{order.customerPhone}</p>
                {order.customerEmail && (
                  <p className="muted">{order.customerEmail}</p>
                )}
              </div>
              <span className={`status ${order.status}`}>
                {t(`status.${order.status}`)}
              </span>
            </div>
            <div className="order-details">
              <p>
                <strong>{order.racketBrand}</strong> {order.racketModel ?? ""}
              </p>
              <p>
                {order.stringBrand} {order.stringModel} • {order.tension} lbs
              </p>
              {order.notes && <p className="muted">{order.notes}</p>}
            </div>
            <div className="row">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleStatusUpdate(order, "in_progress")}
              >
                {t("actions.markInProgress")}
              </Button>
              <Button
                type="button"
                onClick={() => handleStatusUpdate(order, "completed")}
              >
                {t("actions.markCompleted")}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
