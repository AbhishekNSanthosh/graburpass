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
  const [redirectLink, setRedirectLink] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

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

  // Fetch Event Details (for WhatsApp Link) when status is SUCCESS
  useEffect(() => {
    if (status === "SUCCESS" && orderId) {
      const fetchEventDetails = async () => {
        try {
          const { doc, getDoc } = await import("firebase/firestore");
          const { db } = await import("@/utils/configs/firebaseConfig");

          const orderRef = doc(db, "orders", orderId);
          const orderSnap = await getDoc(orderRef);
          if (orderSnap.exists()) {
            const orderData = orderSnap.data();
            if (orderData.eventId) {
              const eventRef = doc(db, "published_events", orderData.eventId);
              const eventSnap = await getDoc(eventRef);
              if (eventSnap.exists()) {
                const eventData = eventSnap.data();
                if (eventData) {
                  const link = eventData.redirectUrl || eventData.whatsappLink;
                  if (link) {
                    setRedirectLink(link);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch redirect link", e);
        }
      };
      fetchEventDetails();
    }
  }, [status, orderId]);

  // Handle Auto-Redirect Countdown
  useEffect(() => {
    if (redirectLink) {
      setRedirectCountdown(3); // Start 3s countdown
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = redirectLink;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [redirectLink]);

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

              {redirectLink && (
                <div className="w-full mb-3">
                  {redirectCountdown !== null && redirectCountdown > 0 ? (
                    <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center animate-pulse">
                      <div className="flex items-center gap-2 text-green-700 font-bold mb-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting you in {redirectCountdown}s...
                      </div>
                      <p className="text-xs text-green-600">
                        Please wait while we take you to the group/link.
                      </p>
                      <button
                        onClick={() => setRedirectCountdown(null)}
                        className="text-xs text-green-700 underline mt-2 hover:text-green-800"
                      >
                        Cancel Auto-Redirect
                      </button>
                    </div>
                  ) : null}

                  <a
                    href={redirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 hover:shadow-500/30 flex items-center justify-center gap-2"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                    Continue to Event / Group
                  </a>
                </div>
              )}

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
