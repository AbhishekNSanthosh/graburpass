import { NextResponse } from "next/server";
import { db } from "@/utils/configs/firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp");
    const signature = req.headers.get("x-webhook-signature");

    if (!timestamp || !signature) {
      return NextResponse.json({ error: "Missing headers" }, { status: 400 });
    }

    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!secretKey) {
      console.error("Cashfree secret key missing");
      return NextResponse.json({ error: "Server config error" }, { status: 500 });
    }

    // Verify Signature
    // signature = base64(hmac_sha256(timestamp + rawBody, secretKey))
    const dataToSign = timestamp + rawBody;
    const computedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(dataToSign)
      .digest("base64");

    if (computedSignature !== signature) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const type = event.type;

    console.log("Webhook received:", type, event.data?.order?.order_id);

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = event.data.order.order_id;
      const paymentId = event.data.payment.cf_payment_id;
      
      const orderRef = doc(db, "orders", orderId);
      
      // Check if order exists (optional, updateDoc fails if not exists)
      const orderSnap = await getDoc(orderRef);
      if (orderSnap.exists()) {
          await updateDoc(orderRef, {
            status: "SUCCESS",
            paymentId: paymentId,
            paidAt: new Date().toISOString(),
            webhookReceived: true
          });
          console.log(`Order ${orderId} updated to SUCCESS`);
      } else {
          console.warn(`Order ${orderId} not found in DB`);
      }
    } else if (type === "PAYMENT_FAILED_WEBHOOK") {
       const orderId = event.data.order.order_id;
       const orderRef = doc(db, "orders", orderId);
       const orderSnap = await getDoc(orderRef);
       if (orderSnap.exists()) {
          await updateDoc(orderRef, {
            status: "FAILED",
            failureReason: event.data.payment.payment_message || "Unknown",
            updatedAt: new Date().toISOString()
          });
          console.log(`Order ${orderId} updated to FAILED`);
       }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
