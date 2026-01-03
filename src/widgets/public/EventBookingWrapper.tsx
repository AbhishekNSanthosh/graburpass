"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
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
  const [totalPrice, setTotalPrice] = useState(0);

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
        });

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
          updatePrice(defaultIdx, 1, data.ticketTypes);
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
      updatePrice(index, ticketQuantity, event.ticketTypes);
    }
  };

  const handleQuantityChange = (qty: number) => {
    if (qty < 1) return;
    setTicketQuantity(qty);
    if (event?.ticketTypes) {
      updatePrice(selectedTicketIndex, qty, event.ticketTypes);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
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
                <span className="text-sm font-bold text-muted">Quantity</span>
                <div className="flex items-center gap-3 bg-surface-1 rounded-lg p-1 border border-black/5">
                  <button
                    onClick={() => handleQuantityChange(ticketQuantity - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-primary shadow-sm transition-all disabled:opacity-30 disabled:hover:text-muted"
                    disabled={ticketQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center text-sm">
                    {ticketQuantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(ticketQuantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:text-primary shadow-sm transition-all"
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted">
              Your Details
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
            <PaymentButton
              amount={finalAmount}
              eventId={eventId || ""}
              eventName={event.name}
              bookingData={{
                registrationData: formData,
                ticketType: event.ticketTypes?.[selectedTicketIndex],
                ticketQuantity: ticketQuantity,
                paymentBreakdown, // Pass breakdown for backend/logging if needed
              }}
              guestMode={true}
              disabled={!isFormValid}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
