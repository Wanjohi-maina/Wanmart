import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CircleAlert, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";
import CheckoutProgress from "../components/CheckoutProgress";
import type {
  DeliveryMethod,
  DeliveryOptions,
  PaymentMethod,
} from "./checkout/types";
import CustomerInformation from "./checkout/CustomerInformation";
import DeliverySection from "./checkout/DeliverySection";
import OrderSummary from "./checkout/OrderSummary";
import PaymentSection from "./checkout/PaymentSection";

export default function Checkout() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Details passed from the order page when retrying a failed payment.
  const prefill = (
    location.state as {
      prefill?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        deliveryMethod?: DeliveryMethod;
        areaId?: string;
        townId?: string;
        routeId?: string;
        deliveryNotes?: string;
      };
    } | null
  )?.prefill;

  const [name, setName] = useState(prefill?.name ?? "");
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [address, setAddress] = useState(prefill?.address ?? "");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");

  const [options, setOptions] = useState<DeliveryOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | "">(
    prefill?.deliveryMethod ?? "",
  );

  const [areaId, setAreaId] = useState(prefill?.areaId ?? "");
  const [areaSearch, setAreaSearch] = useState("");
  const [areaPickerOpen, setAreaPickerOpen] = useState(false);

  const [townId, setTownId] = useState(prefill?.townId ?? "");
  const [townSearch, setTownSearch] = useState("");
  const [townPickerOpen, setTownPickerOpen] = useState(false);
  const [routeId, setRouteId] = useState(prefill?.routeId ?? "");
  const [routeSearch, setRouteSearch] = useState("");
  const [routePickerOpen, setRoutePickerOpen] = useState(false);

  const [deliveryNotes, setDeliveryNotes] = useState(
    prefill?.deliveryNotes ?? "",
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const areaPickerRef = useRef<HTMLDivElement>(null);
  const areaSearchInputRef = useRef<HTMLInputElement>(null);

  const townPickerRef = useRef<HTMLDivElement>(null);
  const townSearchInputRef = useRef<HTMLInputElement>(null);

  const routePickerRef = useRef<HTMLDivElement>(null);
  const routeSearchInputRef = useRef<HTMLInputElement>(null);

  // Load the delivery areas, towns and SACCOs.
  useEffect(() => {
    let cancelled = false;

    supabase.rpc("get_delivery_options").then(({ data, error: rpcError }) => {
      if (cancelled) return;

      if (rpcError || !data) {
        setOptionsError(
          "We could not load the delivery options. Please refresh the page.",
        );
        return;
      }

      setOptions(data as unknown as DeliveryOptions);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Handle closing the searchable dropdowns.
  useEffect(() => {
    if (!areaPickerOpen && !townPickerOpen && !routePickerOpen) return;

    if (areaPickerOpen) areaSearchInputRef.current?.focus();
    if (townPickerOpen) townSearchInputRef.current?.focus();
    if (routePickerOpen) routeSearchInputRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (
        areaPickerOpen &&
        !areaPickerRef.current?.contains(event.target as Node)
      ) {
        setAreaPickerOpen(false);
      }

      if (
        townPickerOpen &&
        !townPickerRef.current?.contains(event.target as Node)
      ) {
        setTownPickerOpen(false);
      }

      if (
        routePickerOpen &&
        !routePickerRef.current?.contains(event.target as Node)
      ) {
        setRoutePickerOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAreaPickerOpen(false);
        setTownPickerOpen(false);
        setRoutePickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [areaPickerOpen, townPickerOpen, routePickerOpen]);

  // Find the currently selected delivery options.
  const selectedArea = options?.courier.find(
    (area) => String(area.id) === areaId,
  );

  const filteredCourierAreas = (options?.courier ?? []).filter((area) =>
    area.name.toLowerCase().includes(areaSearch.trim().toLowerCase()),
  );

  const selectedTown = options?.matatu.find(
    (town) => String(town.id) === townId,
  );

  const filteredMatatuTowns = (options?.matatu ?? []).filter((town) =>
    town.name.toLowerCase().includes(townSearch.trim().toLowerCase()),
  );

  const selectedRoute = selectedTown?.routes.find(
    (route) => String(route.id) === routeId,
  );

  const filteredMatatuRoutes = (selectedTown?.routes ?? []).filter((route) =>
    route.sacco.toLowerCase().includes(routeSearch.trim().toLowerCase()),
  );

  // Get the delivery fee from the selected option.
  const deliveryFee =
    deliveryMethod === "courier"
      ? selectedArea?.fee
      : deliveryMethod === "matatu"
        ? selectedRoute?.fee
        : undefined;

  const grandTotal = totalPrice + (deliveryFee ?? 0);

  // Calculate the original subtotal before discounts.
  const originalSubtotal = items.reduce((total, item) => {
    const originalPrice = item.originalUnitPrice ?? item.unitPrice;

    return total + originalPrice * item.quantity;
  }, 0);

  // Calculate the total discount.
  const totalDiscount = originalSubtotal - totalPrice;

  // If the cart is empty, there is nothing to check out.
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <ShoppingCart
              size={28}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Add some products to your cart before proceeding to checkout.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-orange-700"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // Handle delivery method selection.
  function handleMethodChange(value: string) {
    const method = value as DeliveryMethod | "";

    setDeliveryMethod(method);

    setAreaId("");
    setAreaSearch("");
    setAreaPickerOpen(false);

    setTownId("");
    setTownSearch("");
    setTownPickerOpen(false);
    setRouteId("");
    setRouteSearch("");
    setRoutePickerOpen(false);

    setError(null);

    // Matatu parcels must be paid for before they are sent.
    if (method === "matatu") {
      setPaymentMethod("mpesa");
    }
  }

  // Changing the town clears the previously selected SACCO.
  function handleTownChange(value: string) {
    setTownId(value);
    setTownSearch("");
    setTownPickerOpen(false);
    setRouteId("");
    setRouteSearch("");
    setRoutePickerOpen(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (
      name.trim() === "" ||
      email.trim() === "" ||
      phone.trim() === "" ||
      address.trim() === ""
    ) {
      setError("Name, email, phone, and address are required.");
      return;
    }

    // Validate the phone number before creating an M-Pesa order.
    if (paymentMethod === "mpesa") {
      const digits = phone.replace(/\D/g, "");

      const validPhone =
        (digits.startsWith("254") && digits.length === 12) ||
        ((digits.startsWith("07") || digits.startsWith("01")) &&
          digits.length === 10);

      if (!validPhone) {
        setError(
          "Enter a valid Safaricom number for M-Pesa, for example 0712 345 678.",
        );
        return;
      }
    }

    if (!options) {
      setError("Delivery options are still loading. Please wait a moment.");
      return;
    }

    if (deliveryMethod === "") {
      setError("Choose a delivery method.");
      return;
    }

    if (deliveryMethod === "courier" && !selectedArea) {
      setError("Choose your delivery area.");
      return;
    }

    if (deliveryMethod === "matatu" && !selectedTown) {
      setError("Choose the destination town.");
      return;
    }

    if (deliveryMethod === "matatu" && !selectedRoute) {
      setError("Choose a SACCO for your destination.");
      return;
    }

    setSubmitting(true);

    try {
      // Convert cart items into the format expected by create_order().
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        color: item.selectedColor ?? null,
        storage: item.selectedStorage ?? null,
        size: item.selectedSize ?? null,
      }));

      // The database securely looks up and validates the delivery fee.
      const { data, error: orderError } = await supabase.rpc("create_order", {
        p_customer_name: name.trim(),
        p_email: email.trim(),
        p_phone: phone.trim(),
        p_address: address.trim(),
        p_items: orderItems,
        p_payment_method: paymentMethod,
        p_delivery_method: deliveryMethod,
        p_delivery_option_id: Number(
          deliveryMethod === "courier" ? areaId : routeId,
        ),
        p_delivery_notes: deliveryNotes.trim() || undefined,
      });

      if (orderError) {
        setError(
          orderError.message ||
            "We could not create your order. Please try again.",
        );
        return;
      }

      if (!data?.order_id || !data?.access_token) {
        setError(
          "The order response is missing its ID or access token. Please contact support before retrying.",
        );
        return;
      }

      const orderId = data.order_id as string;
      const accessToken = data.access_token as string;

      // Save the access token for the order confirmation page.
      sessionStorage.setItem(`order_access_token_${orderId}`, accessToken);

      if (paymentMethod === "mpesa") {
        // Keep a copy of the cart so the customer can retry if payment fails.
        try {
          sessionStorage.setItem(
            `cart_snapshot_${orderId}`,
            JSON.stringify({
              items,
              delivery: {
                deliveryMethod,
                areaId,
                townId,
                routeId,
                deliveryNotes,
              },
            }),
          );
        } catch (storageError) {
          console.error("Could not save the cart copy:", storageError);
        }

        // Initiate the M-Pesa STK Push.
        const { data: stkData, error: stkError } =
          await supabase.functions.invoke("mpesa-stk-push", {
            body: { orderId, accessToken },
          });

        if (stkError) {
          console.error("M-Pesa initiation error:", stkError);
        } else if (stkData?.success === false || stkData?.error) {
          console.error("M-Pesa initiation response:", stkData);
        }
      }

      clearCart();

      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error("Error creating order:", error);

      setError(
        "Something went wrong while placing your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isMatatu = deliveryMethod === "matatu";

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Complete your details and review your order before placing it.
          </p>

          {/* Reusable checkout progress */}
          <CheckoutProgress currentStep="checkout" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8"
        >
          {/* Main checkout form */}
          <div className="space-y-6 lg:col-span-2">
            <CustomerInformation
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              submitting={submitting}
            />

            <DeliverySection
              options={options}
              optionsError={optionsError}
              deliveryMethod={deliveryMethod}
              submitting={submitting}
              handleMethodChange={handleMethodChange}
              isMatatu={isMatatu}
              areaPickerRef={areaPickerRef}
              areaSearchInputRef={areaSearchInputRef}
              areaPickerOpen={areaPickerOpen}
              setAreaPickerOpen={setAreaPickerOpen}
              selectedArea={selectedArea}
              areaSearch={areaSearch}
              setAreaSearch={setAreaSearch}
              filteredCourierAreas={filteredCourierAreas}
              areaId={areaId}
              setAreaId={setAreaId}
              setError={setError}
              townPickerRef={townPickerRef}
              townSearchInputRef={townSearchInputRef}
              townPickerOpen={townPickerOpen}
              setTownPickerOpen={setTownPickerOpen}
              townSearch={townSearch}
              setTownSearch={setTownSearch}
              selectedTown={selectedTown}
              filteredMatatuTowns={filteredMatatuTowns}
              handleTownChange={handleTownChange}
              townId={townId}
              routePickerRef={routePickerRef}
              routeSearchInputRef={routeSearchInputRef}
              routePickerOpen={routePickerOpen}
              setRoutePickerOpen={setRoutePickerOpen}
              routeSearch={routeSearch}
              setRouteSearch={setRouteSearch}
              selectedRoute={selectedRoute}
              filteredMatatuRoutes={filteredMatatuRoutes}
              routeId={routeId}
              setRouteId={setRouteId}
              address={address}
              setAddress={setAddress}
              deliveryNotes={deliveryNotes}
              setDeliveryNotes={setDeliveryNotes}
            />

            <PaymentSection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              isMatatu={isMatatu}
              submitting={submitting}
            />
            {/* Error message */}
            {error && (
              <div
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                <CircleAlert
                  size={20}
                  strokeWidth={1.8}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />

                <p>{error}</p>
              </div>
            )}
          </div>

          <OrderSummary
            items={items}
            totalItems={totalItems}
            originalSubtotal={originalSubtotal}
            totalDiscount={totalDiscount}
            deliveryFee={deliveryFee}
            grandTotal={grandTotal}
            submitting={submitting}
            optionsLoaded={options !== null}
          />
        </form>
      </div>
    </div>
  );
}
