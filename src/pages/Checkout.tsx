import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  ShoppingCart,
  UserRound,
  Truck,
  CreditCard,
  Check,
  Search,
  ChevronDown,
  CircleAlert,
  ArrowLeft,
  LockKeyhole,
  LoaderCircle,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabaseClient";
import CheckoutProgress from "../components/CheckoutProgress";

type PaymentMethod = "mpesa" | "cash_on_delivery";
type DeliveryMethod = "courier" | "matatu";

type CourierArea = {
  id: number;
  name: string;
  fee: number;
};

type MatatuRoute = {
  id: number;
  sacco: string;
  fee: number;
  note: string | null;
};

type MatatuTown = {
  id: number;
  name: string;
  routes: MatatuRoute[];
};

type DeliveryOptions = {
  methods: { code: DeliveryMethod; name: string }[];
  courier: CourierArea[];
  matatu: MatatuTown[];
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-3 text-base text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

const sectionClass =
  "rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";

const kes = (amount: number) => `KES ${amount.toLocaleString()}`;

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
    if (!areaPickerOpen && !routePickerOpen) return;

    if (areaPickerOpen) areaSearchInputRef.current?.focus();
    if (routePickerOpen) routeSearchInputRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (
        areaPickerOpen &&
        !areaPickerRef.current?.contains(event.target as Node)
      ) {
        setAreaPickerOpen(false);
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
        setRoutePickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [areaPickerOpen, routePickerOpen]);

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
            {/* Customer information */}
            <section className={sectionClass}>
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <UserRound
                      size={20}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                      Customer Information
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Enter your contact details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className={inputClass}
                    disabled={submitting}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className={inputClass}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className={labelClass}>
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0700 456 789"
                    className={inputClass}
                    disabled={submitting}
                    required
                  />

                  <p className="mt-1.5 text-xs text-gray-500">
                    Use a Safaricom number if you intend to pay with M-Pesa.
                  </p>
                </div>
              </div>
            </section>

            {/* Delivery section */}
            <section className={sectionClass}>
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <Truck
                      size={20}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                      Delivery
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Choose how you would like to receive your order.
                    </p>
                  </div>
                </div>
              </div>

              {optionsError && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  role="alert"
                >
                  {optionsError}
                </div>
              )}

              {!options && !optionsError && (
                <div
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-500"
                  role="status"
                >
                  <LoaderCircle
                    size={20}
                    className="animate-spin text-orange-600"
                    aria-hidden="true"
                  />

                  Loading delivery options...
                </div>
              )}

              {options && options.methods.length === 0 && (
                <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Delivery is not available right now. Please try again later.
                </p>
              )}

              {options && options.methods.length > 0 && (
                <div className="space-y-5">
                  {/* Delivery method cards */}
                  <div>
                    <label className={labelClass}>Delivery method</label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {options.methods.map((method) => {
                        const selected = deliveryMethod === method.code;

                        const description =
                          method.code === "courier"
                            ? "Doorstep delivery to your selected area."
                            : "Send your parcel through a selected SACCO.";

                        return (
                          <label
                            key={method.code}
                            className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                              selected
                                ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            } ${submitting ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <input
                              type="radio"
                              name="deliveryMethod"
                              value={method.code}
                              checked={selected}
                              onChange={() => handleMethodChange(method.code)}
                              disabled={submitting}
                              className="mt-1 h-4 w-4 accent-orange-600"
                            />

                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-gray-900">
                                {method.name}
                              </span>

                              <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                                {description}
                              </span>
                            </span>

                            {selected && (
                              <span className="text-orange-600">
                                <Check
                                  size={20}
                                  strokeWidth={2}
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Courier area */}
                  {deliveryMethod === "courier" && (
                    <div className="space-y-2">
                      <label
                        htmlFor="delivery-area-search"
                        className={labelClass}
                      >
                        Delivery Area
                      </label>

                      <div className="relative" ref={areaPickerRef}>
                        <div className="flex min-h-10 items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                          <Search
                            size={16}
                            className="shrink-0 text-gray-500"
                            aria-hidden="true"
                          />

                          <input
                            ref={areaSearchInputRef}
                            id="delivery-area-search"
                            type="search"
                            role="combobox"
                            aria-autocomplete="list"
                            aria-haspopup="dialog"
                            aria-expanded={areaPickerOpen}
                            aria-controls="delivery-area-options"
                            value={
                              areaPickerOpen
                                ? areaSearch
                                : selectedArea?.name ?? ""
                            }
                            onFocus={() => {
                              if (!areaPickerOpen) {
                                setAreaSearch("");
                                setAreaPickerOpen(true);
                              }
                            }}
                            onChange={(event) =>
                              setAreaSearch(event.target.value)
                            }
                            placeholder="Search delivery areas"
                            disabled={
                              submitting || options.courier.length === 0
                            }
                            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                          />

                          {selectedArea && (
                            <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                              {selectedArea.fee === 0
                                ? "Free"
                                : kes(selectedArea.fee)}
                            </span>
                          )}

                          <ChevronDown
                            size={16}
                            className={`shrink-0 text-gray-500 transition-transform ${
                              areaPickerOpen ? "rotate-180" : ""
                            }`}
                            aria-hidden="true"
                          />
                        </div>

                        {areaPickerOpen && (
                          <div
                            id="delivery-area-options"
                            role="dialog"
                            aria-label="Choose a delivery area"
                            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                          >
                            <div className="max-h-56 overflow-y-auto p-1.5">
                              {filteredCourierAreas.length > 0 ? (
                                filteredCourierAreas.map((area) => (
                                  <button
                                    key={area.id}
                                    type="button"
                                    aria-pressed={String(area.id) === areaId}
                                    onMouseDown={(event) =>
                                      event.preventDefault()
                                    }
                                    onClick={() => {
                                      setAreaId(String(area.id));
                                      setAreaSearch("");
                                      setAreaPickerOpen(false);
                                      setError(null);
                                    }}
                                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 focus:bg-orange-50 focus:outline-none ${
                                      String(area.id) === areaId
                                        ? "bg-orange-50 text-orange-800"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    <span className="truncate">
                                      {area.name}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <p className="px-3 py-4 text-center text-sm text-gray-500">
                                  No areas match "{areaSearch}".
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {options.courier.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No delivery areas are available right now. Please try
                          another delivery method.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Matatu town and SACCO */}
                  {isMatatu && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="matatu-town" className={labelClass}>
                          Destination Town
                        </label>

                        <select
                          id="matatu-town"
                          value={townId}
                          onChange={(e) => handleTownChange(e.target.value)}
                          disabled={submitting}
                          className={inputClass}
                        >
                          <option value="">Select a town</option>

                          {options.matatu.map((town) => (
                            <option key={town.id} value={String(town.id)}>
                              {town.name}
                            </option>
                          ))}
                        </select>

                        {options.matatu.length === 0 && (
                          <p className="mt-2 text-sm text-gray-500">
                            No destination towns are available right now. Please
                            try another delivery method.
                          </p>
                        )}
                      </div>

                      {selectedTown && selectedTown.routes.length === 0 && (
                        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                          No SACCO serves {selectedTown.name} yet. Please
                          choose another town or delivery method.
                        </div>
                      )}

                      {selectedTown && selectedTown.routes.length > 0 && (
                        <div>
                          <label
                            htmlFor="matatu-sacco-search"
                            className={labelClass}
                          >
                            Select SACCO
                          </label>

                          <div className="relative" ref={routePickerRef}>
                            <div className="flex min-h-10 items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                              <Search
                                size={16}
                                className="shrink-0 text-gray-500"
                                aria-hidden="true"
                              />

                              <input
                                ref={routeSearchInputRef}
                                id="matatu-sacco-search"
                                type="search"
                                role="combobox"
                                aria-autocomplete="list"
                                aria-haspopup="dialog"
                                aria-expanded={routePickerOpen}
                                aria-controls="matatu-sacco-options"
                                value={
                                  routePickerOpen
                                    ? routeSearch
                                    : selectedRoute?.sacco ?? ""
                                }
                                onFocus={() => {
                                  if (!routePickerOpen) {
                                    setRouteSearch("");
                                    setRoutePickerOpen(true);
                                  }
                                }}
                                onChange={(event) =>
                                  setRouteSearch(event.target.value)
                                }
                                placeholder="Search SACCOs"
                                disabled={submitting}
                                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                              />

                              {selectedRoute && (
                                <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                                  {selectedRoute.fee === 0
                                    ? "Free"
                                    : kes(selectedRoute.fee)}
                                </span>
                              )}

                              <ChevronDown
                                size={16}
                                className={`shrink-0 text-gray-500 transition-transform ${
                                  routePickerOpen ? "rotate-180" : ""
                                }`}
                                aria-hidden="true"
                              />
                            </div>

                            {routePickerOpen && (
                              <div
                                id="matatu-sacco-options"
                                role="dialog"
                                aria-label="Choose a SACCO"
                                className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                              >
                                <div className="max-h-56 overflow-y-auto p-1.5">
                                  {filteredMatatuRoutes.length > 0 ? (
                                    filteredMatatuRoutes.map((route) => (
                                      <button
                                        key={route.id}
                                        type="button"
                                        aria-pressed={
                                          String(route.id) === routeId
                                        }
                                        onMouseDown={(event) =>
                                          event.preventDefault()
                                        }
                                        onClick={() => {
                                          setRouteId(String(route.id));
                                          setRouteSearch("");
                                          setRoutePickerOpen(false);
                                          setError(null);
                                        }}
                                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 focus:bg-orange-50 focus:outline-none ${
                                          String(route.id) === routeId
                                            ? "bg-orange-50 text-orange-800"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        <span className="truncate">
                                          {route.sacco}
                                        </span>
                                      </button>
                                    ))
                                  ) : (
                                    <p className="px-3 py-4 text-center text-sm text-gray-500">
                                      No SACCOs match "{routeSearch}".
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {selectedRoute?.note && (
                            <p className="mt-2 text-xs leading-relaxed text-gray-500">
                              {selectedRoute.note}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delivery address and notes */}
                  {deliveryMethod !== "" && (
                    <div className="space-y-4 border-t border-gray-100 pt-5">
                      <div>
                        <label htmlFor="address" className={labelClass}>
                          {isMatatu
                            ? `Where in ${selectedTown?.name ?? "the town"} should the parcel be delivered?`
                            : "Delivery Address"}
                        </label>

                        <textarea
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={3}
                          placeholder={
                            isMatatu
                              ? "SACCO parcel office, stage or landmark"
                              : "Building, street, estate and landmark"
                          }
                          className={`${inputClass} resize-none`}
                          required
                          disabled={submitting}
                        />

                        <p className="mt-1.5 text-xs text-gray-500">
                          {isMatatu
                            ? "Provide the parcel collection point or a nearby landmark."
                            : "Include your estate, building and a nearby landmark."}
                        </p>
                      </div>

                      <div>
                        <label htmlFor="delivery-notes" className={labelClass}>
                          Delivery Notes{" "}
                          <span className="font-normal text-gray-400">
                            (Optional)
                          </span>
                        </label>

                        <textarea
                          id="delivery-notes"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          rows={2}
                          maxLength={500}
                          placeholder="Add any special delivery instructions"
                          className={`${inputClass} resize-none`}
                          disabled={submitting}
                        />

                        <p className="mt-1 text-right text-xs text-gray-400">
                          {deliveryNotes.length}/500
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Payment method */}
            <section className={sectionClass}>
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                    <CreditCard
                      size={20}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
                      Payment Method
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Select how you would like to pay.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* M-Pesa */}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === "mpesa"
                      ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="mpesa"
                    onChange={() => setPaymentMethod("mpesa")}
                    checked={paymentMethod === "mpesa"}
                    disabled={submitting}
                    className="mt-1 h-4 w-4 accent-orange-600"
                  />

                  <span className="flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        M-Pesa
                      </span>

                      <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Recommended
                      </span>
                    </span>

                    <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                      Pay securely using an STK Push sent to your Safaricom
                      number.
                    </span>
                  </span>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                    isMatatu
                      ? "cursor-not-allowed border-gray-200 bg-gray-100"
                      : paymentMethod === "cash_on_delivery"
                        ? "cursor-pointer border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                        : "cursor-pointer border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    onChange={() => setPaymentMethod("cash_on_delivery")}
                    checked={paymentMethod === "cash_on_delivery"}
                    disabled={submitting || isMatatu}
                    className="mt-1 h-4 w-4 accent-orange-600"
                  />

                  <span className="flex-1">
                    <span className="text-sm font-semibold text-gray-900">
                      Cash on Delivery
                    </span>

                    <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                      {isMatatu
                        ? "Not available with Matatu delivery. Please pay using M-Pesa."
                        : "Pay when you receive your order."}
                    </span>
                  </span>
                </label>
              </div>
            </section>

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

          {/* Order summary */}
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-8">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>

              {/* Cart items */}
              <ul className="space-y-4">
                {items.map((item) => {
                  // Build a readable variant label.
                  const variantLabel = [
                    item.selectedColor,
                    item.selectedStorage,
                    item.selectedSize,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  // Use the selected color image for electronics.
                  const displayImage =
                    item.product.kind === "electronics" && item.selectedColor
                      ? item.product.colorImages[item.selectedColor]
                      : item.product.imageUrl;

                  const lineTotal = item.unitPrice * item.quantity;

                  return (
                    <li
                      key={`${item.product.id}|${item.selectedColor ?? ""}|${item.selectedStorage ?? ""}|${item.selectedSize ?? ""}`}
                      className="flex gap-3"
                    >
                      <img
                        src={displayImage}
                        alt={item.product.name}
                        className="h-17 w-17 shrink-0 rounded-lg border border-gray-100 bg-gray-50 object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-900">
                          {item.product.name}
                        </p>

                        {variantLabel && (
                          <p className="mt-1 text-xs text-gray-500">
                            {variantLabel}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="whitespace-nowrap text-sm font-semibold text-gray-900">
                        {kes(lineTotal)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              {/* Price summary */}
              <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Subtotal</span>

                  <span className="text-gray-700">
                    {kes(originalSubtotal)}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-700">Discount</span>

                    <span className="font-medium text-green-700">
                      - {kes(totalDiscount)}
                    </span>
                  </div>
                )}

                {deliveryFee !== undefined && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Delivery Fee</span>

                    <span className="text-right text-gray-700">
                      {deliveryFee === 0 ? "Free" : kes(deliveryFee)}
                    </span>
                  </div>
                )}
              </div>

              {/* Grand total */}
              <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-5">
                <span className="text-base font-semibold text-gray-900">
                  Total
                </span>

                <span className="text-xl font-bold text-gray-900">
                  {kes(grandTotal)}
                </span>
              </div>

              {/* Place order */}
              <button
                type="submit"
                disabled={submitting || !options}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                      aria-hidden="true"
                    />

                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
                By placing your order you agree to our{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700"
                >
                  Terms &amp; Conditions
                </Link>
                .
              </p>

              <Link
                to="/cart"
                className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition hover:text-orange-600"
              >
                <ArrowLeft
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                Return to Cart
              </Link>

              <div className="mt-5 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400">
                <LockKeyhole
                  size={16}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Secure checkout
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
