
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  Tag,
  Package,
} from "lucide-react";

import { useCart } from "../context/CartContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CheckoutProgress from "../components/CheckoutProgress";

// Define the actions that can be waiting for confirmation
type PendingAction =
  | {
      type: "remove";
      productId: string;
      productName: string;
      variant: { color?: string; storage?: string; size?: string };
    }
  | { type: "clear" };

export default function Cart() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart();

  const [pendingAction, setPendingAction] =
    useState<PendingAction | null>(null);

  // Calculate the original subtotal before discounts
  const originalSubtotal = items.reduce((total, item) => {
    const originalPrice =
      item.originalUnitPrice ?? item.unitPrice;

    return total + originalPrice * item.quantity;
  }, 0);

  // Calculate the total discount
  const totalDiscount = originalSubtotal - totalPrice;

  // Handle the confirmed action
  function handleConfirm() {
    if (!pendingAction) return;

    if (pendingAction.type === "remove") {
      removeFromCart(
        pendingAction.productId,
        pendingAction.variant,
      );
    } else {
      clearCart();
    }

    setPendingAction(null);
  }

  // Determine the confirmation dialog content
  const dialogCopy =
    pendingAction?.type === "remove"
      ? {
          title: "Remove item",
          message: `Remove ${pendingAction.productName} from your cart?`,
          confirmLabel: "Remove",
        }
      : pendingAction?.type === "clear"
        ? {
            title: "Clear cart",
            message: "Remove all items from your cart?",
            confirmLabel: "Clear cart",
          }
        : null;

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <CheckoutProgress currentStep="cart" />

          <div className="mt-10 flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
              <ShoppingBag
                className="h-9 w-9 text-orange-600"
                aria-hidden="true"
              />
            </div>

            <h1 className="text-2xl font-semibold text-gray-900">
              Your cart is empty
            </h1>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Looks like you haven't added anything to your cart yet.
              Explore our products and find something you'll love.
            </p>

            <Link
              to="/"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Continue shopping
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* Checkout progress */}
        <CheckoutProgress currentStep="cart" />

        {/* Page heading */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Your Cart
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review your items before proceeding to checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPendingAction({ type: "clear" })}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear cart
          </button>
        </div>

        <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
          {/* Cart items */}
          <section aria-label="Cart items">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                  Shopping items
                </h2>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
              </div>

              <ul className="divide-y divide-gray-100">
                {items.map((item) => {
                  // Selected product variants
                  const variant = {
                    color: item.selectedColor,
                    storage: item.selectedStorage,
                    size: item.selectedSize,
                  };

                  // Build a readable variant label
                  const variantLabel = [
                    item.selectedColor,
                    item.selectedStorage,
                    item.selectedSize,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  // Use the selected color image for electronics
                  const displayImage =
                    item.product.kind === "electronics" &&
                    item.selectedColor
                      ? item.product.colorImages[item.selectedColor]
                      : item.product.imageUrl;

                  // Calculate this item's total
                  const lineTotal =
                    item.unitPrice * item.quantity;

                  // Check whether the item has a discount
                  const hasDiscount =
                    typeof item.originalUnitPrice === "number" &&
                    item.originalUnitPrice > item.unitPrice;

                  const originalLineTotal = hasDiscount
                    ? item.originalUnitPrice! * item.quantity
                    : null;

                  return (
                    <li
                      key={`${item.product.id}|${item.selectedColor ?? ""}|${item.selectedStorage ?? ""}|${item.selectedSize ?? ""}`}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex gap-4">
                        {/* Product image */}
                        <Link
                          to={`/product/${item.product.id}`}
                          className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-28 sm:w-28"
                        >
                          <img
                            src={displayImage}
                            alt={item.product.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </Link>

                        {/* Product information */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/product/${item.product.id}`}
                                className="text-sm font-semibold text-gray-900 transition-colors hover:text-orange-600 sm:text-base"
                              >
                                {item.product.name}
                              </Link>

                              {variantLabel && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {variantLabel}
                                </p>
                              )}
                            </div>

                            {/* Remove item */}
                            <button
                              type="button"
                              onClick={() =>
                                setPendingAction({
                                  type: "remove",
                                  productId: item.product.id,
                                  productName: item.product.name,
                                  variant,
                                })
                              }
                              aria-label={`Remove ${item.product.name} from cart`}
                              className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="mt-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                KES {lineTotal.toLocaleString()}
                              </span>

                              {hasDiscount && originalLineTotal !== null && (
                                <span className="text-xs text-gray-400 line-through">
                                  KES {originalLineTotal.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {item.quantity > 1 && (
                              <p className="mt-0.5 text-xs text-gray-500">
                                KES {item.unitPrice.toLocaleString()} each
                              </p>
                            )}
                          </div>

                          {/* Quantity controls */}
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-lg border border-gray-200">
                              <button
                                type="button"
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity - 1,
                                    variant,
                                  )
                                }
                                aria-label={`Decrease quantity of ${item.product.name}`}
                                className="rounded-l-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>

                              <span
                                className="min-w-9 text-center text-sm font-medium text-gray-900"
                                aria-label={`Quantity: ${item.quantity}`}
                              >
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.quantity + 1,
                                    variant,
                                  )
                                }
                                aria-label={`Increase quantity of ${item.product.name}`}
                                className="rounded-r-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                              >
                                <Plus
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>

                            <span className="text-xs text-gray-400 sm:hidden">
                              Quantity: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Continue shopping */}
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Continue shopping
            </Link>
          </section>

          {/* Order summary */}
          <aside className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Order summary
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Subtotal
                    <span className="ml-1 text-xs text-gray-400">
                      ({totalItems} {totalItems === 1 ? "item" : "items"})
                    </span>
                  </span>

                  <span className="font-medium text-gray-700">
                    KES {originalSubtotal.toLocaleString()}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-green-700">
                      <Tag
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Discount
                    </span>

                    <span className="font-medium text-green-700">
                      - KES {totalDiscount.toLocaleString()}
                    </span>
                  </div>
                )} 

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-gray-900">
                      KES {totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-1 text-right text-xs text-gray-400">
                    Delivery fee added at checkout
                  </p>
                </div>
              </div>

              <Link
                to="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Proceed to checkout
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <Package
                  className="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
                  aria-hidden="true"
                />

                <p className="text-xs leading-5 text-gray-500">
                  Your delivery method and fee will be confirmed during
                  checkout.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={dialogCopy !== null}
        title={dialogCopy?.title ?? ""}
        message={dialogCopy?.message ?? ""}
        confirmLabel={dialogCopy?.confirmLabel ?? ""}
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
