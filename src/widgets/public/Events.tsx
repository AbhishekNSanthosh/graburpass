"use client";
import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Users, ArrowRight, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";

/* ================= TYPES ================= */
interface PublicEvent {
  id: string;
  name: string;
  date: string;
  location?: string;
  posterUrl?: string;
  attendees?: number;
  slug?: string;
  price?: number;
  shareUrl?: string;
  registrationOpen?: boolean;
  ticketSalesStart?: string | null; // Added
}

/* ================= COMPONENT ================= */
export default function Events() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(
          query(
            collection(db, "published_events"),
            where("status", "==", "published")
          )
        );

        const list = snap.docs
          .map((doc) => {
            const data = doc.data();
            const eventDate =
              data.date instanceof Timestamp
                ? data.date.toDate().toISOString().split("T")[0]
                : typeof data.date === "string"
                ? data.date
                : new Date().toISOString().split("T")[0];

            // Determine price and earliest sale start from ticketTypes
            let minPrice = 0;
            let earliestSaleStart: Date | null = null;

            if (
              data.ticketTypes &&
              Array.isArray(data.ticketTypes) &&
              data.ticketTypes.length > 0
            ) {
              const prices = data.ticketTypes.map(
                (t: any) => Number(t.price) || 0
              );
              minPrice = Math.min(...prices);

              // Find earliest sale start logic
              data.ticketTypes.forEach((t: any) => {
                const rawStart = t.saleStartDate || t.salesStartDate;
                let start: Date | null = null;
                if (rawStart?.toDate) {
                  start = rawStart.toDate();
                } else if (rawStart) {
                  start = new Date(rawStart);
                }

                if (start && !isNaN(start.getTime())) {
                  if (!earliestSaleStart || start < earliestSaleStart) {
                    earliestSaleStart = start;
                  }
                }
              });
            }

            return {
              id: doc.id,
              name: data.name,
              date: eventDate,
              location: data.venueAddress || data.onlineLink || "Online",
              posterUrl: data.posterUrl,
              attendees: data.attendees ?? 0,
              slug: data.slug,
              price: minPrice,
              registrationOpen: data.registrationOpen !== false,
              ticketSalesStart: earliestSaleStart
                ? (earliestSaleStart as Date).toISOString()
                : null,
            };
          })
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

        setEvents(list);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="px-[5vw] py-32 bg-background min-h-screen">
      {/* Background decorations */}
      <div className="fixed inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] -z-10" />

      {/* HEADER */}
      <div className="mb-12 max-w-2xl animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-4">
          <Ticket className="w-3 h-3" /> Browsing Events
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
          Discover Experiences
        </h1>
        <p className="text-muted text-base leading-relaxed">
          Find your next favorite event. From tech conferences to music
          festivals, we have it all.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-black/5 rounded-3xl bg-surface-1/50 animate-fade-in-up">
          <Calendar className="w-16 h-16 text-muted/30 mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            No events found
          </h3>
          <p className="text-muted text-sm">
            Check back later for new updates.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ================= EVENT CARD ================= */
function EventCard({ event }: { event: PublicEvent }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const eventUrl = `/events/${event.slug || event.id}`;
  const dateObj = new Date(event.date);

  // Format Date: "Sat, Jan 3"
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Calculate Status
  const now = new Date();
  let isUpcoming = false;
  let statusBadge = null;

  if (event.ticketSalesStart) {
    const start = new Date(event.ticketSalesStart);
    if (start > now) {
      isUpcoming = true;
      const formattedStart = `${start.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })}, ${start.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })}`;
      statusBadge = (
        <div className="absolute top-3 right-3 z-30 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-white/20 shadow-lg">
          Starts {formattedStart}
        </div>
      );
    }
  }

  // Fallback to "Closed" if not upcoming and registration explicitly closed
  if (!isUpcoming && event.registrationOpen === false) {
    statusBadge = (
      <div className="absolute top-3 right-3 z-30 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide border border-white/20">
        Registration Closed
      </div>
    );
  }

  return (
    <Link
      href={eventUrl}
      className={`group block h-full bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 flex flex-col ${
        !isUpcoming && event.registrationOpen === false
          ? "opacity-75 grayscale-[0.5]"
          : ""
      }`}
    >
      {/* POSTER */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
        {/* Registration Status Overlay */}
        {statusBadge}

        {/* Blurred Background Layer */}
        <div className="absolute inset-0">
          <Image
            src={
              event.posterUrl ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop"
            }
            alt=""
            fill
            className="object-cover blur-sm scale-110 opacity-100 placeholder-blur"
          />
        </div>

        {/* Main Image Layer */}
        <div className="relative w-full h-full z-10 p-2">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse z-20" />
          )}
          <Image
            src={
              event.posterUrl ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop"
            }
            alt={event.name}
            fill
            onLoadingComplete={() => setImageLoaded(true)}
            className={`object-contain transition-all duration-700 group-hover:scale-105 drop-shadow-xl ${
              imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg"
            }`}
          />
        </div>

        {/* Overlay Gradient for text readability if needed, though we moved text out */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {event.name}
          </h3>

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 shrink-0 stroke-[1.5]" />
              <span className="font-medium">{dateStr}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 shrink-0 stroke-[1.5]" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>

        {/* Footer / Action */}
        <div className="pt-5 mt-5 border-t border-gray-100 dark:border-white/5 flex items-end justify-between">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              {event.price && event.price > 0 ? "Starting from" : ""}
            </span>
            <div className="flex items-baseline gap-1">
              {event.price && event.price > 0 ? (
                <>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{event.price}{" "}
                    <span className="text-sm font-medium">onwards</span>
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold text-red-700">Free</span>
              )}
            </div>
          </div>

          {/* Button CTA */}
          {!isUpcoming && event.registrationOpen === false ? (
            <div className="h-8 px-3 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase tracking-wide border border-gray-200">
              Closed
            </div>
          ) : (
            <div
              className={`h-10 w-10 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white transition-all duration-300 shadow-sm ${
                isUpcoming
                  ? "opacity-50 cursor-not-allowed group-hover:bg-gray-100"
                  : "group-hover:bg-primary group-hover:text-white group-hover:border-primary"
              }`}
            >
              <ArrowRight
                className={`w-5 h-5 -rotate-45 transition-transform duration-300 ${
                  !isUpcoming && "group-hover:rotate-0"
                }`}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="h-full bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-[3/4] w-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <div className="p-4 flex flex-col flex-1 space-y-4">
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
        </div>
        <div className="pt-4 mt-auto border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
