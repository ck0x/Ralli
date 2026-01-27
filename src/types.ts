export type OrderStatus = "pending" | "in_progress" | "completed";

export type Customer = {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  email?: string | null;
  preferredLanguage?: string | null;
};

export type Order = {
  id: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  racketBrand: string;
  racketModel?: string | null;
  stringCategory: "durable" | "repulsion";
  stringFocus: "attack" | "control";
  stringBrand: string;
  stringModel: string;
  tension: number;
  notes?: string | null;
  status: OrderStatus;
  createdAt: string;
  completedAt?: string | null;
};

export type OrderFormValues = {
  phone: string;
  name: string;
  email?: string;
  preferredLanguage: string;
  racketBrand: string;
  racketModel?: string;
  stringCategory: "durable" | "repulsion";
  stringFocus: "attack" | "control";
  stringBrand: string;
  stringModel: string;
  tension: number;
  notes?: string;
};
