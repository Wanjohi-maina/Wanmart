type ConfirmDialogProps = {
    isOpen: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null

    return (
        // Full-screen backdrop behind the dialog
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
            onClick={onCancel} // Clicking the backdrop cancels/closes the dialog
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()} // Prevent clicking inside the dialog from triggering the backdrop's onClick={onCancel}
            >
                <h2 id="confirm-dialog-title" className="text-base font-semibold text-gray-900">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">{message}</p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}