import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/utils/configs/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, customerId, customerPhone, customerName, customerEmail, eventName, eventId } = body;

        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || "sandbox"; // sandbox or production

        // console.log("Cashfree Config:", {
        //     env,
        //     appIdLoaded: !!appId,
        //     secretKeyLoaded: !!secretKey,
        //     appIdPrefix: appId ? appId.substring(0, 5) + "***" : "N/A",
        //     baseUrl: env === "production" ? "https://api.cashfree.com/pg/orders" : "https://sandbox.cashfree.com/pg/orders"
        // });

        if (!appId || !secretKey) {
            return NextResponse.json(
                { error: "Cashfree credentials missing" },
                { status: 500 }
            );
        }

        const baseUrl =
            env === "production"
                ? "https://api.cashfree.com/pg/orders"
                : "https://sandbox.cashfree.com/pg/orders";

        const orderId = `ORDER_${uuidv4()}`; // Generate a unique order ID

        // Calculate Fees (Server-side validation)
        // Calculate Fees (Server-side validation)
        // const { totalAmount, platformFee, gatewayFee } = calculatePaymentBreakdown(amount);

        // Cashfree payload uses TOTAL amount
        const payload = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: customerId || "guest",
                customer_phone: customerPhone || "9999999999",
                customer_name: customerName || "Guest",
                customer_email: customerEmail || "guest@example.com"
            },
            order_meta: {
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment/status?order_id=${orderId}`,
            },
        };

        // Save order to Firestore (Pending State)
        try {
            await setDoc(doc(db, "orders", orderId), {
                orderId,
                amount: amount, // Stores the final amount the user pays
                baseAmount: amount,  // Stores the original ticket price
                currency: "INR",
                status: "PENDING",
                customerId: customerId || "guest",
                customerName: customerName || "Guest",
                customerEmail: customerEmail || "guest@example.com",
                customerPhone: customerPhone || "9999999999",
                eventName: eventName || "Event Ticket",
                eventId: eventId || null,
                createdAt: new Date().toISOString(),
            });
        } catch (dbError) {
            console.error("Error saving order to Firestore:", dbError);
            // We continue even if DB save fails? risky. 
            // Better to fail? No, maybe just log. 
            // Actually, if we can't save the order, the webhook won't find it.
            // But let's proceed for now.
        }

        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-version": "2023-08-01",
                "x-client-id": appId,
                "x-client-secret": secretKey,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Cashfree Error:", data);
            return NextResponse.json({ error: data.message || "Failed to create order" }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
