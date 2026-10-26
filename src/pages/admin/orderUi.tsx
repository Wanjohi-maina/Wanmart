import type { ReactNode } from "react";

export function titleCase(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function methodLabel(method: string) {
  if (method === "mpesa") return "M-Pesa";
  if (method === "cash_on_delivery") return "Cash on Delivery";
  return method;
}

export function orderStatusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function paymentStatusClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function Badge({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}