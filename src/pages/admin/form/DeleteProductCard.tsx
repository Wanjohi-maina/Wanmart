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
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm leading-6 text-gray-600">
            This product appears in {orderCount}{" "}
            {orderCount === 1 ? "order" : "orders"}, so it cannot be deleted.
            Turn off "Visible in store" to hide it instead.
          </p>
        </div>
      ) : confirmDelete ? (
        <div className="space-y-4 rounded-lg border border-red-200 bg-red-50/60 p-4">
          <div>
            <p className="text-sm font-semibold text-red-800">
              Are you sure you want to delete this product?
            </p>
            <p className="mt-1.5 text-sm leading-6 text-gray-600">
              This permanently deletes the product. It has never been ordered.
              This action cannot be undone.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={deleting}
              onClick={onConfirm}
              className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {deleting ? "Deleting..." : "Confirm delete"}
            </button>

            <button
              type="button"
              disabled={deleting}
              onClick={onCancel}
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-sm leading-6 text-gray-600">
            Permanently remove this product from your store. Products with
            existing orders cannot be deleted.
          </p>

          <button
            type="button"
            onClick={onAskDelete}
            className="w-full rounded-full border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:border-red-400 hover:bg-red-50 sm:w-auto"
          >
            Delete product
          </button>
        </div>
      )}
    </Card>
  );
}
