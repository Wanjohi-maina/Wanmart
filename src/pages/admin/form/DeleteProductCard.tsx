import { Card } from "./formUi";

export default function DeleteProductCard({
  orderCount,
  confirmDelete,
  deleting,
  onAskDelete,
  onCancel,
  onConfirm,
}: {
  orderCount: number;
  confirmDelete: boolean;
  deleting: boolean;
  onAskDelete: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Card title="Delete product">
      {orderCount > 0 ? (
        <p className="text-sm text-gray-600">
          This product appears in {orderCount}{" "}
          {orderCount === 1 ? "order" : "orders"}, so it cannot be deleted. Turn
          off "Visible in store" to hide it instead.
        </p>
      ) : confirmDelete ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This permanently deletes the product. It has never been ordered.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={deleting}
              onClick={onConfirm}
              className="w-full rounded-full bg-red-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {deleting ? "Deleting..." : "Confirm delete"}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={onCancel}
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 hover:border-gray-400 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAskDelete}
          className="w-full rounded-full border border-red-300 bg-white px-5 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50 sm:w-auto"
        >
          Delete product
        </button>
      )}
    </Card>
  );
}
