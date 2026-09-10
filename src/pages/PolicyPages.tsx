import { ReactNode } from 'react';

export function PolicyLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-cream py-16 md:py-24 px-4 md:px-8 text-center">
        <p className="text-[10px] tracking-wider-luxe uppercase text-silver-dark mb-4">SILVER LEAGUE</p>
        <h1 className="font-display text-4xl md:text-6xl text-burgundy-dark mb-2">{title}</h1>
        {subtitle && <p className="text-burgundy-dark/60 text-sm">{subtitle}</p>}
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16">
        <div className="prose prose-lg max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ShippingPage() {
  return (
    <PolicyLayout title="Shipping & Delivery" subtitle="Last updated: September 2026">
      <PolicySection title="Shipping Within Nigeria">
        <p>We deliver to all states across Nigeria. Orders are processed within 24 hours of placement, excluding weekends and public holidays.</p>
      </PolicySection>
      <PolicySection title="Lagos Delivery">
        <p><strong>Delivery time:</strong> 1–2 business days</p>
        <p><strong>Cost:</strong> ₦7,000</p>
        <p>Orders within Lagos are dispatched same-day if placed before 12pm.</p>
      </PolicySection>
      <PolicySection title="Nationwide Nigeria Delivery">
        <p><strong>Delivery time:</strong> 2–5 business days</p>
        <p><strong>Cost:</strong> ₦10,000</p>
        <p>Delivery to all states outside Lagos. Remote areas may take the full 5 business days.</p>
      </PolicySection>
      <PolicySection title="Free Delivery Within Nigeria">
        <p>Enjoy free delivery on all orders above ₦500,000 delivered within Nigeria. The discount is automatically applied at checkout.</p>
      </PolicySection>
      <PolicySection title="Worldwide Shipping">
        <p><strong>Delivery time:</strong> 1–14 days</p>
        <p><strong>Cost:</strong> Variable pricing based on destination</p>
        <p>We ship internationally. Shipping costs are calculated based on your location and will be confirmed with you via WhatsApp after your order is placed. Customs duties and taxes are the responsibility of the recipient.</p>
      </PolicySection>
      <PolicySection title="Order Tracking">
        <p>Once your order has been dispatched, you will receive a WhatsApp message containing your tracking details. You can track your shipment through the carrier's platform.</p>
      </PolicySection>
      <PolicySection title="Delivery Issues">
        <p>If your order does not arrive within the estimated timeframe, or arrives damaged, please contact us on WhatsApp at +234 901 048 0020 or email <a href="mailto:hello@silverleague.co" className="text-burgundy underline">hello@silverleague.co</a> within 24 hours of the expected delivery date.</p>
      </PolicySection>
    </PolicyLayout>
  );
}

export function ReturnsPage() {
  return (
    <PolicyLayout title="Returns & Exchanges" subtitle="Last updated: September 2026">
      <PolicySection title="Return Window">
        <p>Returns are accepted within <strong>24 hours of delivery</strong>. Please inspect your order immediately upon receipt and contact us promptly if there is an issue.</p>
      </PolicySection>
      <PolicySection title="Condition Requirements">
        <p>To be eligible for a return, items must be:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Unworn</li>
          <li>In perfect condition</li>
          <li>All tags intact and attached</li>
          <li>Unscented (free from perfume, deodorant, or other fragrances)</li>
        </ul>
      </PolicySection>
      <PolicySection title="No Refunds">
        <p>SILVER LEAGUE does not offer monetary refunds. Approved returns will be handled as exchanges or store credit only.</p>
      </PolicySection>
      <PolicySection title="Exchanges for Wrong Items">
        <p>If you received the wrong item, it can be exchanged after confirmation. Please contact us on WhatsApp at +234 901 048 0020 or email <a href="mailto:hello@silverleague.co" className="text-burgundy underline">hello@silverleague.co</a> with your order number and a photo of the item received. Once confirmed, we will arrange the exchange.</p>
      </PolicySection>
      <PolicySection title="Exchanges for Damaged Items">
        <p>If your item arrived damaged, it can be exchanged after confirming that the damage was caused by SILVER LEAGUE. Please send photos of the damaged item and its packaging via WhatsApp or email <a href="mailto:hello@silverleague.co" className="text-burgundy underline">hello@silverleague.co</a> within 24 hours of delivery. Once confirmed, we will arrange a replacement at no additional cost to you.</p>
      </PolicySection>
      <PolicySection title="No Exchanges for Normal Returns">
        <p>Standard returns (items that do not fit or are no longer wanted) are not eligible for exchanges. These will be processed as store credit only.</p>
      </PolicySection>
      <PolicySection title="How to Initiate a Return">
        <p>Contact us on WhatsApp at <strong>+234 901 048 0020</strong> or email <a href="mailto:hello@silverleague.co" className="text-burgundy underline">hello@silverleague.co</a> with your order number and the reason for return. Our team will guide you through the process and provide return instructions within 24 hours.</p>
      </PolicySection>
    </PolicyLayout>
  );
}

export function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy" subtitle="Last updated: September 2026">
      <PolicySection title="Information We Collect">
        <p>We collect information you provide directly to us, including your name, phone number, and shipping address when you place an order or contact us via WhatsApp.</p>
      </PolicySection>
      <PolicySection title="How We Use Your Information">
        <p>Your information is used to process orders, communicate with you about your purchases, provide customer support, and send marketing communications (with your consent). We do not sell your personal information to third parties.</p>
      </PolicySection>
      <PolicySection title="Data Security">
        <p>We implement industry-standard security measures to protect your personal information. We do not store full payment card details on our servers.</p>
      </PolicySection>
      <PolicySection title="Cookies">
        <p>Our website uses cookies to enhance your browsing experience, remember your preferences, and analyse site traffic. You can disable cookies through your browser settings, though some features may not function properly.</p>
      </PolicySection>
      <PolicySection title="Your Rights">
        <p>You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us on WhatsApp at +234 901 048 0020 or email <a href="mailto:hello@silverleague.co" className="text-burgundy underline">hello@silverleague.co</a>.</p>
      </PolicySection>
      <PolicySection title="Third-Party Services">
        <p>We use trusted third-party services for payment processing, shipping, and analytics. These providers have their own privacy policies governing the use of your information.</p>
      </PolicySection>
    </PolicyLayout>
  );
}

export function TermsPage() {
  return (
    <PolicyLayout title="Terms & Conditions" subtitle="Last updated: September 2026">
      <PolicySection title="Acceptance of Terms">
        <p>By accessing and using the SILVER LEAGUE website at silverleague.co, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our website.</p>
      </PolicySection>
      <PolicySection title="Products & Pricing">
        <p>All products are subject to availability. We reserve the right to modify or discontinue any product without notice. Prices are listed in Nigerian Naira (₦) and are subject to change. We make every effort to display colours and product details accurately, but cannot guarantee exact representation.</p>
      </PolicySection>
      <PolicySection title="Orders">
        <p>All orders are subject to acceptance and confirmation. We reserve the right to refuse or cancel any order at our discretion. Payment is arranged via WhatsApp after your order is placed.</p>
      </PolicySection>
      <PolicySection title="Returns">
        <p>Returns are accepted within 24 hours of delivery. Items must be unworn, in perfect condition, with tags intact and unscented. No refunds are offered. Please refer to our Returns & Exchanges page for full details.</p>
      </PolicySection>
      <PolicySection title="Intellectual Property">
        <p>All content on this website, including images, text, logos, and designs, is the property of SILVER LEAGUE and is protected by intellectual property laws. No content may be reproduced without our written permission.</p>
      </PolicySection>
      <PolicySection title="Limitation of Liability">
        <p>SILVER LEAGUE shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the value of your purchase.</p>
      </PolicySection>
      <PolicySection title="Governing Law">
        <p>These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the appropriate jurisdiction.</p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>For questions regarding these Terms and Conditions, please contact us on WhatsApp at +234 901 048 0020 or email <a href="mailto:hello@silverleague.co" className="text-burgundy underline">hello@silverleague.co</a>.</p>
      </PolicySection>
    </PolicyLayout>
  );
}

function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-display text-xl text-burgundy-dark mb-3">{title}</h2>
      <div className="text-burgundy-dark/70 text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
