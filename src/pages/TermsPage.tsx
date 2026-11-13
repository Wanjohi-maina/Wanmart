
import { Link } from "react-router-dom";
import PolicyPage, { PolicySection } from "../components/PolicyPage";

const UPDATED = "13 November 2026";

const sections = [
  { id: "ordering", title: "Ordering and prices" },
  { id: "payment", title: "Payment" },
  { id: "delivery", title: "Delivery" },
  { id: "returns", title: "Returns" },
  { id: "refunds", title: "Refunds" },
  { id: "cancelling", title: "Cancelling an order" },
  { id: "changes", title: "Changes to these terms" },
  { id: "contact", title: "Contact" },
];

const list = "list-disc space-y-2 pl-5 marker:text-orange-500";

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions" updated={UPDATED}>
      <p>
        These terms apply to orders placed on Wanmart. By placing an order you
        agree to them.
      </p>

      {/* Table of contents */}
      <nav
        aria-label="On this page"
        className="rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6"
      >
        <p className="mb-4 font-semibold text-gray-900">
          On this page
        </p>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-orange-50 hover:text-orange-700"
              >
                <span className="text-xs font-medium text-gray-400">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>{section.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <PolicySection id="ordering" title="Ordering and prices">
        <ul className={list}>
          <li>All prices are in Kenyan shillings (KES).</li>

          <li>
            The total you see at checkout is what you pay. It includes the
            items and the delivery fee for your region, which is shown before
            you place the order.
          </li>

          <li>
            Placing an order is a request to buy. We may decline or cancel an
            order, for example if an item is out of stock, a price was shown
            incorrectly, or we cannot deliver to your address. If you have
            already paid, we refund you in full.
          </li>

          <li>
            Please check your name, phone number and delivery address before
            you place your order.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="payment" title="Payment">
        <div className="space-y-3">
          <p className="font-semibold text-gray-900">M-Pesa</p>

          <ul className={list}>
            <li>
              After you place your order, you get an M-Pesa prompt on the phone
              number you entered. Enter your PIN on your phone to pay. We never
              see your PIN.
            </li>

            <li>
              We hold your items for 15 minutes. If your payment is not
              confirmed in that time, the order is cancelled automatically and
              you can place a new one.
            </li>

            <li>
              If your payment goes through after the order was cancelled, your
              order page will show that it is under review. We will contact you
              using the phone number or email on the order, and either complete
              the order if the items are still available or refund your payment
              in full to the same M-Pesa number.
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <p className="font-semibold text-gray-900">
            Cash on Delivery
          </p>

          <ul className={list}>
            <li>
              You pay the full amount, including delivery, in cash when you
              receive your order.
            </li>

            <li>
              If a Cash on Delivery order has not been shipped within 7 days of
              being placed, it is cancelled automatically.
            </li>
          </ul>
        </div>
      </PolicySection>

      <PolicySection id="delivery" title="Delivery">
        <ul className={list}>
          <li>
            We deliver across Kenya through third-party delivery providers.
            Availability and delivery times depend on your location.
          </li>

          <li>
            The delivery fee depends on your region. It is shown at checkout
            before you place your order, and it is included in your M-Pesa
            payment or in the cash you pay on delivery.
          </li>

          <li>
            We will tell you the expected delivery time when your order is
            confirmed, or through customer support.
          </li>

          <li>
            You are responsible for giving accurate contact and delivery
            details. Incorrect or incomplete details can delay your order.
          </li>

          <li>
            To deliver your order, we share your name, phone number and
            delivery address with our delivery provider.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="returns" title="Returns">
        <p>
          You can ask to return an item within{" "}
          <strong className="text-gray-900">7 days of receiving it</strong>.
          To qualify, the item should:
        </p>

        <ul className={list}>
          <li>be unused and in its original condition</li>
          <li>
            come with its original packaging and accessories, where they apply
          </li>
          <li>show no damage caused by misuse or improper handling</li>
        </ul>

        <p>
          <strong className="text-gray-900">
            Opened perfumes cannot be returned
          </strong>{" "}
          unless they are faulty or not what you ordered.
        </p>

        <p>
          Please contact us before sending anything back. We will review your
          request, explain how to return the item and whether any return costs
          apply, and check the item when it arrives before approving a refund
          or other solution.
        </p>
      </PolicySection>

      <PolicySection id="refunds" title="Refunds">
        <ul className={list}>
          <li>
            <strong className="text-gray-900">M-Pesa orders:</strong> Approved
            refunds are sent to the M-Pesa number used to pay. You can usually
            expect the money within 1 to 2 business days after the refund has
            been approved and started. The exact time can depend on M-Pesa
            processing.
          </li>

          <li>
            <strong className="text-gray-900">
              Cash on Delivery orders:
            </strong>{" "}
            Contact us with your order details and we will arrange a suitable
            way to refund you.
          </li>

          <li>
            <strong className="text-gray-900">Delivery fees:</strong> Delivery
            fees are refunded when a return is due to a faulty or damaged
            product, or an incorrect item delivered by Wanmart. For other
            returns, including change-of-mind returns or incorrect customer
            selections, the original delivery fee is non-refundable.
          </li>

          <li>
            Your order page shows the progress of your refund, from
            "Refund pending" to "Refunded", and we will also confirm with you
            by phone or WhatsApp. A refund is complete only once it has been
            sent.
          </li>
        </ul>
      </PolicySection>

      <PolicySection id="cancelling" title="Cancelling an order">
        <p>
          To cancel an order, contact us as soon as possible. If it has not
          been shipped yet, we cancel it, and if you have paid we refund you.
          Once an order has been shipped, please follow the returns process
          above.
        </p>
      </PolicySection>

      <PolicySection id="changes" title="Changes to these terms">
        <p>
          We may update these terms. The version on this page, with its date
          at the top, is the one that applies to new orders. Nothing in these
          terms limits the rights you have under Kenyan law.
        </p>
      </PolicySection>

      <PolicySection id="contact" title="Contact">
        <p>
          Questions about these terms or an order? See our{" "}
          <Link
            to="/contact"
            className="font-medium text-orange-600 transition-colors hover:text-orange-700 hover:underline"
          >
            contact page
          </Link>{" "}
          for our phone, WhatsApp and email, and our support hours.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
