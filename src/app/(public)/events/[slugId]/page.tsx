"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import {
  Calendar,
  MapPin,
  Ticket,
  ArrowLeft,
  Loader2,
  Globe,
  Info,
  CheckCircle2,
  Share2,
  User,
} from "lucide-react";
import PublicHeader from "@/widgets/common/PublicHeader";
import PublicFooter from "@/widgets/common/PublicFooter";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { FastAverageColor } from "fast-average-color";

/* ---------------- helpers ---------------- */

const lighten = (rgb: number[], amt: number) =>
  rgb.map((v) => Math.min(255, v + amt));

const isVeryDark = (rgb: number[]) => (rgb[0] + rgb[1] + rgb[2]) / 3 < 60;

/* ---------------- component ---------------- */

export default function PublicEventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slugId = params?.slugId as string;
  const isPreview = searchParams?.get("preview") === "true";
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bgStyle, setBgStyle] = useState("");
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number | null>(
    null
  );
  const [highlightTickets, setHighlightTickets] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  /* ---------------- fetch event ---------------- */

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const collection = isPreview ? "event_drafts" : "published_events";

        const actualId = slugId?.includes("--")
          ? slugId.split("--").pop()
          : slugId;

        const snap = await getDoc(doc(db, collection, actualId!));

        if (!snap.exists()) {
          toast.error("Event not found");
          router.push("/");
          return;
        }

        setEvent({ id: snap.id, ...snap.data() });
      } catch {
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [slugId, isPreview, router]);

  /* ---------------- dynamic background ---------------- */

  useEffect(() => {
    if (!imgRef.current) return;

    const fac = new FastAverageColor();
    const img = imgRef.current;

    if (!img.naturalHeight) return;

    Promise.all([
      fac.getColorAsync(img, {
        algorithm: "dominant",
        height: img.naturalHeight / 2,
      }),
      fac.getColorAsync(img, {
        algorithm: "dominant",
        top: img.naturalHeight / 2,
        height: img.naturalHeight / 2,
      }),
    ])
      .then(([top, bottom]) => {
        let topRgb = top.value.slice(0, 3);
        let bottomRgb = bottom.value.slice(0, 3);

        // 🔑 DARK POSTER FIX
        if (isVeryDark(topRgb)) {
          topRgb = [45, 55, 85]; // navy-blue lift
          bottomRgb = [30, 35, 60];
        } else {
          topRgb = lighten(topRgb, 90);
          bottomRgb = lighten(bottomRgb, 90);
        }

        setBgStyle(`
        radial-gradient(
          circle at 60% 25%,
          rgba(${topRgb.join(",")}, 0.28),
          transparent 55%
        ),
        linear-gradient(
          180deg,
          rgba(${topRgb.join(",")}, 0.24),
          rgba(${bottomRgb.join(",")}, 0.30)
        )
      `);
      })
      .catch(console.error);

    return () => fac.destroy();
  }, [event?.posterUrl]);

  /* ---------------- loading ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
        <PublicHeader />
        <main className="flex-grow pt-16 md:pt-20">
          <div className="px-[5vw] py-8 animate-pulse">
            {/* Hero Skeleton */}
            <div className="bg-white rounded-md p-6 md:p-10 border border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="h-[520px] lg:col-span-2 bg-gray-200 rounded-xl" />
              <div className="flex flex-col justify-between h-[520px] py-2">
                <div>
                  <div className="h-12 bg-gray-300 rounded-lg w-3/4 mb-6" />
                  <div className="h-8 bg-gray-200 rounded-full w-24 mb-10" />
                  <div className="space-y-4">
                    <div className="h-24 bg-gray-100 rounded-xl border border-gray-200" />
                    <div className="h-24 bg-gray-100 rounded-xl border border-gray-200" />
                  </div>
                </div>
                <div className="h-16 bg-gray-800 rounded-xl opacity-10" />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12 pb-16">
              <div className="lg:col-span-2 h-[400px] bg-white rounded-xl border border-gray-100 p-8">
                <div className="h-8 w-48 bg-gray-200 rounded-lg mb-6" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-full bg-gray-100 rounded" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="lg:col-span-1 h-[600px] bg-white rounded-xl border border-gray-100" />
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-grow pt-16 md:pt-20">
        {/* ---------- Hero Section ---------- */}
        <div className="px-[5vw] py-8">
          <div className="bg-white rounded-md p-6 md:p-10 border border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Column: Visuals (Dynamic Tint) */}
            <div className="relative h-[400px] lg:col-span-2 rounded-[10px] overflow-hidden border border-gray-200 shadow-md bg-gray-100">
              {/* Blurred background */}
              <div className="absolute inset-0">
                <Image
                  src={event.posterUrl}
                  alt="Background"
                  fill
                  className="object-cover blur-sm scale-110 opacity-100"
                />
              </div>

              {/* Main image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  ref={imgRef}
                  src={event.posterUrl}
                  alt={event.name}
                  width={450}
                  height={450}
                  className="w-full h-full object-contain drop-shadow-2xl rounded-md"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="inline-flex blur-xl absolute top-4 left-4 items-center px-4 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-bold uppercase tracking-wide">
                {event.category || "Event"}
              </div>
            </div>

            {/* Right Column: Key Details */}
            <div className="flex flex-1 flex-col justify-center h-full space-y-5 py-2">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {event.name}
                </h1>
              </div>

              <div className="space-y-3">
                <div className="flex items-start p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm mr-3 text-red-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">
                      Date & Time
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {event.date} • {event.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="bg-white p-2 rounded-lg shadow-sm mr-3 text-red-600">
                    {event.locationType === "online" ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium mb-0.5">
                      Location
                    </p>
                    <p className="text-sm text-gray-900 font-semibold max-w-sm line-clamp-2 truncate">
                      {event.locationType === "online"
                        ? "Online Event"
                        : event.venueAddress || "To be announced"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Section */}
              <div className="border-t pt-3 border-gray-100 flex flex-col gap-2">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 font-medium">
                    Starts from
                  </p>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
                    {event.ticketTypes && event.ticketTypes.length > 0
                      ? (() => {
                          const min = Math.min(
                            ...event.ticketTypes.map(
                              (t: any) => Number(t.price) || 0
                            )
                          );
                          return min === 0 ? "Free" : `₹${min}`;
                        })()
                      : "Free"}
                  </p>
                  <button
                    onClick={() => {
                      const ticketSection = document.getElementById("tickets");
                      if (ticketSection) {
                        ticketSection.scrollIntoView({ behavior: "smooth" });
                        setHighlightTickets(true);
                        setTimeout(() => setHighlightTickets(false), 2000);
                      }
                    }}
                    className="w-full bg-red-600 text-white px-6 py-3.5 rounded-xl font-bold text-base hover:bg-red-700 transition-all shadow-lg hover:shadow-red-600/30 flex items-center justify-center transform active:scale-[0.98] group"
                  >
                    <Ticket className="h-5 w-5 mr-2 group-hover:-rotate-12 transition-transform" />
                    Book Now
                  </button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-0 px-4 leading-relaxed">
                  By booking, you agree to our Terms and Policies.
                  <br />
                  Powered by <strong>GrabUrPass</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-[5vw] pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              <div className="bg-white rounded-[10px] p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Info className="h-6 w-6 mr-3 text-red-600" />
                  About This Event
                </h2>
                <div className="prose prose-lg prose-red text-gray-600 leading-relaxed whitespace-pre-line max-w-none">
                  {event.description}
                </div>
              </div>

              {/* Venue Map (Offline only) */}
              {event.locationType === "offline" && event.venueAddress && (
                <div className="bg-white rounded-[10px] p-8 border border-gray-100 ">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <MapPin className="h-6 w-6 mr-3 text-red-600" />
                    Location
                  </h2>
                  <p className="text-gray-600 mb-4 font-medium">
                    {event.venueAddress}
                  </p>
                  <div className="w-full h-80 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        event.venueAddress
                      )}&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Ticket Selection */}
            <div className="lg:col-span-1" id="tickets">
              <div className="sticky top-28 space-y-6">
                <div
                  className={`bg-white rounded-[10px] p-6 border transition-all duration-500 ${
                    highlightTickets
                      ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] scale-[1.02]"
                      : "border-gray-100"
                  }`}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                    <span>Select Tickets</span>
                    <Ticket className="h-6 w-6 text-red-600" />
                  </h3>

                  <div className="space-y-4">
                    {event.ticketTypes?.map((ticket: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedTicketIndex(idx)}
                        className={`p-4 border rounded-2xl transition-all cursor-pointer group ${
                          selectedTicketIndex === idx
                            ? "border-red-600 bg-red-50 shadow-sm"
                            : "border-gray-200 hover:border-red-500 hover:bg-red-50/50"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`font-bold group-hover:text-red-700 ${
                              selectedTicketIndex === idx
                                ? "text-red-700"
                                : "text-gray-900"
                            }`}
                          >
                            {ticket.name}
                          </span>
                          <span
                            className={`font-bold text-lg px-3 py-1 rounded-full ${
                              selectedTicketIndex === idx
                                ? "bg-red-100 text-red-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {ticket.price ? `₹${ticket.price}` : "Free"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex justify-between px-1">
                          <span className="flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                            {ticket.quantity > 0 ? "Available" : "Sold Out"}
                          </span>
                          {selectedTicketIndex === idx && (
                            <CheckCircle2 className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        if (selectedTicketIndex !== null) {
                          router.push(
                            `/events/book/${slugId}?ticketIdx=${selectedTicketIndex}`
                          );
                        } else {
                          toast.error("Please select a ticket first");
                        }
                      }}
                      disabled={selectedTicketIndex === null}
                      className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center transition-all ${
                        selectedTicketIndex !== null
                          ? "bg-red-600 text-white shadow-xl hover:bg-red-700 transform active:scale-[0.98]"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Proceed to Book{" "}
                      <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Share Card */}
                <div className="bg-white rounded-[10px] p-6 border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Share with friends
                    </h4>
                    <p className="text-xs text-gray-500">Spread the word!</p>
                  </div>
                  <button
                    className="p-3 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-full transition-colors border border-gray-100 hover:border-red-100"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }}
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Organizer Details (Sidebar) */}
                {event.organizerName && (
                  <div className="bg-white rounded-[10px] p-6 border border-gray-100">
                    <h4 className="font-semibold text-gray-900 text-sm mb-4 flex items-center uppercase tracking-wider">
                      <User className="h-4 w-4 mr-2 text-red-600" />
                      Organizer
                    </h4>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 font-bold text-lg uppercase mr-3">
                        {event.organizerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">
                          {event.organizerName}
                        </h3>
                        {/* Short bio if in sidebar, or truncated */}
                      </div>
                    </div>
                    {event.organizerDescription && (
                      <p className="text-gray-500 mt-3 text-xs leading-relaxed border-t border-gray-50 pt-3">
                        {event.organizerDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
