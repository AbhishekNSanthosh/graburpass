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

        <main className="pt-24 pb-32 px-6 max-w-xl mx-auto space-y-12">
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
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-12 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const dateObj = new Date(event.date);

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/10">
      {/* Navbar / Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
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
        <div className="max-w-xl mx-auto space-y-12">
          {/* Minimal Event Summary */}
          <div className="flex gap-6 items-start animate-fade-in-up">
            <div className="w-24 h-32 relative rounded-xl overflow-hidden border border-black/10 shrink-0 bg-surface-2 shadow-sm">
              <Image
                src={event.posterUrl || "/default-event-thumb.jpg"}
                alt={event.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-foreground leading-tight">
                {event.name}
              </h1>
              <div className="space-y-1 text-sm text-muted pt-1">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateObj.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {event.startTime} - {event.endTime}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.venue}
                </p>
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
                        ? "border-black bg-surface-1 shadow-md"
                        : "border-transparent bg-surface-1 hover:border-black/5"
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
                          : "border-black/20"
                      }`}
                    >
                      {selectedTicketIndex === idx && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full" />
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
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white shadow-sm transition-all disabled:opacity-30"
                    disabled={ticketQuantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-bold w-4 text-center text-sm">
                    {ticketQuantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(ticketQuantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white shadow-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
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
                        className="w-full bg-surface-1 border border-transparent focus:border-black/20 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium appearance-none"
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
                      className="w-full bg-surface-1 border border-transparent focus:border-black/20 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium min-h-[100px] resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      className="w-full bg-surface-1 border border-transparent focus:border-black/20 focus:bg-white rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium"
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
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold text-muted uppercase">Total</p>
            <p className="text-2xl font-black text-foreground leading-none">
              {totalPrice > 0 ? `₹${totalPrice}` : "Free"}
            </p>
          </div>
          <div className="w-40 sm:w-64">
            <PaymentButton
              amount={totalPrice}
              eventId={eventId || ""}
              eventName={event.name}
              bookingData={{
                registrationData: formData,
                ticketType: event.ticketTypes?.[selectedTicketIndex],
                ticketQuantity: ticketQuantity,
              }}
              guestMode={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
