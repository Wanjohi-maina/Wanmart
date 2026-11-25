import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useReviewCount } from "./reviewCountContext";
import {
  Badge,
  orderStatusClass,
  paymentStatusClass,
  titleCase,
} from "./orderUi";
import ActionsCard from "./orderDetail/ActionsCard";
import ActivityCard from "./orderDetail/ActivityCard";
import CustomerCard from "./orderDetail/CustomerCard";
import DeliveryCard from "./orderDetail/DeliveryCard";
import DispatchCard from "./orderDetail/DispatchCard";
import ItemsCard from "./orderDetail/ItemsCard";
import PaymentCard from "./orderDetail/PaymentCard";
import SystemDetails from "./orderDetail/SystemDetails";
import { ACTION_ORDER, ACTIONS, callAction } from "./orderDetail/actions";
import type { ActionKey, OrderDetail } from "./orderDetail/types";

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { refresh } = useReviewCount();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [panel, setPanel] = useState<ActionKey | null>(null);
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;

    const { data, error } = await supabase.rpc("admin_get_order", {
      p_order_id: id,
    });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setLoadError(null);
    setOrder(data as unknown as OrderDetail);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function open(next: ActionKey | null) {
    setPanel(next);
    setText("");
    setText2("");
    setActionError(null);
    setSuccess(null);
  }

  async function perform(action: ActionKey) {
    if (!id) return;

    setBusy(true);
    setActionError(null);
    setSuccess(null);

    const { error } = await callAction(action, id, text.trim(), text2.trim());

    setBusy(false);

    if (error) {
      setActionError(error.message);
      return;
    }

    setPanel(null);
    setText("");
    setText2("");
    setSuccess(ACTIONS[action].success);
    await load();
    refresh();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600"></div>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div>
        <Link
          to="/admin/orders"
          className="text-sm text-gray-500 hover:text-orange-600"
        >
          ← Orders
        </Link>

        <div
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {loadError ?? "Order not found."}
        </div>
      </div>
    );
  }

  const available = ACTION_ORDER.filter((key) => order.actions.includes(key));

  const needsPaymentDecision =
    order.payment_resolution_status === "manual_review" ||
    order.payment_resolution_status === "refund_pending";

  const promptMayBeLive =
    order.payment_method === "mpesa" &&
    order.payment_status === "unpaid" &&
    order.mpesa_initiation_status !== "not_started" &&
    order.mpesa_initiation_status !== "failed";

  const isMatatu = order.delivery_method === "matatu";

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Link
        to="/admin/orders"
        className="inline-flex items-center text-sm font-medium text-gray-500 transition hover:text-orange-600"
      >
        ← Orders
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 sm:text-3xl">
          {order.customer_name}
        </h1>

        <p className="mt-2 break-all font-mono text-xs text-gray-500">
          {order.order_id}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {new Date(order.created_at).toLocaleString()}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge className={orderStatusClass(order.status)}>
            {titleCase(order.status)}
          </Badge>

          <Badge className={paymentStatusClass(order.payment_status)}>
            {titleCase(order.payment_status)}
          </Badge>

          {needsPaymentDecision && (
            <Badge className="border border-amber-200 bg-amber-50 text-amber-800">
              Payment review
            </Badge>
          )}
        </div>
      </div>

      {success && (
        <div
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          role="status"
        >
          {success}
        </div>
      )}

      <ActionsCard
        available={available}
        panel={panel}
        text={text}
        text2={text2}
        busy={busy}
        actionError={actionError}
        needsPaymentDecision={needsPaymentDecision}
        promptMayBeLive={promptMayBeLive}
        isMatatu={isMatatu}
        onOpen={open}
        onTextChange={setText}
        onText2Change={setText2}
        onPerform={perform}
      />

      <ItemsCard order={order} />
      <DeliveryCard order={order} isMatatu={isMatatu} />

      <DispatchCard
        key={`${order.dispatch?.reference ?? ""}:${order.dispatch?.note ?? ""}`}
        order={order}
        onSaved={async () => {
          await load();
          setSuccess("Dispatch details saved.");
        }}
      />

      <CustomerCard order={order} />
      <PaymentCard order={order} />
      <SystemDetails order={order} />
      <ActivityCard order={order} />
    </div>
  );
}
