"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Users,
  Shield,
  Ticket,
  ArrowLeft,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PaymentButton from "../payment/PaymentButton";
import toast from "react-hot-toast";
import PublicFooter from "../common/PublicFooter";
import { calculatePaymentBreakdown } from "@/utils/paymentUtils";

/* ================= TYPES ================= */

interface TicketType {
  name: string;
  price: number;
  quantity: number;
  saleStartDate?: string;
  saleEndDate?: string;
}

interface EventData {
  name: string;
  description?: string;
  posterUrl?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  price: number;
  organizerName?: string;
  organizerEmail?: string;
  lat?: number;
  lng?: number;
  ticketTypes?: TicketType[];
}

/* ================= COMPONENT ================= */

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const slugId = params?.slugId as string;
  const eventId = slugId?.split("--").pop();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH EVENT ================= */

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const ref = doc(db, "published_events", eventId);
        const snap = await getDoc(ref);

        if (!snap.exists()) return;

        const data = snap.data();

        // 🔹 Date
        const eventDate = data.date?.toDate?.().toISOString() ?? data.date;

        // 🔹 Time
        const startTime = data.startTime ?? data.time?.split("-")[0]?.trim();

        const endTime = data.endTime ?? data.time?.split("-")[1]?.trim();

        // 🔹 Price from ticketTypes
        // 🔹 Price from ticketTypes
        const rawTicketTypes = data.ticketTypes ?? [];
        const ticketTypes: TicketType[] = rawTicketTypes.map((t: any) => {
          // Normalize dates handling potentially different field names or Firestore timestamps
          const rawStart = t.saleStartDate || t.salesStartDate; // Fallback for plural 'sales'
          const rawEnd = t.saleEndDate || t.salesEndDate;

          return {
            ...t,
            saleStartDate: rawStart?.toDate
              ? rawStart.toDate().toISOString()
              : rawStart,
            saleEndDate: rawEnd?.toDate
              ? rawEnd.toDate().toISOString()
              : rawEnd,
          };
        });

        const minPrice =
          data.isPaid && ticketTypes.length > 0
            ? Math.min(...ticketTypes.map((t) => Number(t.price)))
            : 0;

        const normalizedEvent: EventData = {
          name: data.name,
          description: data.description,
          posterUrl: data.posterUrl,
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
          price: minPrice,
          organizerName: data.organizerName,
          organizerEmail: data.organizerEmail,
          lat: data.lat,
          lng: data.lng,
          ticketTypes: ticketTypes,
        };

        setEvent(normalizedEvent);
      } catch (err) {
        console.error("Failed to fetch event", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  /* ================= SHARE ================= */

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin border-b-2 border-red-600 rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <Link href="/events" className="text-primary hover:underline">
          Back to Events
        </Link>
      </div>
    );
  }

  const dateObj = new Date(event.date);

  /* ================= TICKET HANDLERS ================= */
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  // Auto-select first available ticket
  useEffect(() => {
    if (event?.ticketTypes && !selectedTicket) {
      const available = event.ticketTypes.find((t) => {
        const status = getTicketStatus(t);
        return status.code === "AVAILABLE";
      });
      if (available) setSelectedTicket(available);
    }
  }, [event]);

  const getTicketStatus = (ticket: TicketType) => {
    const now = new Date();

    let start: Date | null = null;
    if (ticket.saleStartDate) {
      const d = new Date(ticket.saleStartDate);
      if (!isNaN(d.getTime())) start = d;
    }

    let end: Date | null = null;
    if (ticket.saleEndDate) {
      const d = new Date(ticket.saleEndDate);
      if (!isNaN(d.getTime())) end = d;
    }

    if (ticket.quantity <= 0) {
      return { code: "SOLD_OUT", label: "Sold Out", color: "text-red-600" };
    }

    // Debugging logs - Re-enabled for troubleshooting
    if (process.env.NODE_ENV !== "production") {
      console.log(`[TicketCheck] ${ticket.name}:`, {
        ticketKeys: Object.keys(ticket),
        saleStartDate: ticket.saleStartDate,
        parsedStart: start ? start.toISOString() : "null",
        now: now.toISOString(),
        isUpcoming: start ? now.getTime() < start.getTime() : "N/A",
      });
    }

    // Safety check: If a start date string exists but parsing failed, prevent booking
    if (ticket.saleStartDate && !start) {
      return {
        code: "UPCOMING",
        label: "Coming Soon",
        color: "text-blue-600",
      };
    }

    if (start && now.getTime() < start.getTime()) {
      return {
        code: "UPCOMING",
        label: `Sales Start: ${start.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}, ${start.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`,
        color: "text-blue-600",
      };
    }

    if (end && now.getTime() >= end.getTime()) {
      return { code: "ENDED", label: "Sales Ended", color: "text-gray-500" };
    }

    return { code: "AVAILABLE", label: "Available", color: "text-green-600" };
  };

  const selectedPrice = selectedTicket ? Number(selectedTicket.price) : 0;
  const { platformFee, gatewayFee, totalAmount } =
    calculatePaymentBreakdown(selectedPrice);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ... (Header code unchanged) ... */}

      <main className="flex-1 relative pb-20 pt-24">
        {/* ... (Background elements unchanged) ... */}

        <div className="mx-auto px-[5vw]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ... (Left Column unchanged) ... */}
            <div className="lg:col-span-8 space-y-12">
              {/* ... (Content sections unchanged) ... */}
              {/* Re-inserting left column content rendered previously to ensure context matching if needed, but tool allows partial replace. 
                   I will focus replace on lines 161 to the end where render happens, but wait, the instruction is to replace UI.
                   The snippet above replaces the logic. I need to replace the RETURN statement's specific parts.
                   Actually, let's restructure the 'return' block for the Right Sidebar specifically.
               */}
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 rounded-3xl border bg-white p-6 shadow-xl space-y-6">
                {/* TICKET SELECTION */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">
                    Select Ticket
                  </h3>
                  <div className="space-y-3">
                    {event.ticketTypes?.map((ticket, idx) => {
                      const status = getTicketStatus(ticket);
                      const isSelected = selectedTicket?.name === ticket.name;
                      const isDisabled = status.code !== "AVAILABLE";

                      return (
                        <div
                          key={idx}
                          role="button"
                          onClick={() =>
                            !isDisabled && setSelectedTicket(ticket)
                          }
                          className={`
                            relative p-4 rounded-xl border-2 transition-all text-left w-full
                            ${
                              isDisabled
                                ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-70"
                                : isSelected
                                ? "bg-red-50 border-red-600 ring-1 ring-red-600"
                                : "bg-white border-gray-100 hover:border-gray-200 cursor-pointer"
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span
                              className={`font-bold ${
                                isDisabled ? "text-gray-500" : "text-gray-900"
                              }`}
                            >
                              {ticket.name}
                            </span>
                            <span className="font-bold text-gray-900">
                              {Number(ticket.price) > 0
                                ? `₹${ticket.price}`
                                : "Free"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <p
                              className={`text-xs font-medium ${status.color}`}
                            >
                              {status.label}
                            </p>
                            {ticket.quantity < 20 &&
                              ticket.quantity > 0 &&
                              status.code === "AVAILABLE" && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                                  {ticket.quantity} left
                                </span>
                              )}
                          </div>

                          {isSelected && (
                            <div className="absolute top-3 right-3 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* PRICE BREAKDOWN (Only if ticket selected) */}
                {selectedTicket && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <div className="h-px bg-gray-100 my-4" />
                    <div className="space-y-3 mb-4">
                      {selectedPrice > 0 ? (
                        <>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Base Ticket</span>
                            <span className="font-medium">
                              ₹{selectedPrice}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Platform Fee (2%)</span>
                            <span>+ ₹{platformFee}</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Gateway Fee (2%)</span>
                            <span>+ ₹{gatewayFee}</span>
                          </div>
                          <div className="h-px bg-gray-100 my-2" />
                          <div className="flex justify-between text-base font-bold text-gray-900">
                            <span>Total Payable</span>
                            <span>₹{totalAmount}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-base font-bold text-green-700">
                          <span>Total Payable</span>
                          <span>Free</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                {(() => {
                  const availableCount = event.ticketTypes?.filter(
                    (t) => getTicketStatus(t).code === "AVAILABLE"
                  ).length;

                  const selectedStatus = selectedTicket
                    ? getTicketStatus(selectedTicket)
                    : null;
                  const isSelectionAvailable =
                    selectedStatus?.code === "AVAILABLE";

                  let buttonLabel = "";
                  if (!selectedTicket) {
                    if (availableCount === 0)
                      buttonLabel = "Currently Unavailable";
                    else buttonLabel = "Select a Ticket";
                  } else {
                    if (!isSelectionAvailable) {
                      buttonLabel = selectedStatus?.label || "Unavailable";
                    } else {
                      buttonLabel =
                        selectedPrice > 0 ? "Book Now" : "Register Free";
                    }
                  }

                  return (
                    <PaymentButton
                      amount={totalAmount || 0}
                      eventId={eventId || ""}
                      eventName={event.name}
                      disabled={!selectedTicket || !isSelectionAvailable}
                      customLabel={buttonLabel}
                      bookingData={{
                        ticketType: selectedTicket,
                      }}
                    />
                  );
                })()}

                {/* TRUST BADGES */}
                <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                  <span>🔒 Secure checkout</span>
                  <span>•</span>
                  <span>⚡ Instant confirmation</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
