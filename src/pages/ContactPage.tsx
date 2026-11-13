
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
} from "lucide-react";

import PolicyPage, { PolicySection } from "../components/PolicyPage";

export default function ContactPage() {
  return (
    <PolicyPage title="Contact us">
      <p className="text-gray-600">
        We can help with orders, deliveries, returns, refunds and any other
        questions. Please include your order number when you contact us about
        an existing order.
      </p>

      <PolicySection title="Phone and WhatsApp">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Phone size={19} />
          </span>

          <div className="space-y-3">
            <p>
              <a
                href="tel:+254142436280"
                className="font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
              >
                0142 436 280
              </a>
            </p>

            <a
              href="https://wa.me/254142436280"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-700"
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </PolicySection>

      <PolicySection title="Email">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Mail size={19} />
          </span>

          <p>
            <a
              href="mailto:benmaina655@gmail.com"
              className="break-all font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
            >
              benmaina655@gmail.com
            </a>
          </p>
        </div>
      </PolicySection>

      <PolicySection title="Support hours">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Clock size={19} />
          </span>

          <div className="space-y-2">
            <p>Monday to Friday, 9:00 am to 6:00 pm</p>
            <p>Saturday, 9:00 am to 1:00 pm</p>
            <p className="text-sm text-gray-500">
              All times are East Africa Time (EAT).
            </p>
          </div>
        </div>
      </PolicySection>
    </PolicyPage>
  );
}
