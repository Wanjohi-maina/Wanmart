import type { LucideIcon } from "lucide-react";

export type OrderConfirmationItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  original_unit_price: number | null;
  selected_color: string | null;
  selected_storage: string | null;
  selected_size: string | null;
  image_url: string | null;
};

export type OrderConfirmation = {
  order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_resolution_status?: string | null;
  mpesa_initiation_status: string | null;
  delivery_method: string | null;
  delivery_label: string | null;
  delivery_fee: number | null;
  delivery_notes: string | null;
  dispatch: { reference: string | null; note: string | null } | null;
  currency: string;
  subtotal: number;
  discount_total: number;
  total: number;
  reservation_expires_at: string | null;
  created_at: string;
  items: OrderConfirmationItem[];
};

export type PaymentView =
  | "awaiting"
  | "paid"
  | "failed"
  | "review"
  | "refundPending"
  | "cod"
  | "refunded";

export type PaymentViewStyles = {
  icon: LucideIcon;
  container: string;
  iconColor: string;
  titleColor: string;
};