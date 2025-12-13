"use client";

import React, { useState } from "react";
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

export default function Home() {
  const userName = "Abhishek"; // from auth later
  const isOrganizer = true; // role check later

  // Mock data – could fetch from API
  const summaryData = [
    {
      title: "Next Event",
      value: "React Conf 2025",
      subtitle: "In 11 days",
      icon: CalendarDays,
      href: "/events/react-conf-2025",
      bgColor: "bg-gradient-to-br from-red-400 to-red-600",
      textColor: "text-white",
    },
    {
      title: "Upcoming Events",
      value: "2",
      subtitle: "Scheduled",
      icon: Clock,
      href: "/events/upcoming",
      bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
      textColor: "text-white",
    },
    {
      title: "Past Events Attended",
      value: "9",
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
          value: "3",
          subtitle: "Live / Upcoming",
          icon: Ticket,
          href: "/organizer/events",
          bgColor: "bg-gradient-to-br from-green-400 to-green-600",
          textColor: "text-white",
        },
        {
          title: "Tickets Sold",
          value: "124",
          subtitle: "Across your events",
          icon: BarChart3,
          href: "/organizer/analytics",
          bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-600",
          textColor: "text-white",
        },
      ]
    : [];

  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-8">
      {/* Welcome Banner */}
      {showWelcome && (
        <div className="relative bg-white rounded-xl  p-6 border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowWelcome(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <AlertCircle className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Welcome back, {userName}!</h2>
              <p className="text-sm text-gray-600 mt-1">
                {isOrganizer ? "Ready to manage your events?" : "Discover amazing events near you."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {[...summaryData, ...organizerData].map((item, index) => (
          <SummaryCard key={index} {...item} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityCard title="Recent Bookings" icon={Calendar}>
          <ActivityItem
            title="React Conference 2025"
            subtitle="24 Dec 2025 · Bengaluru · 2 tickets"
            href="/bookings/react-conf"
            status="confirmed"
          />
          <ActivityItem
            title="AI Summit 2025"
            subtitle="5 Jan 2026 · Mumbai · Pending payment"
            href="/bookings/ai-summit"
            status="pending"
          />
        </ActivityCard>

        {isOrganizer && (
          <ActivityCard title="Recent Event Creations" icon={TrendingUp}>
            <ActivityItem
              title="Startup Meetup"
              subtitle="10 Jan 2026 · Kochi · 45 attendees"
              href="/organizer/startup-meetup"
              status="live"
            />
            <ActivityItem
              title="Tech Workshop"
              subtitle="15 Feb 2026 · Delhi · Draft"
              href="/organizer/tech-workshop"
              status="draft"
            />
          </ActivityCard>
        )}
      </div>

      {/* Quick Actions – for better UX */}
      {isOrganizer ? (
        <QuickActions />
      ) : (
        <QuickActions userView />
      )}
    </div>
  );
}

/* ---------- Components ---------- */

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  bgColor: string;
  textColor: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  bgColor,
  textColor,
}: SummaryCardProps) {
  const content = (
    <div className="relative">
      <div
        className={`absolute -top-4 -right-4 w-24 h-24 ${bgColor} opacity-10 rotate-12`}
      />
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`h-12 w-12 ${bgColor} ${textColor} p-3 rounded-lg flex items-center justify-center  ml-4`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block group rounded-xl bg-white p-6  border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
        aria-label={`View ${title}`}
      >
        {content}
      </a>
    );
  }

  return (
    <div className="group rounded-xl bg-white p-6  border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {content}
    </div>
  );
}

interface ActivityCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

function ActivityCard({ title, icon: Icon, children }: ActivityCardProps) {
  return (
    <div className="rounded-xl bg-white p-6  border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-red-100 p-2 rounded-lg">
          <Icon className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  subtitle: string;
  href?: string;
  status?: "confirmed" | "pending" | "live" | "draft";
}

function ActivityItem({ title, subtitle, href, status }: ActivityItemProps) {
  const getStatusColor = (status: ActivityItemProps["status"]) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "live": return "bg-blue-100 text-blue-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const content = (
    <div className="group flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700">{title}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
          <MapPin className="h-3 w-3" />
          <span>{subtitle}</span>
        </p>
      </div>
      {status && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
    </div>
  );

  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}

function QuickActions({ userView = false }: { userView?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {userView ? (
        <>
          <ActionButton
            icon={CalendarDays}
            title="Browse Events"
            description="Discover upcoming events near you"
            href="/events"
          />
          <ActionButton
            icon={Ticket}
            title="My Bookings"
            description="View and manage your tickets"
            href="/bookings"
          />
          <ActionButton
            icon={Users}
            title="My Network"
            description="Connect with other attendees"
            href="/network"
          />
        </>
      ) : (
        <>
          <ActionButton
            icon={Ticket}
            title="Create Event"
            description="Launch your next big event"
            href="/organizer/create"
          />
          <ActionButton
            icon={BarChart3}
            title="View Analytics"
            description="Track performance and insights"
            href="/organizer/analytics"
          />
          <ActionButton
            icon={TrendingUp}
            title="Promote Event"
            description="Boost visibility with ads"
            href="/organizer/promote"
          />
        </>
      )}
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}

function ActionButton({ icon: Icon, title, description, href }: ActionButtonProps) {
  return (
    <a
      href={href}
      className="group rounded-xl bg-white p-6  border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center"
    >
      <div className="w-12 h-12 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center mb-4 transition-colors">
        <Icon className="h-6 w-6 text-red-600" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700">{title}</h4>
      <p className="text-sm text-gray-500">{description}</p>
    </a>
  );
}