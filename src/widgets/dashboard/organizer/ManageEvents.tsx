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
  Power,
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
import { SITE_URL } from "@/utils/constants/constansts";
import Link from "next/link";

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
  registrationOpen: boolean;
}

/* ================= HELPERS ================= */

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
  const [eventTypeTab, setEventTypeTab] = useState<"published" | "drafts">(
    "published"
  );
  const [statusFilter, setStatusFilter] = useState<"all" | "live">("all");
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
          registrationOpen: data.registrationOpen !== false,
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
          registrationOpen: false,
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
    const path = `${slug}--${event.id}`;
    const sharePromise = async () => {
      // Save only once
      if (!event.slug || !event.shareUrl) {
        await updateDoc(doc(db, "published_events", event.id), {
          slug: path,
          shareUrl,
        });

        setPublishedEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, slug, shareUrl } : e))
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
    toast.promise(sharePromise(), {
      loading: "Generating share link...",
      success: "Event link copied!",
      error: "Failed to generate share link",
    });
  };

  const handleToggleRegistration = async (event: Event) => {
    const newStatus = !event.registrationOpen;
    const updatePromise = async () => {
      await updateDoc(doc(db, "published_events", event.id), {
        registrationOpen: newStatus,
      });

      setPublishedEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, registrationOpen: newStatus } : e
        )
      );
    };

    toast.promise(updatePromise(), {
      loading: newStatus
        ? "Opening registration..."
        : "Stopping registration...",
      success: newStatus
        ? "Registration opened! 🟢"
        : "Registration stopped! 🔴",
      error: "Failed to update status",
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

  /* ================= NAVIGATION ================= */

  const navigateToCreate = () => {
    window.location.href = "/dashboard/organizer/new-event";
  };

  const navigateToEdit = (eventId: string, isDraft: boolean) => {
    if (isDraft) {
      // Assuming drafts are handled via query param or specific route
      window.location.href = `/dashboard/organizer/new-event?draftId=${eventId}`;
    } else {
      // Published events might be editable or just viewable
      window.location.href = `/dashboard/organizer/edit-event/${eventId}`; // Adjust route if needed
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-64 bg-gray-100 rounded-lg"></div>
          </div>
          <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg space-y-3">
              <div className="h-3 w-24 bg-gray-100 rounded"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl w-full max-w-sm">
          <div className="h-8 flex-1 bg-gray-100 rounded-lg"></div>
          <div className="h-8 flex-1 bg-gray-100 rounded-lg"></div>
        </div>

        {/* List Skeleton */}
        <div className="bg-white rounded-lg space-y-4 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="h-16 w-16 bg-gray-200 rounded-lg shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/4 bg-gray-100 rounded"></div>
              </div>
              <div className="hidden sm:block h-8 w-24 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Manage Events
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            View and manage all your published and drafted events
          </p>
        </div>

        <Link
          href={"/dashboard/organizer/new-event"}
          className="bg-red-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
        >
          <div className="bg-white/20 p-1 rounded-md">
            <Edit className="w-4 h-4" />
          </div>
          Create New Event
        </Link>
      </div>

      {/* Stats Overview (Optional Enhancement) */}
      {!loading && (publishedEvents.length > 0 || draftEvents.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Total Events
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {publishedEvents.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Total Drafts
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {draftEvents.length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Total Attendees
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {publishedEvents.reduce((acc, curr) => acc + curr.attendees, 0)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-xs font-semibold text-gray-400 uppercase">
              Total Sales
            </p>
            <p className="text-2xl font-bold text-gray-800">
              {publishedEvents.reduce((acc, curr) => acc + curr.sales, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-1 rounded-xl">
        <div className="flex bg-gray-50 p-1 rounded-lg">
          <button
            onClick={() => setEventTypeTab("published")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              eventTypeTab === "published"
                ? "bg-white text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Published{" "}
            <span
              className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                eventTypeTab === "published"
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {publishedEvents.length}
            </span>
          </button>
          <button
            onClick={() => setEventTypeTab("drafts")}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              eventTypeTab === "drafts"
                ? "bg-white text-red-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Drafts{" "}
            <span
              className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                eventTypeTab === "drafts"
                  ? "bg-red-50 text-red-600"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {draftEvents.length}
            </span>
          </button>
        </div>

        {eventTypeTab === "published" && (
          <div className="flex gap-2 mt-2 sm:mt-0">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "upcoming"
                  ? "bg-red-50 text-red-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeTab === "past"
                  ? "bg-red-50 text-red-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Past
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      {eventTypeTab === "drafts" ? (
        /* Draft Events Content */
        <div className="bg-white rounded-lg divide-y divide-gray-100 overflow-hidden">
          {draftEvents.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <Edit className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold">No drafts found</p>
                <p className="text-sm text-gray-500">
                  You don't have any event drafts saved.
                </p>
              </div>
              <button
                onClick={navigateToCreate}
                className="text-red-600 font-semibold text-sm hover:underline"
              >
                Create a new draft
              </button>
            </div>
          ) : (
            draftEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative h-16 w-16 min-w-[4rem] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={event.thumbnail || "/default-event-thumb.jpg"}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      Last edited on {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/organizer/new-event?draftId=${event.id}`}
                  className="px-4 py-2 text-sm font-semibold bg-gray-50 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all w-full sm:w-auto text-center"
                >
                  Continue Editing
                </Link>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Published Events Content */
        <div className="bg-white rounded-lg divide-y divide-gray-100 overflow-hidden">
          {filteredPublishedEvents.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-900 font-semibold">No events found</p>
                <p className="text-sm text-gray-500">
                  {activeTab === "upcoming"
                    ? "You don't have any upcoming events scheduled."
                    : "You haven't hosted any events in the past."}
                </p>
              </div>
              {activeTab === "upcoming" && (
                <button
                  onClick={navigateToCreate}
                  className="text-red-600 font-semibold text-sm hover:underline"
                >
                  Create your first event
                </button>
              )}
            </div>
          ) : (
            filteredPublishedEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 sm:p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6 hover:bg-gray-50 transition-colors group"
              >
                {/* Event Info */}
                <div className="flex gap-4 items-center flex-1">
                  <div className="relative h-20 w-20 min-w-[5rem] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      alt={event.name}
                      fill
                      src={event.thumbnail || ""}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${getStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status}
                      </span>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-4 group-hover:text-red-600 transition-colors">
                      {event.name}
                    </h3>

                    <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {event.attendees}{" "}
                        Attendees
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5" /> {event.sales}{" "}
                        Sales
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4 pt-4 lg:pt-0">
                  <div className="flex items-center bg-gray-50 rounded-lg p-1">
                    <button
                      title="Edit Event"
                      onClick={() => navigateToEdit(event.id, false)}
                      className="p-2 hover:bg-white rounded-md transition-all text-gray-500 hover:text-red-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button
                      title="Copy Link"
                      onClick={() => handleShare(event)}
                      className="p-2 hover:bg-white rounded-md transition-all text-gray-500 hover:text-green-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button
                      title="View Page"
                      onClick={() =>
                        window.open(
                          `${SITE_URL}/events/${
                            event.slug || slugify(event.name)
                          }--${event.id}`,
                          "_blank"
                        )
                      }
                      className="p-2 hover:bg-white rounded-md transition-all text-gray-500 hover:text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button
                      title={
                        event.registrationOpen
                          ? "Stop Registration"
                          : "Resume Registration"
                      }
                      onClick={() => handleToggleRegistration(event)}
                      className={`p-2 hover:bg-white rounded-md transition-all ${
                        event.registrationOpen
                          ? "text-green-600 hover:text-red-600"
                          : "text-red-600 hover:text-green-600"
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    className="bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-black transition-all"
                    onClick={() =>
                      (window.location.href = `/dashboard/organizer/analytics/${event.id}`)
                    }
                  >
                    Analytics
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
