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
  price?: number; // Added price
  shareUrl?: string;
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

            // Determine price from ticketTypes
            let minPrice = 0;
            if (
              data.ticketTypes &&
              Array.isArray(data.ticketTypes) &&
              data.ticketTypes.length > 0
            ) {
              const prices = data.ticketTypes.map(
                (t: any) => Number(t.price) || 0
              );
              minPrice = Math.min(...prices);
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

  if (loading) {
    return (
      <section className="min-h-[60vh] flex justify-center items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin border-b-2 border-primary rounded-full" />
          <p className="text-muted text-sm">Loading events...</p>
        </div>
      </section>
    );
  }

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

      {events.length === 0 ? (
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
  const eventUrl = `/events/${event.slug || event.id}`;
  const dateObj = new Date(event.date);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "short" });

  return (
    <Link
      href={eventUrl}
      className="group block h-full bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px] hover:border-black/10 flex flex-col"
    >
      {/* POSTER */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-2">
        {/* Date Badge (Overlay) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-center justify-center w-10 h-12 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-lg shadow-sm border border-black/5">
          <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider">
            {month}
          </span>
          <span className="text-base font-black text-foreground leading-none mt-0.5">
            {day}
          </span>
        </div>

        {/* Image */}
        <div className="relative w-full h-full">
          <Image
            src={
              event.posterUrl ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop"
            } // Fallback image
            alt={event.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

        {/* Price Tag Overlay */}
        <div className="absolute bottom-3 right-3">
          <div
            className={`px-3 py-1.5 backdrop-blur-md text-xs font-bold rounded-lg border shadow-lg ${
              event.price && event.price > 0
                ? "bg-white/90 text-black border-white/20"
                : "bg-green-500/90 text-white border-green-400/20"
            }`}
          >
            {event.price && event.price > 0 ? `₹${event.price}` : "Free"}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 space-y-2">
          <h3 className="text-base font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {event.name}
          </h3>

          <div className="flex items-start gap-1.5 text-xs text-muted">
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted">
            <Users className="w-3.5 h-3.5" />
            <span>{event.attendees} going</span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground group-hover:underline">
            Details{" "}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
