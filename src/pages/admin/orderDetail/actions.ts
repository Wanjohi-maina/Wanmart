import { supabase } from "../../../lib/supabaseClient";
import type { ActionConfig, ActionKey } from "./types";

export const ACTIONS: Record<ActionKey, ActionConfig> = {
  ship: {
    label: "Mark as shipped",
    confirmLabel: "Confirm shipped",
    description:
      "Marks the order as shipped. Add the delivery details below so the customer can see them. For Cash on Delivery orders, the payment is recorded when the order is delivered.",
    success: "Order marked as shipped.",
    field: "dispatch",
  },
  deliver: {
    label: "Mark as delivered",
    confirmLabel: "Confirm delivered",
    description: "Marks the order as delivered.",
    success: "Order marked as delivered.",
  },
  cod_delivered: {
    label: "Delivered and paid",
    confirmLabel: "Confirm delivered and paid",
    description:
      "Records the cash payment, deducts the stock and marks the order as delivered.",
    success: "Payment recorded and order delivered.",
    field: "reference",
  },
  cod_failed: {
    label: "Delivery failed",
    confirmLabel: "Confirm delivery failed",
    description:
      "Use this if the customer refused the order or did not pay. The order is cancelled and its reserved stock is released.",
    success: "Order cancelled and stock released.",
    danger: true,
    field: "note",
  },
  cancel: {
    label: "Cancel order",
    confirmLabel: "Confirm cancel",
    description: "The order is cancelled and its reserved stock is released.",
    success: "Order cancelled.",
    danger: true,
    field: "note",
  },
  cancel_refund: {
    label: "Cancel and refund",
    confirmLabel: "Confirm cancel and refund",
    description:
      "The customer has paid. The order is cancelled, the stock goes back on sale and the order moves to refund pending. Record the refund afterwards on the Review page.",
    success: "Order cancelled. Record the refund on the Review page.",
    danger: true,
    field: "note",
  },
};

export const ACTION_ORDER: ActionKey[] = [
  "ship",
  "deliver",
  "cod_delivered",
  "cod_failed",
  "cancel",
  "cancel_refund",
];

export function callAction(
  action: ActionKey,
  orderId: string,
  value: string,
  value2: string,
): PromiseLike<{ error: { message: string } | null }> {
  const optional = value || undefined;

  switch (action) {
    case "ship":
      return supabase.rpc("admin_ship_order", {
        p_order_id: orderId,
        p_reference: value || undefined,
        p_note: value2 || undefined,
      });
    case "deliver":
      return supabase.rpc("admin_mark_delivered", { p_order_id: orderId });
    case "cod_delivered":
      return supabase.rpc("admin_complete_cod_delivery", {
        p_order_id: orderId,
        p_reference: optional,
      });
    case "cod_failed":
      return supabase.rpc("admin_fail_cod_delivery", {
        p_order_id: orderId,
        p_note: optional,
      });
    default:
      return supabase.rpc("admin_cancel_order", {
        p_order_id: orderId,
        p_note: optional,
      });
  }
}
