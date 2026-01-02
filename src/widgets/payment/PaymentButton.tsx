"use client";

import { useEffect, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import toast from "react-hot-toast";
import { auth } from "@/utils/configs/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
  amount: number;
  eventId: string;
  eventName: string;
}

const PaymentButton = ({ amount, eventId, eventName }: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to book a ticket");
      router.push("/login"); // or open login modal
      return;
    }

    setLoading(true);
    try {
      const cashfree = await load({
        mode: "sandbox", // Change to "production" when live
      });

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          customerId: user.uid,
          customerName: user.displayName || "User",
          customerEmail: user.email || "no-email@example.com",
          customerPhone: user.phoneNumber || "9999999999", // Cashfree requires phone
          eventId: eventId,
          eventName: eventName
        }),
      });

      const data = await res.json();

      if (data.payment_session_id) {
        const checkoutOptions = {
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_modal" as const,
          appearance: {
            theme: {
              color: "#fc0630",
            },
          },
        };

        cashfree.checkout(checkoutOptions).then((result: any) => {
            if(result.error){
                // User dropped or failed
                console.log("User dropped payment or error occured", result.error);
                toast.error("Payment Cancelled");
            } else if(result.redirect){
                // SDK says it's redirecting, but user says it fails.
                // We will manually force a redirect to our status page just in case.
                console.log("Payment initiated, redirecting to status...");
                router.push(`/payment/status?order_id=${data.order_id}`);
            } else if(result.paymentDetails) {
                 // Success without redirect flag? Redirect anyway.
                 console.log("Payment complete, redirecting...", result.paymentDetails);
                 router.push(`/payment/status?order_id=${data.order_id}`);
            } else {
                 // Fallback catch-all: if promises resolves without error, assume something happened that warrants a check.
                  console.log("Checkout finished, checking status...");
                  router.push(`/payment/status?order_id=${data.order_id}`);
            }
        });
      } else {
        console.error("Payment Session creation failed:", data);
        toast.error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
        {!user && (
            <p className="text-xs text-center text-gray-500 mb-2">
                * You must be logged in to book
            </p>
        )}
        <button
        onClick={handlePayment}
        disabled={loading}
        className="group relative flex items-center justify-center gap-2 w-full bg-red-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
        {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
            <>
            {user ? "Book Now" : "Login to Book"}
            <span className="group-hover:translate-x-1 transition-transform">
                →
            </span>
            </>
        )}
        </button>
    </div>
  );
};

export default PaymentButton;