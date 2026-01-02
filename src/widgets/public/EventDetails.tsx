"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";
import Image from "next/image";
import { Calendar, Clock, MapPin, Share2, Users, Shield, Ticket, ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PaymentButton from "../payment/PaymentButton";
import toast from "react-hot-toast";
import PublicFooter from "../common/PublicFooter";

/* ================= TYPES ================= */

interface TicketType {
  name: string;
  price: number;
  quantity: number;
}

interface EventData {
  name: string;
  description?: string;
  posterUrl?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  location?: string;
  price: number;
  organizerName?: string;
  organizerEmail?: string;
  lat?: number;
  lng?: number;
  ticketTypes?: TicketType[];
}

/* ================= COMPONENT ================= */

export default function EventDetails() {
  const params = useParams();
  const router = useRouter();
  const slugId = params?.slugId as string;
  const eventId = slugId?.split("--").pop();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH EVENT ================= */

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        const ref = doc(db, "published_events", eventId);
        const snap = await getDoc(ref);

        if (!snap.exists()) return;

        const data = snap.data();

        // 🔹 Date
        const eventDate = data.date?.toDate?.().toISOString() ?? data.date;

        // 🔹 Time
        const startTime = data.startTime ?? data.time?.split("-")[0]?.trim();

        const endTime = data.endTime ?? data.time?.split("-")[1]?.trim();

        // 🔹 Price from ticketTypes
        const ticketTypes: TicketType[] = data.ticketTypes ?? [];

        const minPrice =
          data.isPaid && ticketTypes.length > 0
            ? Math.min(...ticketTypes.map((t) => Number(t.price)))
            : 0;

        const normalizedEvent: EventData = {
          name: data.name,
          description: data.description,
          posterUrl: data.posterUrl,
          date: eventDate,
          startTime,
          endTime,
          venue:
            data.locationType === "offline"
              ? data.venueAddress
              : "Online Event",
          location:
            data.locationType === "online"
              ? data.onlineLink
              : data.venueAddress,
          price: minPrice,
          organizerName: data.organizerName,
          organizerEmail: data.organizerEmail,
          lat: data.lat,
          lng: data.lng,
          ticketTypes: ticketTypes,
        };

        setEvent(normalizedEvent);
      } catch (err) {
        console.error("Failed to fetch event", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  /* ================= SHARE ================= */

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin border-b-2 border-primary rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Event not found</h1>
            <Link href="/events" className="text-primary hover:underline">Back to Events</Link>
        </div>
    );
  }

  const dateObj = new Date(event.date);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 h-16 flex items-center">
          <div className="w-full px-[5vw] flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
                    <Image 
                    src="/mainlogo.svg" 
                    alt="GraburPass" 
                    width={120} 
                    height={32} 
                    className="h-6 w-auto" 
                    priority
                    />
            </Link>

            {/* Support Link */}
            <Link href="/contact" className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-surface-2">
                <MessageCircle className="w-4 h-4" />
                <span>Support</span>
            </Link>
          </div>
      </div>

      <main className="flex-1 relative pb-20 pt-24">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-[50vh] bg-surface-1/50 -z-10 border-b border-black/5 dark:border-white/5" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mx-auto px-[5vw]">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* LEFT COLUMN: Content */}
                <div className="lg:col-span-8 space-y-12">
                     
                     {/* Header Section */}
                     <header className="space-y-6">
                        <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-2xl bg-surface-2 border border-black/5 group">
                            {/* Poster Image */}
                             <Image
                                src={event.posterUrl || "/default-event-thumb.jpg"}
                                alt={event.name}
                                fill
                                className="object-cover blur-3xl opacity-50 scale-110" // Blurry background
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            
                            {/* Actual Sharp Poster (Centered or contained) */}
                            <div className="absolute inset-4 sm:inset-8 flex items-center justify-center transition-transform duration-700 group-hover:scale-[1.02]">
                                <Image
                                    src={event.posterUrl || "/default-event-thumb.jpg"}
                                    alt={event.name}
                                    className="object-contain w-full h-full rounded-xl shadow-lg"
                                    width={1200}
                                    height={675}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex flex-wrap gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-surface-2 border border-black/5 text-xs font-bold uppercase tracking-wider text-muted">
                                    {event.price > 0 ? "Paid Event" : "Free Event"}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                    {event.location === "Online Event" ? "Online" : "In Person"}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
                                {event.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground">{dateObj.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Clock className="w-4 h-4 text-primary" />
                                     <span>{event.startTime} - {event.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <MapPin className="w-4 h-4 text-primary" />
                                     <span className="line-clamp-1 max-w-[200px]">{event.venue}</span>
                                </div>
                            </div>
                        </div>
                     </header>
                     
                     {/* Description */}
                     <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            Overview
                        </h2>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-muted leading-relaxed whitespace-pre-line">
                            {event.description || "No description provided."}
                        </div>
                     </section>

                     {/* Location Map */}
                     {event.lat && event.lng && (
                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold text-foreground">Location</h2>
                            <div className="w-full h-80 rounded-[2rem] overflow-hidden border border-black/5 shadow-inner bg-surface-2">
                                <iframe
                                    className="w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                                    src={`https://maps.google.com/maps?q=${event.lat},${event.lng}&z=15&output=embed`}
                                />
                            </div>
                            <p className="text-sm text-muted flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> {event.venue}
                            </p>
                        </section>
                     )}

                     {/* Organizer Info */}
                     <section className="pt-8 border-t border-black/5 dark:border-white/5">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-muted">
                                 <Users className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold text-muted uppercase tracking-wider mb-0.5">Organized by</p>
                                 <h3 className="text-lg font-bold text-foreground">{event.organizerName || "Graburpass Creator"}</h3>
                             </div>
                         </div>
                     </section>
                </div>

                {/* RIGHT COLUMN: Booking Card */}
                <aside className="lg:col-span-4 relative">
                    <div className="sticky top-28 space-y-6">
                        
                        <div className="bg-white dark:bg-[#111] border border-black/5 dark:border-white/10 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl">
                             <div className="mb-6">
                                 <p className="text-sm font-medium text-muted mb-1">Total Price</p>
                                 <div className="flex items-baseline gap-1">
                                     <span className="text-4xl font-black text-foreground">
                                         {event.price > 0 ? `₹${event.price}` : "Free"}
                                     </span>
                                     {event.price > 0 && <span className="text-sm text-muted font-medium">/ person</span>}
                                 </div>
                             </div>

                             <Link
                                href={`/events/book/${slugId}`}
                                className="group relative flex items-center justify-center gap-2 w-full text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition-all shadow-lg shadow-[#eb0028]/20"
                                style={{ backgroundColor: '#eb0028' }}
                             >
                                 Book Now 
                                 <span className="group-hover:translate-x-1 transition-transform">→</span>
                             </Link>

                             <div className="mt-6 space-y-4 pt-6 border-t border-black/5 text-sm text-muted">
                                 <div className="flex items-start gap-3">
                                     <Shield className="w-4 h-4 shrink-0 mt-0.5 text-green-500" />
                                     <p className="text-xs">
                                         <strong className="text-foreground block mb-0.5">Secure Booking</strong>
                                         Your payment information is encrypted and safe.
                                     </p>
                                 </div>
                                 <div className="flex items-start gap-3">
                                     <Ticket className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                                     <p className="text-xs">
                                         <strong className="text-foreground block mb-0.5">Instant Ticket</strong>
                                         Receive your ticket via email immediately.
                                     </p>
                                 </div>
                             </div>
                        </div>

                        {/* Share Button */}
                        <button 
                            onClick={handleShare}
                            className="w-full py-4 rounded-xl border border-black/5 bg-surface-1 hover:bg-surface-2 text-foreground font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Share2 className="w-4 h-4" /> Share Event
                        </button>
                    </div>
                </aside>

            </div>
        </div>
      </main>

      {/* Custom Minimal Footer */}
      <PublicFooter/>
    </div>
  );
}
