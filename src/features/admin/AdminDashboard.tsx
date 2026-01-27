import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fetchOrders, updateOrderStatus } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";

const STATUS_FILTERS: Array<{ value?: OrderStatus; labelKey: string }> = [
  { value: undefined, labelKey: "filters.all" },
  { value: "pending", labelKey: "status.pending" },
  { value: "in_progress", labelKey: "status.in_progress" },
  { value: "completed", labelKey: "status.completed" },
];

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const { isSuperAdmin } = useIsSuperAdmin();
  const adminUserId = user?.id;

  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(
    "pending",
  );
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ["orders", statusFilter, adminUserId],
    queryFn: () => fetchOrders(statusFilter, adminUserId),
    enabled: !!adminUserId && !isSuperAdmin,
    retry: false,
  });

  const handleStatusUpdate = async (order: Order, status: OrderStatus) => {
    if (!adminUserId) return;
    await updateOrderStatus(order.id, status, adminUserId);
    await queryClient.invalidateQueries({ queryKey: ["orders"] });
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

  if (isOrdersLoading) {
    return (
      <Card className="p-8 text-center">
        <p>Loading...</p>
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
        {orders.length === 0 && (
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
