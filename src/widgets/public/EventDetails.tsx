"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import Image from "next/image";
import { Calendar, Clock, MapPin, Share2 } from "lucide-react";
import { useParams } from "next/navigation";

interface EventData {
  name: string;
  description?: string;
  posterUrl?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  price?: number;
  organizerName?: string;
  organizerEmail?: string;
  lat?: number;
  lng?: number;
}

export default function EventDetails() {
  const params = useParams();
  console.log(params)
  const slugId = params?.slugId as string;
  console.log(slugId)
  const eventId = slugId?.split("--").pop()!;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const ref = doc(db, "published_events", eventId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setEvent(snap.data() as EventData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="h-8 w-8 animate-spin border-b-2 border-green-600 rounded-full" />
      </div>
    );
  }

  if (!event) return <div className="p-10">Event not found</div>;

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* LEFT */}
      <div className="lg:col-span-2 space-y-8">
        <div className="relative w-full h-[420px] rounded-xl overflow-hidden">
          <Image
            src={event.posterUrl || "/default-event-thumb.jpg"}
            alt={event.name}
            fill
            className="object-cover"
          />
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-4">About the Event</h2>
          <p className="text-gray-700 whitespace-pre-line">
            {event.description || "No description provided"}
          </p>
        </section>

        <button
          onClick={() => navigator.clipboard.writeText(window?.location.href)}
          className="flex items-center gap-2 px-4 py-2 border rounded-full hover:bg-gray-100"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      {/* RIGHT */}
      <aside className="space-y-6">
        <div className="border rounded-xl p-6 space-y-4">
          <h1 className="text-2xl font-bold">{event.name}</h1>

          <div className="space-y-2 text-sm text-gray-600">
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

          <div className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Starts from</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{event.price ?? "Free"}
              </p>
            </div>

            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              Book Now
            </button>
          </div>
        </div>

        {event.lat && event.lng && (
          <div className="border rounded-xl p-4">
            <h3 className="font-semibold mb-2">Location</h3>
            <iframe
              className="w-full h-48 rounded-lg"
              src={`https://maps.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`}
            />
          </div>
        )}

        <div className="border rounded-xl p-4">
          <h3 className="font-semibold mb-2">Organised by</h3>
          <p className="font-medium">{event.organizerName}</p>
          <p className="text-sm text-gray-500">
            {event.organizerEmail}
          </p>
        </div>
      </aside>
    </main>
  );
}
