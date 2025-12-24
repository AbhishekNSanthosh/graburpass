"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  Edit,
  Users,
  BarChart3,
  Copy,
  Eye,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/utils/configs/firebaseConfig";
import Image from "next/image";
import toast from "react-hot-toast";

/* ================= TYPES ================= */

type EventStatus = "draft" | "live" | "completed" | "cancelled";

interface Event {
  id: string;
  name: string;
  slug?: string;
  shareUrl?: string;
  thumbnail?: string;
  date: string;
  status: EventStatus;
  attendees: number;
  sales: number;
}

/* ================= HELPERS ================= */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || window?.location.origin;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ================= COMPONENT ================= */

export default function ManageEvents() {
  const [publishedEvents, setPublishedEvents] = useState<Event[]>([]);
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [statusFilter, setStatusFilter] = useState<"all" | "live">("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const now = Date.now();

  /* ================= FETCH EVENTS ================= */

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      setLoading(true);

      /* ---------- PUBLISHED EVENTS ---------- */
      const publishedSnap = await getDocs(
        query(
          collection(db, "published_events"),
          where("creatorEmail", "==", user.email)
        )
      );

      const published: Event[] = publishedSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        const eventDate = new Date(data.date).getTime();

        return {
          id: docSnap.id,
          name: data.name,
          slug: data.slug,
          shareUrl: data.shareUrl,
          thumbnail: data.posterUrl || "/default-event-thumb.jpg",
          date: data.date,
          status: eventDate >= now ? "live" : "completed",
          attendees: data.attendees ?? 0,
          sales: data.sales ?? 0,
        };
      });

      /* ---------- DRAFT EVENTS ---------- */
      const draftSnap = await getDocs(
        query(
          collection(db, "event_drafts"),
          where("creatorEmail", "==", user.email)
        )
      );

      const drafts: Event[] = draftSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          thumbnail: data.posterUrl || "/default-event-thumb.jpg",
          date: data.date,
          status: "draft",
          attendees: 0,
          sales: 0,
        };
      });

      published.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      drafts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setPublishedEvents(published);
      setDraftEvents(drafts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ================= SHARE HANDLER ================= */

  const handleShare = async (event: Event) => {
  const slug = event.slug || slugify(event.name);
  const shareUrl = `${SITE_URL}/events/${slug}--${event.id}`;

  const sharePromise = async () => {
    // Save only once
    if (!event.slug || !event.shareUrl) {
      await updateDoc(doc(db, "published_events", event.id), {
        slug,
        shareUrl,
      });

      setPublishedEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, slug, shareUrl } : e
        )
      );
    }

    await navigator.clipboard.writeText(shareUrl);
    return shareUrl;
  };

  toast.promise(sharePromise(), {
    loading: "Generating share link...",
    success: "Event link copied!",
    error: "Failed to generate share link",
  });
};


  /* ================= FILTERING ================= */

  const filteredPublishedEvents = publishedEvents.filter((event) => {
    const eventDate = new Date(event.date).getTime();
    const isUpcoming = eventDate >= now;

    if (activeTab === "upcoming" && !isUpcoming) return false;
    if (activeTab === "past" && isUpcoming) return false;
    if (statusFilter === "live" && event.status !== "live") return false;

    return true;
  });

  /* ================= HELPERS ================= */

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "live":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-b-2 border-red-600 rounded-full" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Events</h1>

        {/* Draft Events */}
        {draftEvents.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-4">Draft Events</h2>
            <div className="bg-white border rounded-xl divide-y">
              {draftEvents.map((event) => (
                <div key={event.id} className="p-6 flex justify-between">
                  <div className="flex gap-4">
                    <img
                      src={event.thumbnail}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{event.name}</h3>
                      <span className="text-sm text-yellow-600">Draft</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 text-sm border rounded-md text-red-600">
                    Continue Editing
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Published Events */}
        <div className="bg-white border rounded-xl divide-y">
          {filteredPublishedEvents.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No events found
            </div>
          ) : (
            filteredPublishedEvents.map((event) => (
              <div key={event.id} className="p-6 flex justify-between">
                <div className="flex gap-4">
                  <Image
                    alt=""
                    width={64}
                    height={64}
                    src={event.thumbnail || ""}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full h-fit ${getStatusColor(
                      event.status
                    )}`}
                  >
                    {event.status}
                  </span>
                </div>

                <div className="flex gap-4 text-gray-500">
                  <Edit className="h-4 w-4 cursor-pointer" />
                  <Users className="h-4 w-4 cursor-pointer" />
                  <BarChart3 className="h-4 w-4 cursor-pointer" />
                  <Copy
                    className="h-4 w-4 cursor-pointer hover:text-black"
                    onClick={() => handleShare(event)}
                  />
                  <Eye className="h-4 w-4 cursor-pointer" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
