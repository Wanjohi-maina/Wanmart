import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Page not found
      </h1>
      <p className="text-gray-500 mb-6">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/" className="text-orange-600 hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}