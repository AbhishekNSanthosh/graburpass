"use client";
import React, { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  TrendingUp,
  Star,
  Clock,
  Globe,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import Image from "next/image";
import Link from "next/link";

/* ================= TYPES ================= */

interface Event {
  id: string;
  name: string;
  slug?: string;
  posterUrl?: string;
  date: string;
  location: string;
  locationType?: "online" | "offline";
  price: number | null;
  category?: string;
  description?: string;
  sales?: number;
  attendees?: number;
}

/* ================= COMPONENT ================= */

export default function ExploreEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState<"all" | "free" | "paid">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<"upcoming" | "all">("upcoming");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsRef = collection(db, "published_events");
        // Fetch all published events
        // In a real app with many events, you'd want to paginate at the query level
        const q = query(eventsRef, orderBy("date", "asc"));
        const snap = await getDocs(q);

        const events: Event[] = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Event[];

        setAllEvents(events);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  /* ================= FILTER LOGIC ================= */

  const now = Date.now();

  const filteredEvents = allEvents.filter((event) => {
    const eventTime = new Date(event.date).getTime();

    // Search
    const matchesSearch = event.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category
    const matchesCategory =
      selectedCategory === "all" ||
      (event.category || "Uncategorized") === selectedCategory;

    // Price
    const isFree = !event.price || event.price === 0;
    const matchesPrice =
      selectedPrice === "all" ||
      (selectedPrice === "free" && isFree) ||
      (selectedPrice === "paid" && !isFree);

    // Date
    const matchesDate =
      dateFilter === "all" || (dateFilter === "upcoming" && eventTime >= now);

    return matchesSearch && matchesCategory && matchesPrice && matchesDate;
  });

  // Calculate distinct categories from data for the dropdown
  const categories = Array.from(
    new Set(allEvents.map((e) => e.category || "Uncategorized"))
  ).filter(Boolean);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  /* ================= SKELETON ================= */

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6">
          <div className="h-10 w-64 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 space-y-4">
              <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8 animate-fade-in-up">
      {/* Header & Search */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Explore Events
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Discover and book tickets for the best events near you.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 text-gray-400 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by name..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-900 font-medium placeholder-gray-400"
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 text-gray-500 -translate-y-1/2" />
          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value as "upcoming" | "all")
            }
            className="pl-9 pr-4 py-2.5 bg-white rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer"
          >
            <option value="upcoming">Upcoming</option>
            <option value="all">All Dates</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 text-gray-500 -translate-y-1/2" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-white rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div className="relative">
          <Ticket className="absolute left-3 top-1/2 h-4 w-4 text-gray-500 -translate-y-1/2" />
          <select
            value={selectedPrice}
            onChange={(e) =>
              setSelectedPrice(e.target.value as "all" | "free" | "paid")
            }
            className="pl-9 pr-8 py-2.5 bg-white rounded-lg text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 appearance-none cursor-pointer"
          >
            <option value="all">Any Price</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="space-y-6">
        {paginatedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No events found</h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or filters to find what you're looking
              for.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 w-8 rounded-lg text-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-red-600 text-white"
                          : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ================= SUB-COMPONENTS ================= */

function EventCard({ event }: { event: Event }) {
  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return "Free";
    return `₹${price}`;
  };

  const eventDate = new Date(event.date);

  return (
    <Link
      href={`/events/${
        event.slug || event.name.toLowerCase().replace(/ /g, "-")
      }--${event.id}`}
      className="group block bg-white rounded-lg overflow-hidden hover:bg-gray-50 transition-colors"
    >
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden rounded-lg mb-4">
        <Image
          src={event.posterUrl || "/default-event-thumb.jpg"}
          alt={event.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Date Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-center shadow-sm">
          <span className="block text-xs font-bold text-red-600 uppercase">
            {eventDate.toLocaleString("default", { month: "short" })}
          </span>
          <span className="block text-lg font-black text-gray-900 leading-none">
            {eventDate.getDate()}
          </span>
        </div>
      </div>

      <div className="space-y-3 px-1">
        <div className="flex items-center justify-between">
          <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {event.category || "General"}
          </span>
          <span className="text-lg font-black text-green-600">
            {formatPrice(event.price)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
          {event.name}
        </h3>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {eventDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
