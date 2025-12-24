"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  History,
  Ticket,
  BarChart3,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/configs/firebaseConfig";

/* ================= TYPES ================= */

interface Event {
  id: string;
  name: string;
  date: string;
  slug?: string;
  ticketsSold?: number;
}

interface Booking {
  eventName: string;
  eventDate: string;
  city: string;
  tickets: number;
  status: "confirmed" | "pending";
}

interface DashboardData {
  nextEvent?: Event;
  upcomingCount: number;
  pastCount: number;
  activeEvents: number;
  ticketsSold: number;
  recentBookings: Booking[];
  recentEvents: Event[];
}

/* ================= PAGE ================= */

export default function Home() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [userName, setUserName] = useState("User");
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user?.email) return;

      setUserName(user.displayName || "User");
      setIsOrganizer(true); // 🔴 replace with role logic later

      const now = Date.now();

      /* -------- EVENTS -------- */
      const eventsSnap = await getDocs(
        query(
          collection(db, "published_events"),
          where("creatorEmail", "==", user.email)
        )
      );

      const events: Event[] = eventsSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Event[];

      const upcoming = events.filter(
        (e) => new Date(e.date).getTime() >= now
      );

      const past = events.filter(
        (e) => new Date(e.date).getTime() < now
      );

      const nextEvent = upcoming.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];

      const ticketsSold = events.reduce(
        (sum, e) => sum + (e.ticketsSold ?? 0),
        0
      );

      /* -------- BOOKINGS -------- */
      const bookingsSnap = await getDocs(
        query(
          collection(db, "bookings"),
          where("userEmail", "==", user.email)
        )
      );

      const bookings: Booking[] = bookingsSnap.docs.map((d) => d.data()) as Booking[];

      setDashboard({
        nextEvent,
        upcomingCount: upcoming.length,
        pastCount: past.length,
        activeEvents: upcoming.length,
        ticketsSold,
        recentBookings: bookings.slice(0, 2),
        recentEvents: upcoming.slice(0, 2),
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ================= LOADING ================= */

  if (loading || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  /* ================= SUMMARY DATA ================= */

  const summaryData = [
    {
      title: "Next Event",
      value: dashboard.nextEvent?.name || "—",
      subtitle: dashboard.nextEvent
        ? new Date(dashboard.nextEvent.date).toDateString()
        : "No upcoming events",
      icon: CalendarDays,
      href: dashboard.nextEvent
        ? `/e/${dashboard.nextEvent.slug}--${dashboard.nextEvent.id}`
        : undefined,
      bgColor: "bg-gradient-to-br from-red-400 to-red-600",
      textColor: "text-white",
    },
    {
      title: "Upcoming Events",
      value: String(dashboard.upcomingCount),
      subtitle: "Scheduled",
      icon: Clock,
      href: "/events/upcoming",
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
      textColor: "text-white",
    },
    {
      title: "Past Events Attended",
      value: String(dashboard.pastCount),
      subtitle: "Completed",
      icon: History,
      href: "/events/past",
      bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
      textColor: "text-white",
    },
  ];

  const organizerData = isOrganizer
    ? [
        {
          title: "Active Events",
          value: String(dashboard.activeEvents),
          subtitle: "Live / Upcoming",
          icon: Ticket,
          href: "/organizer/manage-events",
          bgColor: "bg-gradient-to-br from-green-400 to-green-600",
          textColor: "text-white",
        },
        {
          title: "Tickets Sold",
          value: String(dashboard.ticketsSold),
          subtitle: "Across your events",
          icon: BarChart3,
          href: "/organizer/analytics",
          bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-600",
          textColor: "text-white",
        },
      ]
    : [];

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-8">
      {/* Welcome */}
      {showWelcome && (
        <div className="relative bg-white rounded-xl p-6  border border-gray-200">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 text-gray-400"
          >
            <AlertCircle className="h-5 w-5" />
          </button>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome back, {userName}!</h2>
              <p className="text-sm text-gray-600">
                {isOrganizer
                  ? "Ready to manage your events?"
                  : "Discover amazing events near you."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...summaryData, ...organizerData].map((item, i) => (
          <SummaryCard key={i} {...item} />
        ))}
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard title="Recent Bookings" icon={Calendar}>
          {dashboard.recentBookings.length === 0 ? (
            <p className="text-sm text-gray-500">No bookings yet</p>
          ) : (
            dashboard.recentBookings.map((b, i) => (
              <ActivityItem
                key={i}
                title={b.eventName}
                subtitle={`${b.eventDate} · ${b.city} · ${b.tickets} tickets`}
                status={b.status}
              />
            ))
          )}
        </ActivityCard>

        {isOrganizer && (
          <ActivityCard title="Recent Event Creations" icon={TrendingUp}>
            {dashboard.recentEvents.map((e) => (
              <ActivityItem
                key={e.id}
                title={e.name}
                subtitle={new Date(e.date).toDateString()}
                status="live"
              />
            ))}
          </ActivityCard>
        )}
      </div>

      <QuickActions userView={!isOrganizer} />
    </div>
  );
}

/* ================= SHARED COMPONENTS ================= */
/* (unchanged — exactly as your originals) */

function SummaryCard({ title, value, subtitle, icon: Icon, href, bgColor, textColor }: any) {
  const content = (
    <div className="relative">
      <div className={`absolute -top-4 -right-4 w-24 h-24 ${bgColor} opacity-10 rotate-12`} />
      <div className="relative z-10 flex justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`h-12 w-12 ${bgColor} ${textColor} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block bg-white p-6 rounded-xl  border border-gray-200 hover:shadow-lg">
      {content}
    </a>
  ) : (
    <div className="bg-white p-6 rounded-xl  border border-gray-200">{content}</div>
  );
}

function ActivityCard({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white p-6 rounded-xl  border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-100 p-2 rounded-lg">
          <Icon className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ActivityItem({ title, subtitle, status }: any) {
  return (
    <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {subtitle}
        </p>
      </div>
      {status && (
        <span className="text-xs px-2 py-1 rounded-full bg-gray-200">
          {status}
        </span>
      )}
    </div>
  );
}

function QuickActions({ userView }: { userView?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {userView ? (
        <>
          <ActionButton title="Browse Events" href="/events" icon={CalendarDays} />
          <ActionButton title="My Bookings" href="/bookings" icon={Ticket} />
          <ActionButton title="My Network" href="/network" icon={Users} />
        </>
      ) : (
        <>
          <ActionButton title="Create Event" href="/organizer/create" icon={Ticket} />
          <ActionButton title="View Analytics" href="/organizer/analytics" icon={BarChart3} />
          <ActionButton title="Promote Event" href="/organizer/promote" icon={TrendingUp} />
        </>
      )}
    </div>
  );
}

function ActionButton({ title, href, icon: Icon }: any) {
  return (
    <a href={href} className="bg-white p-6 rounded-xl  border border-gray-200 text-center hover:shadow-lg">
      <div className="w-12 h-12 bg-red-100 rounded-lg mx-auto flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-red-600" />
      </div>
      <h4 className="font-semibold">{title}</h4>
    </a>
  );
}
