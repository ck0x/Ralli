import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Loading";
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
    undefined,
  );
  const queryClient = useQueryClient();

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["orders", statusFilter, adminUserId],
    queryFn: () => fetchOrders(statusFilter, adminUserId),
    enabled: !!adminUserId && !isSuperAdmin,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => updateOrderStatus(orderId, status, adminUserId),
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["orders"] });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData<Order[]>([
        "orders",
        statusFilter,
        adminUserId,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData<Order[]>(
        ["orders", statusFilter, adminUserId],
        (old) =>
          old?.map((or) => (or.id === orderId ? { ...or, status } : or)) || [],
      );

      return { previousOrders };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(
          ["orders", statusFilter, adminUserId],
          context.previousOrders,
        );
      }
      toast.error(t("messages.error"));
    },
    onSettled: () => {
      // Always refetch in background to sync with server
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onSuccess: () => {
      toast.success(t("messages.statusUpdated"));
    },
  });

  const handleStatusUpdate = (order: Order, status: OrderStatus) => {
    if (!adminUserId) return;
    updateMutation.mutate({ orderId: order.id, status });
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

  if (isError) {
    return (
      <div className="admin p-6">
        <Card className="p-6 bg-red-50 border-red-200">
          <h2 className="text-red-800">{t("messages.error")}</h2>
          <p className="text-red-600">
            {error?.message || "Failed to load orders"}
          </p>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["orders"] })
            }
          >
            {t("actions.refresh")}
          </Button>
        </Card>
      </div>
    );
  }

  if (isOrdersLoading) {
    return (
      <div className="admin space-y-6">
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <Card className="admin-summary">
        <h2>{t("adminTitle")}</h2>
        <div className="summary-grid">
          <div className="summary-card pending">
            <span className="label">{t("status.pending")}</span>
            <strong>{counts.pending}</strong>
          </div>
          <div className="summary-card in-progress">
            <span className="label">{t("status.in_progress")}</span>
            <strong>{counts.in_progress}</strong>
          </div>
          <div className="summary-card completed">
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
