"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import Image from "next/image";
import { Calendar, Clock, MapPin, Share2 } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

/* ================= TYPES ================= */

interface TicketType {
  name: string;
  price: number;
  quantity: number;
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
}

/* ================= COMPONENT ================= */

export default function EventDetails() {
  const params = useParams();
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
        const ticketTypes: TicketType[] = data.ticketTypes ?? [];

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
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="h-10 w-10 animate-spin border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  if (!event) {
    return <div className="p-10 text-center">Event not found</div>;
  }

  /* ================= UI ================= */

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* ================= HERO ================= */}
      <div className="relative rounded-3xl overflow-hidden mb-14">
        <div className="relative h-[420px]">
          <Image
            src={event.posterUrl || "/default-event-thumb.jpg"}
            alt={event.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>

        {/* HERO CONTENT */}
        <div className="absolute bottom-0 left-0 p-8 text-white max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{event.name}</h1>

          <div className="flex flex-wrap gap-4 text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(event.date).toDateString()}
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {event.startTime} – {event.endTime}
              </div>
            )}

            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.venue}
              </div>
            )}
          </div>
        </div>

        {/* BADGES */}
        <div className="absolute top-6 right-6 flex gap-3">
          <span className="bg-white text-gray-900 px-4 py-1.5 rounded-full text-sm font-semibold">
            {event.price > 0 ? `₹${event.price}` : "Free"}
          </span>

          <button
            onClick={handleShare}
            className="bg-white/90 hover:bg-white p-2 rounded-full"
          >
            <Share2 className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* ================= CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">About this event</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {event.description || "No description provided."}
            </p>
          </section>

          {event.lat && event.lng && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <iframe
                className="w-full h-72 rounded-2xl border"
                src={`https://maps.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`}
              />
            </section>
          )}
        </div>

        {/* RIGHT */}
        <aside className="space-y-6">
          {/* BOOKING CARD */}
          <div className="sticky top-24 rounded-3xl border bg-white p-6 shadow-xl space-y-6">
            {/* PRICE */}
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Starting from
              </p>
              <p className="mt-1 text-4xl font-extrabold text-green-600">
                {event.price > 0 ? `₹${event.price}` : "Free"}
              </p>
              <p className="text-sm text-gray-500 mt-1">per person</p>
            </div>

            {/* CTA */}
            <Link
              href="/contact"
              className="group relative flex items-center justify-center gap-2 w-full bg-green-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all"
            >
              Book Now
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>

            {/* TRUST BADGES */}
            <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
              <span>🔒 Secure checkout</span>
              <span>•</span>
              <span>⚡ Instant confirmation</span>
            </div>

            {/* OPTIONAL INFO */}
            {event.price > 0 && (
              <p className="text-xs text-gray-400 text-center">
              Platform fees may apply
              </p>
            )}
          </div>

          {/* ORGANIZER */}
          {/* <div className="rounded-2xl border p-6">
            <h3 className="font-semibold mb-2">
              Organised by
            </h3>
            <p className="font-medium">
              {event.organizerName || "Unknown"}
            </p>
            <p className="text-sm text-gray-500">
              {event.organizerEmail}
            </p>
          </div> */}
        </aside>
      </div>
    </main>
  );
}
