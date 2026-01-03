"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import { getAuth } from "firebase/auth";
import toast from "react-hot-toast";
import {
  Loader2,
  ArrowLeft,
  Ticket,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PaymentButton from "../payment/PaymentButton";
import { calculatePaymentBreakdown } from "@/utils/paymentUtils";

// HELPER: Format Time to AM/PM
const formatTime = (timeStr?: string) => {
  if (!timeStr) return "";
  // If already contains AM/PM, return as is (normalized uppercase)
  if (timeStr.match(/(am|pm)/i)) return timeStr.toUpperCase();

  const [hours, minutes] = timeStr.split(":");
  if (hours === undefined || isNaN(Number(hours))) return timeStr;

  const h = Number(hours);
  const m = minutes || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

// TYPES
interface RegistrationField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "textarea" | "select";
  required: boolean;
  options?: string[];
}

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  enableBulkTicketing?: boolean;
  minBookingPerOrder?: number;
  maxBookingPerOrder?: number;
  requireAttendeeDetails?: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  price: number;
  posterUrl?: string;
  registrationFields: RegistrationField[];
  ticketTypes: TicketType[];
  registrationOpen?: boolean;
  redirectUrl?: string | null;
}

export default function EventBookingWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slugId = params?.slugId as string;
  const eventId = slugId?.split("--").pop();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [attendeesData, setAttendeesData] = useState<
    Record<number, Record<string, any>>
  >({});
  const [totalPrice, setTotalPrice] = useState(0);

  // Loading States
  const [validating, setValidating] = useState(false);

  // Success State
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Load Event Data
  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const ref = doc(db, "published_events", eventId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          toast.error("Event not found");
          router.push("/events");
          return;
        }

        const data = snap.data();

        // 🔹 Date
        const eventDate = data.date?.toDate?.().toISOString() ?? data.date;
        const startTime = data.startTime ?? data.time?.split("-")[0]?.trim();
        const endTime = data.endTime ?? data.time?.split("-")[1]?.trim();

        setEvent({
          id: snap.id,
          name: data.name,
          date: eventDate,
          startTime,
          endTime,
          venue:
            data.locationType === "offline"
              ? data.venueAddress
              : "Online Event",
          location:
            data.locationType === "online"
              ? data.onlineLink
              : data.venueAddress,
          price: data.price ?? 0,
          posterUrl: data.posterUrl,
          registrationFields: data.registrationFields || [],
          ticketTypes: data.ticketTypes || [],
          registrationOpen: data.registrationOpen,
          redirectUrl: data.redirectUrl || data.whatsappLink || null, // Fetch Redirect URL
        });

        // 🛑 Check Registration Status
        if (data.registrationOpen === false) {
          toast.error("Registration is closed for this event");
          router.push(`/events/${slugId}`);
          return;
        }

        // Default to first ticket type if available
        if (data.ticketTypes && data.ticketTypes.length > 0) {
          const paramIdx = searchParams?.get("ticketIdx");
          const defaultIdx =
            paramIdx &&
            !isNaN(Number(paramIdx)) &&
            data.ticketTypes[Number(paramIdx)]
              ? Number(paramIdx)
              : 0;

          setSelectedTicketIndex(defaultIdx);
          const initialQty =
            data.ticketTypes[defaultIdx]?.minBookingPerOrder || 1;
          setTicketQuantity(initialQty);
          updatePrice(defaultIdx, initialQty, data.ticketTypes);
        } else {
          setTotalPrice(data.price ?? 0);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, searchParams]);

  const updatePrice = (index: number, qty: number, tickets: TicketType[]) => {
    if (tickets[index]) {
      setTotalPrice(tickets[index].price * qty);
    }
  };

  const handleTicketChange = (index: number) => {
    setSelectedTicketIndex(index);
    if (event?.ticketTypes) {
      const newTicket = event.ticketTypes[index];
      const initialQty = newTicket?.minBookingPerOrder || 1;
      setTicketQuantity(initialQty);
      updatePrice(index, initialQty, event.ticketTypes);
    }
  };

  const handleQuantityChange = (qty: number) => {
    const selectedTicket = event?.ticketTypes?.[selectedTicketIndex];
    if (!selectedTicket) return;

    const min = selectedTicket.minBookingPerOrder || 1;
    const max =
      selectedTicket.maxBookingPerOrder || selectedTicket.quantity || 100;

    if (qty < min || qty > max) return;

    setTicketQuantity(qty);
    if (event?.ticketTypes) {
      updatePrice(selectedTicketIndex, qty, event.ticketTypes);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleAttendeeInputChange = (
    attendeeIndex: number,
    fieldId: string,
    value: any
  ) => {
    setAttendeesData((prev) => ({
      ...prev,
      [attendeeIndex]: {
        ...(prev[attendeeIndex] || {}),
        [fieldId]: value,
      },
    }));
  };

  // Validate unique emails for bulk ticketing
  const validateUniqueEmails = (): boolean => {
    const selectedTicket = event?.ticketTypes?.[selectedTicketIndex];

    // Only validate if bulk ticketing is enabled and we have multiple tickets
    if (
      !selectedTicket?.enableBulkTicketing ||
      !selectedTicket?.requireAttendeeDetails ||
      ticketQuantity <= 1
    ) {
      return true;
    }

    // Find email field(s)
    const emailFields =
      event?.registrationFields?.filter(
        (field) =>
          field.type === "email" || field.id.toLowerCase().includes("email")
      ) || [];

    if (emailFields.length === 0) return true; // No email fields to validate

    const emails: string[] = [];

    // Collect email from main form (Attendee 1)
    emailFields.forEach((field) => {
      const email = formData[field.id];
      if (email && email.trim()) {
        emails.push(email.trim().toLowerCase());
      }
    });

    // Collect emails from additional attendees (starting from index 1)
    for (let i = 1; i < ticketQuantity; i++) {
      emailFields.forEach((field) => {
        const email = attendeesData[i]?.[field.id];
        if (email && email.trim()) {
          emails.push(email.trim().toLowerCase());
        }
      });
    }

    // Check for duplicates
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      toast.error("Each attendee must have a unique email address");
      return false;
    }

    return true;
  };

  // Validate mobile numbers are 10 digits
  const validateMobileNumbers = (): boolean => {
    // Find phone/mobile fields
    const phoneFields =
      event?.registrationFields?.filter(
        (field) =>
          field.type === "tel" ||
          field.id.toLowerCase().includes("phone") ||
          field.id.toLowerCase().includes("mobile") ||
          field.label.toLowerCase().includes("phone") ||
          field.label.toLowerCase().includes("mobile")
      ) || [];

    if (phoneFields.length === 0) return true; // No phone fields to validate

    // Validate main form (Attendee 1)
    for (const field of phoneFields) {
      const phone = formData[field.id];
      if (phone && phone.trim()) {
        const digits = phone.replace(/\D/g, ""); // Remove non-digits
        if (digits.length !== 10) {
          toast.error(
            `Mobile number must be exactly 10 digits (Attendee 1: ${field.label})`
          );
          return false;
        }
      }
    }

    // Validate additional attendees (if bulk ticketing)
    const selectedTicket = event?.ticketTypes?.[selectedTicketIndex];
    if (
      selectedTicket?.enableBulkTicketing &&
      selectedTicket?.requireAttendeeDetails &&
      ticketQuantity > 1
    ) {
      for (let i = 1; i < ticketQuantity; i++) {
        for (const field of phoneFields) {
          const phone = attendeesData[i]?.[field.id];
          if (phone && phone.trim()) {
            const digits = phone.replace(/\D/g, "");
            if (digits.length !== 10) {
              toast.error(
                `Mobile number must be exactly 10 digits (Attendee ${i + 1}: ${
                  field.label
                })`
              );
              return false;
            }
          }
        }
      }
    }

    return true;
  };

  // Combined validation for payment flow
  const validateBeforePayment = async (): Promise<boolean> => {
    if (!validateMinBooking()) return false;
    if (!validateUniqueEmails()) return false;
    if (!validateMobileNumbers()) return false;

    // Check for duplicate registrations (async)
    const isDuplicate = await checkDuplicateRegistration();
    if (!isDuplicate) return false;

    // Check ticket availability (async, real-time)
    const isAvailable = await checkTicketAvailability();
    return isAvailable;
  };

  // Validate minimum booking quantity
  const validateMinBooking = (): boolean => {
    const selectedTicket = event?.ticketTypes?.[selectedTicketIndex];
    if (!selectedTicket) return true;

    const minRequired = selectedTicket.minBookingPerOrder || 1;

    if (ticketQuantity < minRequired) {
      toast.error(
        `Minimum ${minRequired} ticket${
          minRequired > 1 ? "s" : ""
        } required for ${selectedTicket.name}`
      );
      return false;
    }

    return true;
  };

  // Helper: Build attendees array from form data
  const buildAttendeesArray = () => {
    const attendees = [];

    // Attendee 1 (main form)
    attendees.push(formData);

    // Additional attendees (if bulk ticketing)
    const selectedTicket = event?.ticketTypes?.[selectedTicketIndex];
    if (
      selectedTicket?.enableBulkTicketing &&
      selectedTicket?.requireAttendeeDetails &&
      ticketQuantity > 1
    ) {
      for (let i = 1; i < ticketQuantity; i++) {
        attendees.push(attendeesData[i] || {});
      }
    }

    return attendees;
  };

  // Check if any email has already registered for this event
  const checkDuplicateRegistration = async (): Promise<boolean> => {
    if (!event?.id) return true;

    // Find email field(s)
    const emailFields =
      event?.registrationFields?.filter(
        (field) =>
          field.type === "email" || field.id.toLowerCase().includes("email")
      ) || [];

    if (emailFields.length === 0) return true; // No email fields to check

    const emails: string[] = [];

    // Collect email from main form (Attendee 1)
    emailFields.forEach((field) => {
      const email = formData[field.id];
      if (email && email.trim()) {
        emails.push(email.trim().toLowerCase());
      }
    });

    // Collect emails from additional attendees (if bulk ticketing)
    const selectedTicket = event?.ticketTypes?.[selectedTicketIndex];
    if (
      selectedTicket?.enableBulkTicketing &&
      selectedTicket?.requireAttendeeDetails &&
      ticketQuantity > 1
    ) {
      for (let i = 1; i < ticketQuantity; i++) {
        emailFields.forEach((field) => {
          const email = attendeesData[i]?.[field.id];
          if (email && email.trim()) {
            emails.push(email.trim().toLowerCase());
          }
        });
      }
    }

    if (emails.length === 0) return true;

    try {
      // Query orders collection for existing registrations
      const {
        collection: firestoreCollection,
        query: firestoreQuery,
        where,
        getDocs,
      } = await import("firebase/firestore");

      const ordersRef = firestoreCollection(db, "orders");
      const q = firestoreQuery(
        ordersRef,
        where("eventId", "==", event.id),
        where("status", "==", "SUCCESS")
      );

      const snapshot = await getDocs(q);

      // Check if any of our emails exist in successful orders
      for (const doc of snapshot.docs) {
        const orderData = doc.data();
        const orderEmail = orderData.customerEmail?.toLowerCase();

        // Check main customer email
        if (orderEmail && emails.includes(orderEmail)) {
          toast.error(`${orderEmail} has already registered for this event`);
          return false;
        }

        // Check attendees array if it exists
        if (
          orderData.metaData?.attendees &&
          Array.isArray(orderData.metaData.attendees)
        ) {
          for (const attendee of orderData.metaData.attendees) {
            for (const field of emailFields) {
              const attendeeEmail = attendee[field.id]?.toLowerCase();
              if (attendeeEmail && emails.includes(attendeeEmail)) {
                toast.error(
                  `${attendeeEmail} has already registered for this event`
                );
                return false;
              }
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking duplicate registration:", error);
      // Don't block registration if check fails
      return true;
    }
  };

  // Check ticket availability in real-time before payment/registration
  const checkTicketAvailability = async (): Promise<boolean> => {
    if (!event?.id) return true;

    try {
      // Fetch latest event data from Firestore
      const eventRef = doc(db, "published_events", event.id);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        toast.error("Event not found");
        return false;
      }

      const latestEventData = eventSnap.data();
      const latestTicketTypes = latestEventData.ticketTypes || [];
      const latestTicket = latestTicketTypes[selectedTicketIndex];

      if (!latestTicket) {
        toast.error("Ticket type not found");
        return false;
      }

      const availableQuantity = Number(latestTicket.quantity) || 0;

      if (availableQuantity < ticketQuantity) {
        if (availableQuantity === 0) {
          toast.error("Sorry, this ticket type is sold out!");
        } else {
          toast.error(
            `Only ${availableQuantity} ticket${
              availableQuantity > 1 ? "s" : ""
            } remaining. Please reduce your quantity.`
          );
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking ticket availability:", error);
      toast.error("Failed to verify ticket availability. Please try again.");
      return false;
    }
  };

  const handleFreeBooking = async () => {
    if (!isFormValid) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate minimum booking quantity
    if (!validateMinBooking()) {
      return;
    }

    // Validate unique emails for bulk ticketing
    if (!validateUniqueEmails()) {
      return;
    }

    // Validate mobile numbers
    if (!validateMobileNumbers()) {
      return;
    }

    // Show loading state for async validations
    setValidating(true);

    // Check for duplicate registrations
    const isDuplicate = await checkDuplicateRegistration();
    if (!isDuplicate) {
      setValidating(false);
      return;
    }

    // Check ticket availability (real-time)
    const isAvailable = await checkTicketAvailability();
    if (!isAvailable) {
      setValidating(false);
      return;
    }

    setValidating(false);
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const orderId = `ORDER_FREE_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      // Heurestics to find customer details from form data
      const findVal = (keys: string[]) => {
        const key = Object.keys(formData).find((k) =>
          keys.some((search) => k.toLowerCase().includes(search))
        );
        return key ? formData[key] : null;
      };

      const customerName =
        findVal(["name", "full name", "fullname"])?.toString() ||
        user?.displayName ||
        "Guest";
      const customerEmail =
        findVal(["email", "e-mail"])?.toString() ||
        user?.email ||
        "guest@example.com";
      const customerPhone =
        findVal(["phone", "mobile", "contact"])?.toString() || "9999999999";

      const orderData = {
        orderId,
        amount: 0,
        baseAmount: 0,
        currency: "INR",
        status: "SUCCESS", // Auto-success for free events
        customerId: user?.uid || `guest_${Date.now()}`,
        customerName,
        customerEmail,
        customerPhone,
        eventName: event?.name || "Event Ticket",
        eventId: event?.id || null,
        ticketType:
          event?.ticketTypes?.[selectedTicketIndex]?.name || "Standard",
        ticketQuantity,
        metaData: {
          attendees: buildAttendeesArray(), // Store as array
          registrationData: formData, // Keep for backward compatibility
        },
        createdAt: new Date().toISOString(),
        paymentId: "FREE_ENTRY",
      };

      // 🔴 Atomic Transaction: Deduct Ticket & Create Order
      await runTransaction(db, async (transaction) => {
        if (!event?.id) throw new Error("Event ID invalid");

        const eventRef = doc(db, "published_events", event.id);
        const eventSnap = await transaction.get(eventRef);

        if (!eventSnap.exists()) {
          throw new Error("Event does not exist");
        }

        const serverEventData = eventSnap.data();
        const serverTicketTypes = serverEventData.ticketTypes || [];
        const selectedTicket = serverTicketTypes[selectedTicketIndex];

        if (!selectedTicket) {
          throw new Error("Ticket type not found");
        }

        const currentQty = Number(selectedTicket.quantity);

        if (currentQty < ticketQuantity) {
          throw new Error(`Only ${currentQty} tickets remaining!`);
        }

        // 🔻 Deduct Quantity
        serverTicketTypes[selectedTicketIndex].quantity =
          currentQty - ticketQuantity;

        // 📝 Update Event Doc
        transaction.update(eventRef, {
          ticketTypes: serverTicketTypes,
        });

        // 📝 Create Order Doc
        const orderRef = doc(db, "orders", orderId);
        transaction.set(orderRef, orderData);
      });

      toast.success("Registration Successful!");

      // ✅ Set Success State instead of Redirecting
      setCreatedOrderId(orderId);
      setBookingSuccess(true);
      setLoading(false);
    } catch (error: any) {
      console.error("Free booking failed:", error);
      toast.error(error.message || "Booking failed. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative animate-pulse">
        {/* Header Skeleton */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-black/5 h-16" />

        <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto space-y-8">
          {/* Summary Skeleton */}
          <div className="flex gap-6 items-start">
            <div className="w-24 h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="space-y-3 flex-1 pt-2">
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          </div>

          {/* Ticket Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"
                />
              ))}
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="space-y-4">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl"
                />
              ))}
            </div>
          </div>
        </main>

        {/* Footer Skeleton */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-black/5">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  // -----------------------------------------------------------
  // ✅ SUCCESS VIEW (IN-PLACE)
  // -----------------------------------------------------------
  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white dark:bg-black rounded-3xl shadow-xl w-full max-w-md p-8 text-center border border-black/5 dark:border-white/10">
          <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100 mx-auto">
            <div className="w-10 h-10 text-green-600">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">
            Registration Successful!
          </h2>
          <p className="text-muted mb-8 font-medium leading-relaxed">
            Your spot has been confirmed. You will receive a confirmation email
            shortly.
          </p>

          <div className="space-y-3 w-full">
            {/* Redirect URL Button */}
            {event.redirectUrl && (
              <a
                href={event.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2"
              >
                Continue to Group / Event
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current opacity-80"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </a>
            )}

            {/* View Ticket Link */}
            <Link
              href="/dashboard/attendee/my-bookings"
              className={`w-full font-bold py-3.5 rounded-xl transition-all block ${
                !event.redirectUrl
                  ? "bg-primary text-white hover:bg-red-700 shadow-lg shadow-red-500/20"
                  : "bg-surface-1 text-foreground hover:bg-black/5 border border-black/5"
              }`}
            >
              View My Ticket
            </Link>

            <Link
              href={`/events/${slugId}`}
              className="block text-sm text-muted hover:text-foreground font-medium py-2"
            >
              Back to Event Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dateObj = new Date(event.date);

  // Calculate Breakdown
  const paymentBreakdown = calculatePaymentBreakdown(totalPrice);
  const finalAmount = paymentBreakdown.totalAmount;

  // Validate Form
  const isFormValid = event.registrationFields.every((field) => {
    if (!field.required) return true;
    const val = formData[field.id];
    return val && val.toString().trim() !== "";
  });

  return (
    <div className="h-auto bg-background relative selection:bg-primary/10">
      {/* Navbar / Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-2xl mx-auto px-6 sm:px-0 h-16 flex items-center justify-between">
          <Link
            href={`/events/${slugId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Cancel Booking</span>
            <span className="sm:hidden">Cancel</span>
          </Link>
          <div className="text-sm font-bold text-foreground truncate max-w-[200px]">
            {event.name}
          </div>
        </div>
      </div>

      <main className="pt-24 pb-32 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Minimal Event Summary */}
          {/* Event Summary Card */}
          <div className="flex flex-col sm:flex-row gap-6 animate-fade-in-up bg-white border border-gray-100 p-4 rounded-[8px]">
            {/* Poster / Thumbnail */}
            <div className="w-full sm:w-32 h-48 sm:h-40 relative rounded-[7px] overflow-hidden border border-black/5 shrink-0 bg-surface-2 shadow-sm group">
              <Image
                src={event.posterUrl || "/default-event-thumb.jpg"}
                alt={event.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Event Details */}
            <div className="flex-1 space-y-3 py-1">
              {/* Title */}
              <h1 className="text-2xl font-black text-gray-900 leading-tight">
                {event.name}
              </h1>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted/80">
                      Date
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {dateObj.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100/50">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted/80">
                      Time
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                      {formatTime(event.startTime)}{" "}
                      {event?.endTime && <>- {formatTime(event.endTime)}</>}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100/50 sm:col-span-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-primary shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted/80">
                      Venue
                    </span>
                    <span className="text-sm font-bold text-gray-700 line-clamp-1">
                      {event.venue}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. Ticket Selection */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <section
              className="space-y-4 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                Select Ticket
              </h3>
              <div className="space-y-3">
                {event.ticketTypes.map((ticket, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleTicketChange(idx)}
                    className={`cursor-pointer rounded-xl border-2 p-4 flex justify-between items-center transition-all ${
                      selectedTicketIndex === idx
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-transparent bg-surface-1 hover:border-primary/30"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-foreground">{ticket.name}</p>
                      <p className="text-sm text-muted">
                        {ticket.price > 0 ? `₹${ticket.price}` : "Free"}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedTicketIndex === idx
                          ? "border-primary"
                          : "border-black/20 group-hover:border-primary/50"
                      }`}
                    >
                      {selectedTicketIndex === idx && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-sm font-bold text-muted">Quantity</span>
                  {(() => {
                    const ticket = event.ticketTypes[selectedTicketIndex];
                    const min = ticket?.minBookingPerOrder || 1;
                    const max =
                      ticket?.maxBookingPerOrder || ticket?.quantity || 100;
                    if (min > 1 || max < 100) {
                      return (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Min: {min}, Max: {max}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="flex items-center gap-3 bg-surface-1 rounded-lg p-1 border border-black/5">
                  <button
                    onClick={() => handleQuantityChange(ticketQuantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-primary shadow-sm transition-all disabled:opacity-30 disabled:hover:text-muted"
                    disabled={
                      ticketQuantity <=
                      (event.ticketTypes[selectedTicketIndex]
                        ?.minBookingPerOrder || 1)
                    }
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center text-sm">
                    {ticketQuantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(ticketQuantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-primary shadow-sm transition-all disabled:opacity-30 disabled:hover:text-muted"
                    disabled={
                      ticketQuantity >=
                      (event.ticketTypes[selectedTicketIndex]
                        ?.maxBookingPerOrder ||
                        event.ticketTypes[selectedTicketIndex]?.quantity ||
                        100)
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Payment Breakdown */}
              {totalPrice > 0 && (
                <div className="bg-surface-1/50 rounded-xl p-4 space-y-2 border border-black/5 text-sm mt-2 animate-fade-in-up">
                  <div className="flex justify-between text-muted">
                    <span>Base Price</span>
                    <span>₹{paymentBreakdown.baseAmount}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Platform Fee (2%)</span>
                    <span>₹{paymentBreakdown.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Gateway Fee (2%)</span>
                    <span>₹{paymentBreakdown.gatewayFee}</span>
                  </div>
                  <div className="border-t border-black/5 pt-2 flex justify-between font-bold text-foreground">
                    <span>Total Amount</span>
                    <span>₹{paymentBreakdown.totalAmount}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          <div className="w-full h-px bg-black/5" />

          {/* 2. Registration Fields */}
          <section
            className="space-y-5 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-2">
              {event.ticketTypes?.[selectedTicketIndex]?.enableBulkTicketing &&
              event.ticketTypes?.[selectedTicketIndex]
                ?.requireAttendeeDetails &&
              ticketQuantity > 1 ? (
                <>
                  <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                    1
                  </span>
                  Attendee 1
                </>
              ) : (
                "Your Details"
              )}
            </h3>

            <div className="space-y-4">
              {event.registrationFields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground ml-1">
                    {field.label}{" "}
                    {field.required && <span className="text-primary">*</span>}
                  </label>

                  {field.type === "select" ? (
                    <div className="relative">
                      <select
                        required={field.required}
                        onChange={(e) =>
                          handleInputChange(field.id, e.target.value)
                        }
                        className="w-full bg-surface-1 border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium appearance-none"
                      >
                        <option value="">Select...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      rows={3}
                      className="w-full bg-surface-1 border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium min-h-[100px] resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      className="w-full bg-surface-1 border border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium"
                    />
                  )}
                </div>
              ))}

              {event.registrationFields.length === 0 && (
                <div className="text-xs text-muted text-center py-2">
                  Standard details will be collected at payment.
                </div>
              )}
            </div>
          </section>

          {/* 3. Bulk Attendee Details (if enabled) */}
          {event.ticketTypes?.[selectedTicketIndex]?.enableBulkTicketing &&
            event.ticketTypes?.[selectedTicketIndex]?.requireAttendeeDetails &&
            ticketQuantity > 1 && (
              <section
                className="space-y-5 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
                    Additional Attendees
                  </h3>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-bold">
                    {ticketQuantity - 1} More
                  </span>
                </div>

                <div className="space-y-6">
                  {Array.from({ length: ticketQuantity - 1 }, (_, idx) => {
                    const attendeeNumber = idx + 2; // Start from 2
                    return (
                      <div
                        key={idx}
                        className="bg-surface-1/50 rounded-xl p-5 border border-black/5 space-y-4"
                      >
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                            {attendeeNumber}
                          </span>
                          Attendee {attendeeNumber}
                        </h4>

                        <div className="space-y-3">
                          {event.registrationFields.map((field) => (
                            <div
                              key={`${idx + 1}-${field.id}`}
                              className="space-y-1.5"
                            >
                              <label className="text-xs font-bold text-foreground ml-1">
                                {field.label}{" "}
                                {field.required && (
                                  <span className="text-primary">*</span>
                                )}
                              </label>

                              {field.type === "select" ? (
                                <select
                                  required={field.required}
                                  value={
                                    attendeesData[idx + 1]?.[field.id] || ""
                                  }
                                  onChange={(e) =>
                                    handleAttendeeInputChange(
                                      idx + 1,
                                      field.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white border border-gray-200 focus:border-primary rounded-lg px-3 py-2 outline-none transition-all text-sm"
                                >
                                  <option value="">Select...</option>
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                              ) : field.type === "textarea" ? (
                                <textarea
                                  required={field.required}
                                  value={
                                    attendeesData[idx + 1]?.[field.id] || ""
                                  }
                                  onChange={(e) =>
                                    handleAttendeeInputChange(
                                      idx + 1,
                                      field.id,
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  className="w-full bg-white border border-gray-200 focus:border-primary rounded-lg px-3 py-2 outline-none transition-all text-sm resize-none"
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  required={field.required}
                                  value={
                                    attendeesData[idx + 1]?.[field.id] || ""
                                  }
                                  onChange={(e) =>
                                    handleAttendeeInputChange(
                                      idx + 1,
                                      field.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-white border border-gray-200 focus:border-primary rounded-lg px-3 py-2 outline-none transition-all text-sm"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
                  ℹ️ Please provide details for each attendee. This information
                  will be used for event registration and communication.
                </p>
              </section>
            )}
        </div>
      </main>

      {/* Checkout Bar (Floating Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 p-4 z-50 safe-pb shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold text-muted uppercase">Total</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-foreground leading-none">
                {finalAmount > 0 ? `₹${finalAmount}` : "Free"}
              </p>
              {finalAmount > totalPrice && finalAmount > 0 && (
                <p className="text-xs font-medium text-muted">
                  (Includes fees)
                </p>
              )}
            </div>
          </div>
          <div className="w-40 sm:w-64">
            {searchParams?.get("preview") === "true" ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 font-bold py-3 rounded-xl cursor-not-allowed"
              >
                Preview Mode
              </button>
            ) : finalAmount === 0 ? (
              <button
                onClick={handleFreeBooking}
                disabled={!isFormValid || loading || validating}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-green-600/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {validating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Register for Free</>
                )}
              </button>
            ) : (
              <PaymentButton
                amount={finalAmount}
                eventId={eventId || ""}
                eventName={event.name}
                bookingData={{
                  attendees: buildAttendeesArray(),
                  registrationData: formData,
                  ticketType: event.ticketTypes?.[selectedTicketIndex],
                  ticketQuantity: ticketQuantity,
                  paymentBreakdown, // Pass breakdown for backend/logging if needed
                }}
                guestMode={true}
                disabled={!isFormValid}
                onBeforePayment={validateBeforePayment}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
