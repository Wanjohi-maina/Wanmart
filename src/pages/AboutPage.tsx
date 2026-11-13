
import { Store } from "lucide-react";
import PolicyPage, { PolicySection } from "../components/PolicyPage";

export default function AboutPage() {
  return (
    <PolicyPage title="About Wanmart">
      <PolicySection
        title="Who we are"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Store size={20} />
          </span>

          <p>
            At Wanmart, we make online shopping simple and convenient by
            bringing a variety of quality products together in one place. We
            offer a range of products, including electronics, clothing,
            footwear, watches, and accessories, with a focus on providing a
            smooth and reliable shopping experience. Our goal is to make
            finding and ordering everyday essentials easier for customers
            across Kenya.
          </p>
        </div>
      </PolicySection>
    </PolicyPage>
  );
}
