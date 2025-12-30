"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";
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

            return {
              id: doc.id,
              name: data.name,
              date: eventDate,
              location:
                data.venueAddress || data.onlineLink || "Online",
              posterUrl: data.posterUrl,
              attendees: data.attendees ?? 0,
              slug: data.slug,
            };
          })
          .sort(
            (a, b) =>
              new Date(a.date).getTime() -
              new Date(b.date).getTime()
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
      <section className="py-24 flex justify-center">
        <div className="h-10 w-10 animate-spin border-b-2 border-red-600 rounded-full" />
      </section>
    );
  }

  return (
    <section className="px-[5vw] py-[12vh]">
      {/* HEADER */}
      <div className="mb-14 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900">
          Upcoming Events
        </h1>
        <p className="text-gray-500 mt-3 text-lg">
          Conferences, meetups & experiences you shouldn’t miss
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          No events available right now
        </div>
      ) : (
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ================= EVENT CARD ================= */
function EventCard({ event }: { event: PublicEvent }) {
  const eventUrl = `/events/${event.slug ?? event.id}--${event.id}`;

  return (
    <Link
      href={eventUrl}
      className="group rounded-2xl border bg-white overflow-hidden transition-all
                 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* POSTER */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        <Image
          src={event.posterUrl || "/default-event-thumb.jpg"}
          alt={event.name}
          height={400}
          width={300}
          className="object-cover transition-transform duration-500 group-hover:scale-110 w-full h-full"
          // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* GRADIENT */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* DATE BADGE */}
        <div className="absolute top-4 left-4 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-900">
          {new Date(event.date).toDateString()}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {event.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span className="line-clamp-1">
              {event.location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-red-500" />
            {event.attendees} attending
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 flex items-center justify-between">
          <span className="text-red-600 font-medium text-sm">
            View details
          </span>
          <ArrowRight className="h-4 w-4 text-red-600 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
