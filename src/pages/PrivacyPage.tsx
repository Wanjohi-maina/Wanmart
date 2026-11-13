
import PolicyPage, { PolicySection } from "../components/PolicyPage";

const UPDATED = "13 November 2026";

const list = "list-disc space-y-2 pl-5 marker:text-orange-500";

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated={UPDATED}>
      <p>
        This page explains what personal information Wanmart collects, how we
        use it and who we share it with.
      </p>

      <PolicySection title="Information we collect">
        <p>
          We collect the information needed to take and deliver your order and
          to help you afterwards:
        </p>

        <ul className={list}>
          <li>Your full name, phone number and email address</li>
          <li>Your delivery address</li>
          <li>Your orders and what you bought</li>
          <li>
            Payment details such as the amount, your M-Pesa phone number and
            the transaction reference. We never see your M-Pesa PIN.
          </li>
          <li>Your email address, if you subscribe to our newsletter</li>
          <li>What you tell us when you contact customer support</li>
        </ul>
      </PolicySection>

      <PolicySection title="How we use your information">
        <ul className={list}>
          <li>To process and manage your orders and arrange delivery</li>
          <li>To start and check payments</li>
          <li>To handle returns, refunds and payment questions</li>
          <li>To send order updates and important service messages</li>
          <li>To send our newsletter, if you subscribed</li>
          <li>To give customer support</li>
          <li>To keep the shop secure and working properly</li>
        </ul>
      </PolicySection>

      <PolicySection title="Who we share it with">
        <p>
          We do not sell your personal information. We share it only with the
          services we need to run the shop and fulfil your order:
        </p>

        <ul className={list}>
          <li>
            <strong>Supabase,</strong> which provides our database and
            back-end services.
          </li>
          <li>
            <strong>Safaricom (M-Pesa),</strong> which processes M-Pesa
            payments.
          </li>
          <li>
            <strong>Delivery providers,</strong> who receive your name, phone
            number and delivery address so they can deliver your order.
          </li>
          <li>
            <strong>An email delivery service,</strong> which sends our order
            updates and newsletters for us.
          </li>
        </ul>

        <p>We share only what each service needs.</p>
      </PolicySection>

      <PolicySection title="Your browser">
        <p>
          We save your shopping cart, and a temporary code that lets you
          reopen your order, in your browser's storage so the shop works. We
          do not currently use advertising trackers.
        </p>
      </PolicySection>

      <PolicySection title="How long we keep it">
        <p>
          We keep order records for as long as needed for accounting and legal
          purposes. We keep other information only for as long as we need it
          for the purposes above. If you subscribe to our newsletter, we keep
          your email address until you unsubscribe.
        </p>
      </PolicySection>

      <PolicySection title="Your choices">
        <p>
          You can ask us for a copy of the information we hold about you, ask
          us to correct it, or ask us to delete it. Some order records we may
          have to keep for accounting or legal reasons. You can unsubscribe
          from the newsletter at any time.
        </p>

        <p>
          To make a request or raise a concern, email{" "}
          <a
            href="mailto:benmaina655@gmail.com"
            className="break-all font-medium text-orange-600 hover:text-orange-700 hover:underline"
          >
            benmaina655@gmail.com
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection title="Keeping it safe">
        <p>
          We use technical and organisational measures to protect your
          information from unauthorised access, misuse, loss or disclosure.
          Only authorised people can see customer orders. No online system is
          completely secure, so we cannot guarantee absolute security.
        </p>
      </PolicySection>

      <PolicySection title="Changes to this policy">
        <p>
          We may update this policy when our services or the way we handle
          information changes. The latest version is always on this page, with
          its date at the top.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
