export type MerchantStatus = "pending" | "approved" | "rejected";

export interface Merchant {
  id: string;
  clerkUserId: string;
  businessName: string;
  businessEmail?: string | null;
  businessPhone?: string | null;
  status: MerchantStatus;
  createdAt: string | null;
}
