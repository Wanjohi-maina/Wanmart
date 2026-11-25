import { UserRound } from "lucide-react";
import { inputClass, labelClass, sectionClass } from "./checkoutUi";

type CustomerInformationProps = {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  submitting: boolean;
};

export default function CustomerInformation({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  submitting,
}: CustomerInformationProps) {
  return (
    <section className={sectionClass}>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <UserRound
              size={20}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>

          <div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Customer Information
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Enter your contact details.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full Name
          </label>

          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className={inputClass}
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
            className={inputClass}
            disabled={submitting}
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="phone" className={labelClass}>
            Phone Number
          </label>

          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0700 456 789"
            className={inputClass}
            disabled={submitting}
            required
          />

          <p className="mt-1.5 text-xs text-gray-500">
            Use a Safaricom number if you intend to pay with M-Pesa.
          </p>
        </div>
      </div>
    </section>
  );
}