export type ActionKey =
  | "ship"
  | "deliver"
  | "cod_delivered"
  | "cod_failed"
  | "cancel"
  | "cancel_refund";

export type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  selected_color: string | null;
  selected_storage: string | null;
  selected_size: string | null;
  image_url: string | null;
};

export type Dispatch = {
  reference: string | null;
  note: string | null;
  dispatched_at: string;
  provider: string;
};

export type OrderDetail = {
  order_id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_resolution_status: string;
  inventory_status: string;
  mpesa_initiation_status: string;
  subtotal: number;
  discount_total: number;
  total: number;
  currency: string;
  created_at: string;
  reservation_expires_at: string | null;
  resolved_at: string | null;
  resolution_note: string | null;
  refund_reference: string | null;
  delivery_method: string | null;
  delivery_label: string | null;
  delivery_fee: number;
  delivery_notes: string | null;
  dispatch: Dispatch | null;
  actions: ActionKey[];
  items: OrderItem[];
  callbacks: {
    result_code: number;
    result_description: string | null;
    processing_status: string;
    received_at: string;
  }[];
  history: {
    action: string;
    details: { note?: string | null; reference?: string | null };
    created_at: string;
  }[];
};

export type ActionConfig = {
  label: string;
  confirmLabel: string;
  description: string;
  success: string;
  danger?: boolean;
  field?: "note" | "reference" | "dispatch";
};
