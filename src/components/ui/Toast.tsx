type ToastProps = {
  message: string | null;
};

export default function Toast({ message }: ToastProps) {
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        message
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      {message && (
        <div className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-md shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}
