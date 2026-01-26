import type { Order, OrderFormValues, OrderStatus, Customer } from "@/types";

const API_BASE = "";

export type OrdersResponse = {
  orders: Order[];
};

export const registerMerchant = async (
  clerkUserId: string,
  businessName: string,
) => {
  const response = await fetch(`${API_BASE}/api/merchants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerkUserId, businessName }),
  });
  if (!response.ok) throw new Error("Registration failed");
  return response.json();
};

export const fetchMerchants = async (adminUserId: string) => {
  const response = await fetch(`${API_BASE}/api/merchants`, {
    headers: { "x-admin-user-id": adminUserId },
  });
  if (!response.ok) throw new Error("Failed to fetch merchants");
  const data = await response.json();
  return data.merchants;
};

export const updateMerchantStatus = async (
  merchantId: string,
  status: string,
  adminUserId: string,
) => {
  const response = await fetch(`${API_BASE}/api/merchants`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-user-id": adminUserId,
    },
    body: JSON.stringify({ merchantId, status }),
  });
  if (!response.ok) throw new Error("Failed to update merchant");
  return response.json();
};

export const fetchCustomerByPhone = async (
  phone: string,
  adminUserId?: string,
): Promise<Customer | null> => {
  const response = await fetch(
    `${API_BASE}/api/customers?phone=${encodeURIComponent(phone)}`,
    {
      headers: {
        ...(adminUserId ? { "x-admin-user-id": adminUserId } : {}),
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch customer");
  }
  const data = (await response.json()) as { customer: Customer | null };
  return data.customer;
};

export const createOrder = async (
  payload: OrderFormValues,
  adminUserId?: string,
) => {
  const response = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(adminUserId ? { "x-admin-user-id": adminUserId } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create order");
  }

  return (await response.json()) as { orderId: string };
};

export const fetchOrders = async (status?: OrderStatus): Promise<Order[]> => {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(`${API_BASE}/api/orders${query}`);
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  const data = (await response.json()) as OrdersResponse;
  return data.orders;
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  adminUserId?: string,
) => {
  const response = await fetch(`${API_BASE}/api/orders`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(adminUserId ? { "x-admin-user-id": adminUserId } : {}),
    },
    body: JSON.stringify({ orderId, status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update order");
  }

  return (await response.json()) as { success: true };
};
