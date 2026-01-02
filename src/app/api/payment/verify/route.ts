import { NextResponse } from "next/server";
import { db } from "@/utils/configs/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID missing" }, { status: 400 });
    }

    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = orderSnap.data();

    // Helper to return consistent response with event details
    const returnWithEventDetails = (status: string, message?: string, extra?: any) => {
      return NextResponse.json({
        status,
        message,
        order: {
          ...orderData,
          // Ensure these are explicitly available at top level if needed, 
          // though they are in orderData already.
          eventId: orderData.eventId,
          eventName: orderData.eventName
        },
        ...extra
      });
    };

    // If already SUCCESS or FAILED, return immediately
    if (orderData.status === "SUCCESS" || orderData.status === "FAILED") {
      return returnWithEventDetails(orderData.status);
    }

    // If PENDING, check with Cashfree
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "sandbox";
    
    const baseUrl = env === "production" 
        ? "https://api.cashfree.com/pg/orders" 
        : "https://sandbox.cashfree.com/pg/orders";

    const response = await fetch(`${baseUrl}/${orderId}/payments`, {
        method: 'GET',
        headers: {
            "x-api-version": "2023-08-01",
            "x-client-id": appId!,
            "x-client-secret": secretKey!,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        // If API fails, return current status (likely PENDING)
        // But logging the error is important
        const errorData = await response.json();
        console.error("Cashfree Verification Failed:", errorData);
      return returnWithEventDetails(orderData.status, "Verification failed, try again");
    }

    const payments = await response.json();
    
    // Look for a successful payment
    const successPayment = payments.find((p: any) => p.payment_status === "SUCCESS");

    if (successPayment) {
        // Update Firestore
        await updateDoc(orderRef, {
            status: "SUCCESS",
            paymentId: successPayment.cf_payment_id,
            paidAt: new Date().toISOString(),
            verifiedByApi: true
        });
      return returnWithEventDetails("SUCCESS");
    } 
    
    // Check for failure or user drop
    const failedPayment = payments.find((p: any) => p.payment_status === "FAILED" || p.payment_status === "USER_DROPPED");
    if (failedPayment) {
      const reason = failedPayment.payment_message || (failedPayment.payment_status === "USER_DROPPED" ? "Transaction Cancelled by User" : "Payment Failed");
         await updateDoc(orderRef, {
            status: "FAILED",
           failureReason: reason,
            updatedAt: new Date().toISOString()
        });
      return returnWithEventDetails("FAILED", reason);
    }

    return returnWithEventDetails("PENDING");

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
