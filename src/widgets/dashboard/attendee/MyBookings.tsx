"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  XCircle,
  QrCode,
  Ticket,
  Grid,
  List,
  MapPin,
} from "lucide-react";
import { auth, db } from "@/utils/configs/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Image from "next/image";

/* ================= TYPES ================= */

interface Booking {
  id: string;
  eventName: string;
  date: string; // ISO date string
  time: string;
  ticketCount: number;
  status: "confirmed" | "cancelled" | "pending";
  amount: number;
  orderId: string;
  posterUrl?: string; // If available in order data or we fetch it
}

/* ================= COMPONENT ================= */

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    let unsubscribeOrders: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          const q = query(
            collection(db, "orders"),
            where("customerId", "==", currentUser.uid)
          );

          unsubscribeOrders = onSnapshot(
            q,
            (querySnapshot) => {
              const fetchedBookings: Booking[] = [];
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                let status: Booking["status"] = "pending";
                if (data.status === "SUCCESS") status = "confirmed";
                else if (data.status === "FAILED") status = "cancelled";
                else status = "pending";

                const createdAtDate = data.createdAt
                  ? typeof data.createdAt === "string"
                    ? new Date(data.createdAt)
                    : data.createdAt.toDate()
                  : new Date();

                fetchedBookings.push({
                  id: doc.id,
                  eventName: data.eventName || "Event Ticket",
                  date: createdAtDate.toISOString(),
                  time: createdAtDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  ticketCount: data.quantity || 1,
                  status: status,
                  amount: data.amount,
                  orderId: data.orderId,
                  posterUrl: data.eventPoster || "/default-event-thumb.jpg",
                });
              });

              // Sort by date descending
              fetchedBookings.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );

              setBookings(fetchedBookings);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching bookings:", error);
              setLoading(false);
            }
          );
        } catch (error) {
          console.error("Error setting up listener:", error);
          setLoading(false);
        }
      } else {
        setBookings([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  /* ================= HELPERS ================= */

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return booking.status === "confirmed" || booking.status === "pending";
    } else {
      return booking.status === "cancelled";
    }
  });

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleViewTicket = (id: string) => {
    setSelectedBookingId(id);
    setShowQrModal(true);
  };

  const selectedBooking = selectedBookingId
    ? bookings.find((b) => b.id === selectedBookingId)
    : null;

  /* ================= SKELETON ================= */

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8">
        <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 w-24 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-10 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-10 w-10 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 w-full bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className=" flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Please log in</h2>
        <p className="text-gray-500">
          You need to be logged in to view your bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-6 space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            My Bookings
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Manage and view your event tickets
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100/50 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === "upcoming"
                ? "bg-red-50 text-red-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === "past"
                ? "bg-red-50 text-red-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100/50 p-1 rounded-lg self-end sm:self-auto">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredBookings.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4 bg-gray-50/50 rounded-lg">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-lg">
              No bookings found
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === "upcoming"
                ? "You have no confirmed upcoming tickets."
                : "No booking history available."}
            </p>
          </div>
          {activeTab === "upcoming" && (
            <a
              href="/dashboard/attendee/explore-events"
              className="text-red-600 font-bold text-sm hover:underline"
            >
              Find events near you
            </a>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredBookings.map((booking) =>
            viewMode === "list" ? (
              // LIST ITEM
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row sm:items-center gap-6 bg-white p-4 sm:p-6 rounded-lg hover:bg-gray-50 transition-all group"
              >
                <div className="relative h-20 w-20 min-w-[5rem] rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={booking.posterUrl || "/default-event-thumb.jpg"}
                    alt={booking.eventName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      #{booking.orderId.slice(-6)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-red-600 transition-colors">
                    {booking.eventName}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(booking.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {booking.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {booking.ticketCount} Tickets
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:border-l sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 mt-4 sm:mt-0">
                  <p className="font-black text-lg text-gray-900 min-w-[80px]">
                    ₹{booking.amount}
                  </p>
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleViewTicket(booking.id)}
                      className="p-2 sm:p-3 bg-gray-100 hover:bg-green-50 text-gray-500 hover:text-green-600 rounded-lg transition-all"
                      title="View Ticket QR"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // GRID CARD
              <div
                key={booking.id}
                className="bg-white p-4 rounded-lg hover:bg-gray-50 transition-all group flex flex-col h-full"
              >
                <div className="relative h-40 w-full rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={booking.posterUrl || "/default-event-thumb.jpg"}
                    alt={booking.eventName}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {booking.eventName}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {/* Placeholder location since we don't have it on order yet */}
                      Venue TBA
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="font-black text-gray-900">
                    ₹{booking.amount}
                  </span>
                  {booking.status === "confirmed" && (
                    <button
                      onClick={() => handleViewTicket(booking.id)}
                      className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      View Ticket
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-auto relative shadow-2xl">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-black text-gray-900">
                Entrance Ticket
              </h3>
              <p className="text-sm text-gray-500">
                Scan this QR code at the venue entrance
              </p>

              <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 inline-block">
                <QrCode className="h-32 w-32 text-gray-900 mx-auto" />
              </div>

              <div className="space-y-1">
                <p className="font-mono text-sm font-bold text-gray-400 tracking-wider">
                  ORDER ID
                </p>
                <p className="font-mono text-lg font-bold text-gray-900">
                  {selectedBooking.orderId}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Event</span>
                  <span className="font-bold text-gray-900 truncate max-w-[200px]">
                    {selectedBooking.eventName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-bold text-gray-900">
                    {new Date(selectedBooking.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tickets</span>
                  <span className="font-bold text-gray-900">
                    {selectedBooking.ticketCount} Person(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
