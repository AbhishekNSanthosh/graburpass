import Header from "@/widgets/common/Header";
import Footer from "@/widgets/common/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="px-[5vw] py-16 pt-[14vh]">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Terms & Conditions
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            These Terms & Conditions (“Terms”) govern your use of{" "}
            <strong>GrabUrPass</strong>, a product of{" "}
            <strong>Beond Innovations</strong>, accessible at{" "}
            <a
              href="https://www.graburpass.com"
              className="text-primary underline"
            >
              www.graburpass.com
            </a>
            . By accessing or using our platform, you agree to be bound by these
            Terms.
          </p>

          <h2 className="text-xl font-semibold">1. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Platform</strong> refers to GrabUrPass website and services
            </li>
            <li>
              <strong>User</strong> refers to anyone accessing or using the
              platform
            </li>
            <li>
              <strong>Organizer</strong> refers to individuals or entities
              hosting events
            </li>
          </ul>

          <h2 className="text-xl font-semibold">2. Eligibility</h2>
          <p>
            You must be at least 18 years old to use this platform. By using
            GrabUrPass, you confirm that you meet this requirement.
          </p>

          <h2 className="text-xl font-semibold">3. Services</h2>
          <p>
            GrabUrPass provides a digital ticketing and event management
            platform. We act as an intermediary between event organizers and
            users and do not organize events ourselves.
          </p>

          <h2 className="text-xl font-semibold">4. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain confidentiality of your account</li>
            <li>Not misuse the platform for illegal or harmful activities</li>
          </ul>

          <h2 className="text-xl font-semibold">5. Payments</h2>
          <p>
            All payments are processed securely through{" "}
            <strong>Razorpay</strong>. GrabUrPass does not store your card or
            banking details. Transaction success depends on the payment gateway
            and your bank.
          </p>

          <h2 className="text-xl font-semibold">6. Refunds & Cancellations</h2>
          <p>
            Refunds and cancellations are governed by the event organizer’s
            policy. GrabUrPass is not responsible for refund decisions unless
            explicitly stated.
          </p>

          <h2 className="text-xl font-semibold">7. Intellectual Property</h2>
          <p>
            All content, branding, logos, and software on GrabUrPass are the
            intellectual property of Beond Innovations and may not be reused
            without permission.
          </p>

          <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
          <p>
            GrabUrPass shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of the platform,
            including event cancellations or disputes with organizers.
          </p>

          <h2 className="text-xl font-semibold">9. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms without prior notice.
          </p>

          <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the platform
            constitutes acceptance of the revised Terms.
          </p>

          <h2 className="text-xl font-semibold">11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of India.
          </p>

          <h2 className="text-xl font-semibold">12. Contact Information</h2>
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
