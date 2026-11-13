
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-16 lg:py-14">

        <div>
          <Link
            to="/"
            className="inline-block text-2xl font-bold tracking-tight text-gray-900 transition-colors hover:text-orange-600"
          >
            Wan<span className="text-orange-600">mart</span>
          </Link>

          <p className="mt-3 max-w-xs text-sm leading-7 text-gray-500">
            Pay with M-Pesa or Cash on Delivery. Delivery across Kenya.
          </p>
        </div>

        {/* Customer Service */}
        <nav aria-label="Customer service">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Customer Service
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>
              <Link
                to="/contact"
                className="transition-colors hover:text-orange-600"
              >
                Contact Us
              </Link>
            </li>

            <li>
              <Link
                to="/terms"
                className="transition-colors hover:text-orange-600"
              >
                Terms &amp; Conditions
              </Link>
            </li>
          </ul>
        </nav>

        {/* Information */}
        <nav aria-label="Information">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Information
          </h2>

          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>
              <Link
                to="/about"
                className="transition-colors hover:text-orange-600"
              >
                About Wanmart
              </Link>
            </li>

            <li>
              <Link
                to="/privacy"
                className="transition-colors hover:text-orange-600"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center sm:px-6">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Wanmart. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}