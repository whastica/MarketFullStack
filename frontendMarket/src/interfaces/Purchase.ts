import type { PurchaseItem } from "./PurchaseItem";
export interface Purchase {
  purchaseId: number;
  clientId: string;
  date: string;
  paymentMethod: string;
  comment: string;
  state: string;
  items: PurchaseItem[];
}
