import Header from "@/widgets/common/Header";
import Footer from "@/widgets/common/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="px-[5vw] py-16 pt-[14vh]">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">
          Refund & Cancellation Policy
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            This Refund & Cancellation Policy applies to <strong>GrabUrPass</strong>,
            a product of <strong>Beond Innovations</strong>, accessible at{" "}
            <a
              href="https://www.graburpass.com"
              className="text-primary underline"
            >
              www.graburpass.com
            </a>.
          </p>

          <h2 className="text-xl font-semibold">1. Ticket Purchases</h2>
          <p>
            All tickets purchased through GrabUrPass are subject to the refund
            and cancellation policy defined by the respective event organizer.
            GrabUrPass acts only as a technology platform and does not control
            event-specific refund decisions.
          </p>

          <h2 className="text-xl font-semibold">2. Event Cancellation</h2>
          <p>
            If an event is cancelled by the organizer, refunds (if applicable)
            will be processed according to the organizer’s policy. Refunds will
            be initiated to the original payment method used at the time of
            purchase.
          </p>

          <h2 className="text-xl font-semibold">3. User-Initiated Cancellation</h2>
          <p>
            If you choose to cancel your ticket, eligibility for a refund
            depends entirely on the event organizer’s cancellation and refund
            terms. Some tickets may be non-refundable.
          </p>

          <h2 className="text-xl font-semibold">4. Refund Processing Time</h2>
          <p>
            Approved refunds are processed via <strong>Razorpay</strong> and
            typically reflect in your bank account or original payment method
            within 5–7 business days, depending on your bank or payment provider.
          </p>

          <h2 className="text-xl font-semibold">5. Convenience & Platform Fees</h2>
          <p>
            Platform or convenience fees charged by GrabUrPass may be
            non-refundable unless explicitly stated otherwise.
          </p>

          <h2 className="text-xl font-semibold">6. Failed or Duplicate Payments</h2>
          <p>
            In case of failed transactions where the amount has been debited,
            the money is usually auto-refunded by Razorpay within 5–7 business
            days. For duplicate payments, please contact our support team.
          </p>

          <h2 className="text-xl font-semibold">7. Disputes</h2>
          <p>
            Any disputes regarding refunds should first be raised with the
            event organizer. GrabUrPass may assist in communication but is not
            responsible for final refund decisions.
          </p>

          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>
            If you have questions about this policy, contact us at:
            <br />
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
