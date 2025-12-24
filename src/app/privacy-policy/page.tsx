import Header from "@/widgets/common/Header";
import Footer from "@/widgets/common/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="px-[5vw] py-16  mt-[10vh]">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to <strong>GrabUrPass</strong> (“we”, “our”, “us”), a product
            of <strong>Beond Innovations</strong>. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you use our website{" "}
            <a
              href="https://www.graburpass.com"
              className="text-primary underline"
            >
              www.graburpass.com
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email address, and phone number</li>
            <li>Event booking and ticket details</li>
            <li>Payment-related information processed securely via Razorpay</li>
            <li>Device, browser, and usage analytics</li>
          </ul>

          <h2 className="text-xl font-semibold">2. Payments</h2>
          <p>
            All payments are securely processed through{" "}
            <strong>Razorpay</strong>. We do not store or process your card
            details, UPI IDs, or net banking credentials on our servers.
          </p>

          <h2 className="text-xl font-semibold">
            3. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process ticket bookings and payments</li>
            <li>To send confirmations and event updates</li>
            <li>To provide customer support</li>
            <li>To prevent fraud and unauthorized access</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="text-xl font-semibold">4. Data Sharing</h2>
          <p>
            We do not sell or rent your personal information. Data may be shared
            only with payment partners (Razorpay), event organizers, or legal
            authorities when required by law.
          </p>

          <h2 className="text-xl font-semibold">5. Data Security</h2>
          <p>
            We use industry-standard security measures to protect your data.
            However, no online transmission is completely secure.
          </p>

          <h2 className="text-xl font-semibold">6. Cookies</h2>
          <p>
            We may use cookies to enhance user experience and analyze traffic.
            You can disable cookies through your browser settings.
          </p>

          <h2 className="text-xl font-semibold">7. Refunds & Cancellations</h2>
          <p>
            Refunds are subject to the event organizer’s policy and Razorpay’s
            processing timelines.
          </p>

          <h2 className="text-xl font-semibold">8. Children’s Privacy</h2>
          <p>
            GrabUrPass does not knowingly collect personal information from
            individuals under the age of 18.
          </p>

          <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Updates will be
            reflected on this page.
          </p>

          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p>
            <strong>Beond Innovations</strong>
            <br />
            Product: GrabUrPass
            <br />
            Email: reach.abhisheksanthosh@gmail.com
            <br />
            Location: Kerala, India
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
