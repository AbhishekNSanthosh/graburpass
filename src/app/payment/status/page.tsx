"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import PublicHeader from "@/widgets/common/PublicHeader";
import PublicFooter from "@/widgets/common/PublicFooter";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/configs/firebaseConfig";

function StatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("order_id");

  const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED">(
    "LOADING"
  );
  const [message, setMessage] = useState("Verifying your payment...");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

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
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/10">
      <PublicHeader />
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6">
        <div className="bg-white dark:bg-black rounded-3xl shadow-xl w-full max-w-md p-8 text-center border border-black/5 dark:border-white/10 animate-fade-in-up">
          {status === "LOADING" && (
            <div className="flex flex-col items-center py-10">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
              <h2 className="text-2xl font-black text-foreground mb-2">
                Processing Payment
              </h2>
              <p className="text-muted text-sm font-medium">{message}</p>
            </div>
          )}

          {status === "SUCCESS" && (
            <div className="flex flex-col items-center py-6">
              <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                <CheckCircle className="h-10 w-10 text-green-600 stroke-[1.5]" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">
                Payment Successful!
              </h2>
              <p className="text-muted mb-8 font-medium leading-relaxed">
                Your ticket has been booked successfully. You will receive a
                confirmation email shortly.
              </p>

              <div className="flex flex-col w-full gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard/attendee/my-bookings"
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
                  >
                    View My Tickets
                  </Link>
                ) : null}
                <Link
                  href="/"
                  className={`w-full font-bold py-3.5 rounded-xl transition-all ${
                    !isLoggedIn
                      ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                      : "bg-surface-1 text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}

          {status === "FAILED" && (
            <div className="flex flex-col items-center py-6">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100">
                <XCircle className="h-10 w-10 text-primary stroke-[1.5]" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">
                Payment Failed
              </h2>
              <p className="text-primary bg-primary/5 px-4 py-2 rounded-lg mb-8 text-sm font-bold border border-primary/10">
                {message}
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  Try Again
                </button>
                <Link
                  href="/contact"
                  className="text-muted hover:text-foreground text-sm mt-4 font-medium transition-colors"
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
