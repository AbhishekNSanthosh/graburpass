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
  bookingData?: any;
  guestMode?: boolean;
}

const PaymentButton = ({ amount, eventId, eventName, bookingData, guestMode = false }: PaymentButtonProps) => {
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
    // Auth Check (skipped if guestMode)
    if (!guestMode && !user) {
      toast.error("Please login to book a ticket");
      router.push("/login"); // or open login modal
      return;
    }
    
    // If guest mode, validate essential booking data
    if (guestMode && bookingData) {
        // Simple check if we have minimal details from registration form
        // We assume parent component validates 'required' fields
        // We try to extract best-guess customer info from the dynamic form map
        // Common keys: 'name', 'Name', 'email', 'Email', 'phone', 'Phone', 'mobile'
    }

    setLoading(true);
    try {
      const cashfree = await load({
        mode: "sandbox", // Change to "production" when live
      });
      
      // Determine Customer Details
      let customerId = user ? user.uid : `guest_${Date.now()}`;
      let customerName = user ? (user.displayName || "User") : "Guest";
      let customerEmail = user ? (user.email || "no-email@example.com") : "guest@example.com";
      let customerPhone = user ? (user.phoneNumber || "9999999999") : "9999999999";

      if (guestMode && bookingData?.registrationData) {
          const reg = bookingData.registrationData;
          // Try to find fields case-insensitively or by common IDs
          // Heuristic search for name/email/phone in the form data values
          const findVal = (keys: string[]) => {
              const key = Object.keys(reg).find(k => keys.some(search => k.toLowerCase().includes(search)));
              return key ? reg[key] : null;
          };

          customerName = findVal(['name', 'full name', 'fullname']) || customerName;
          customerEmail = findVal(['email', 'e-mail']) || customerEmail;
          customerPhone = findVal(['phone', 'mobile', 'cell', 'contact']) || customerPhone;
      }

      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          customerId: customerId,
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          eventId: eventId,
          eventName: eventName,
          metaData: bookingData // Pass full booking context
        }),
      });

      const data = await res.json();

      if (data.payment_session_id) {
        const checkoutOptions = {
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self" as const, 
        };
        
        cashfree.checkout(checkoutOptions);
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
        {!guestMode && !user && (
            <p className="text-xs text-center text-gray-500 mb-2">
                * You must be logged in to book
            </p>
        )}
        <button
        onClick={handlePayment}
        disabled={loading}
        className="group relative flex items-center justify-center gap-2 w-full text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#eb0028]/20"
        style={{ backgroundColor: '#eb0028' }}
        >
        {loading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
        ) : (
            <>
            {guestMode ? "Pay & Book" : (user ? "Book Now" : "Login to Book")}
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