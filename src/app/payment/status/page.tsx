"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import PublicHeader from "@/widgets/common/PublicHeader";
import PublicFooter from "@/widgets/common/PublicFooter";

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("order_id");

  const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED">(
    "LOADING"
  );
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    if (!orderId) {
      setStatus("FAILED");
      setMessage("Invalid Order ID");
      return;
    }

    const verifyPayment = async () => {
      try {
        // Poll for a few seconds or just one check?
        // Let's do one check, if pending, maybe retry or show pending message.
        // For better UX, we can retry 3 times.

        let attempts = 0;
        const maxAttempts = 3;

        const checkStatus = async () => {
          const res = await fetch(`/api/payment/verify?order_id=${orderId}`);
          const data = await res.json();

          if (data.status === "SUCCESS") {
            setStatus("SUCCESS");
            setMessage("Payment Successful!");
          } else if (data.status === "FAILED") {
            setStatus("FAILED");
            setMessage(data.failureReason || "Payment Failed");
          } else {
            // Pending
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(checkStatus, 2000); // Retry after 2s
            } else {
              setStatus("FAILED"); // Or a specialized PENDING state
              setMessage(
                "Payment processing is taking longer than expected. Please check your email for confirmation."
              );
            }
          }
        };

        checkStatus();
      } catch (error) {
        setStatus("FAILED");
        setMessage("Something went wrong while verifying payment.");
      }
    };

    verifyPayment();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />
      <main className="flex-grow flex items-center justify-center pt-20 pb-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center ring-1 ring-gray-900/5">
          {status === "LOADING" && (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="h-16 w-16 text-green-600 animate-spin mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Processing Payment
              </h2>
              <p className="text-gray-500">{message}</p>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="flex flex-col items-center py-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-500 mb-8">
                Your ticket has been booked successfully. You will receive a
                confirmation email shortly.
              </p>

              <div className="flex flex-col w-full gap-3">
                <Link
                  href="/dashboard/attendee/my-bookings"
                  className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 transition"
                >
                  View My Tickets
                </Link>
                <Link
                  href="/"
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}

          {status === "FAILED" && (
            <div className="flex flex-col items-center py-6">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-red-500 bg-red-50 px-4 py-2 rounded-lg mb-8">
                {message}
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition"
                >
                  Try Again
                </button>
                <Link
                  href="/contact"
                  className="text-gray-500 hover:text-gray-700 text-sm mt-4"
                >
                  Report an issue
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatusContent />
    </Suspense>
  );
}
