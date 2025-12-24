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
        // Removed orderBy to avoid composite index requirement; sort in client
        const snap = await getDocs(
          query(
            collection(db, "published_events"),
            where("status", "==", "published") // Fixed status to match NewEvent
          )
        );
        let list = snap.docs.map((doc) => {
          const data = doc.data();
          const eventDate = data.date instanceof Timestamp
            ? data.date.toDate().toISOString().split('T')[0] // Convert to YYYY-MM-DD string
            : typeof data.date === 'string' ? data.date : new Date().toISOString().split('T')[0];
          return {
            id: doc.id,
            name: data.name,
            date: eventDate,
            location: data.venueAddress || data.onlineLink || "Online", // Compute location from actual fields
            posterUrl: data.posterUrl,
            attendees: data.attendees ?? 0,
            slug: data.slug,
          };
        });

        // Sort by date ascending in client
        list = list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setEvents(list);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <section className="py-20 flex justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-red-600 rounded-full" />
      </section>
    );
  }

  /* ================= UI ================= */
  return (
    <section className=" px-[5vw] py-[15vh]">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
        <p className="text-gray-500 mt-2">
          Discover conferences, meetups, and experiences near you
        </p>
      </div>
      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No events available right now
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
      className="group bg-white rounded-xl border overflow-hidden hover:shadow-xl transition-all"
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100">
        <Image
          src={event.posterUrl || "/default-event-thumb.jpg"}
          alt={event.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {event.name}
        </h3>
        <div className="text-sm text-gray-500 space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(event.date).toLocaleDateString()}
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {event.attendees} attending
          </div>
        </div>
        <div className="pt-4 flex items-center justify-between">
          <span className="text-red-600 text-sm font-medium">
            View details
          </span>
          <ArrowRight className="h-4 w-4 text-red-600 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}