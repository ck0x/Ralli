export type MerchantStatus = "pending" | "approved" | "rejected";

export interface Merchant {
  id: string;
  clerkUserId: string;
  businessName: string;
  status: MerchantStatus;
  createdAt: string;
}
