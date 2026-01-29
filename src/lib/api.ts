import type { Order, OrderFormValues, OrderStatus, Customer } from "@/types";

const API_BASE = "";

export type OrdersResponse = {
  orders: Order[];
};

export const registerMerchant = async (
  clerkUserId: string,
  businessName: string,
  businessEmail?: string,
  businessPhone?: string,
) => {
  const body: any = { clerkUserId, businessName };
  if (businessEmail) body.businessEmail = businessEmail;
  if (businessPhone) body.businessPhone = businessPhone;

  const response = await fetch(`${API_BASE}/api/merchants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Registration failed");
  }
  return response.json();
};

export const fetchMerchants = async (adminUserId: string) => {
  const response = await fetch(`${API_BASE}/api/merchants`, {
    headers: { "x-admin-user-id": adminUserId },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch merchants");
  }
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
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update merchant");
  }
  return response.json();
};

export const checkAdminRole = async (adminUserId?: string) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(`${API_BASE}/api/check-admin`, {
      headers: {
        ...(adminUserId ? { "x-admin-user-id": adminUserId } : {}),
      },
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to check admin");
    }
    return response.json();
  } catch (err) {
    clearTimeout(id);
    console.error("checkAdminRole error:", err);
    throw err;
  }
};

export const fetchCustomerByPhone = async (
  phone: string,
  adminUserId?: string,
): Promise<{ customer: Customer; recentOrders: Order[] } | null> => {
  const response = await fetch(
    `${API_BASE}/api/customers?phone=${encodeURIComponent(phone)}`,
    {
      headers: {
        ...(adminUserId ? { "x-admin-user-id": adminUserId } : {}),
      },
    },
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch customer");
  }
  const data = (await response.json()) as {
    customer: Customer | null;
    recentOrders: Order[];
  };
  if (!data.customer) return null;
  return { customer: data.customer, recentOrders: data.recentOrders || [] };
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create order");
  }

  return (await response.json()) as { orderId: string };
};

export const fetchOrders = async (
  status?: OrderStatus,
  adminUserId?: string,
): Promise<Order[]> => {
  const query = status ? `?status=${status}` : "";
  const response = await fetch(`${API_BASE}/api/orders${query}`, {
    headers: {
      ...(adminUserId ? { "x-admin-user-id": adminUserId } : {}),
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch orders");
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update order");
  }

  return (await response.json()) as { success: true };
};
