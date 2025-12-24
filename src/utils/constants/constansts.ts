import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Users,
  BarChart3,
  Compass,
  Home,
  UsersRound,
  BadgePlus,
  UserRound,
} from "lucide-react";

export const sidebarSections = [
  {
    items: [
      {
        name: "Home",
        link: "/dashboard/home",
        icon: Home,
      },
      {
        name: "My Profile",
        link: "/dashboard/profile",
        icon: UserRound
      },
    ],
  },
  {
    label: "Organizer Mode",
    items: [
      {
        name: "Create Event",
        link: "/dashboard/organizer/new-event",
        icon: BadgePlus,
      },
      {
        name: "Manage Events",
        link: "/dashboard/organizer/manage-events",
        icon: LayoutDashboard,
      },
      // {
      //   name: "Tickets",
      //   link: "/organizer/tickets",
      //   icon: Ticket,
      // },
      // {
      //   name: "Attendees",
      //   link: "/organizer/attendees",
      //   icon: Users,
      // },
      // {
      //   name: "Analytics",
      //   link: "/organizer/analytics",
      //   icon: BarChart3,
      // },
    ],
  },
  {
    label: "Attendee Mode",
    items: [
      {
        name: "Explore Events",
        link: "/dashboard/attendee/explore-events",
        icon: Compass,
      },
      {
        name: "My Bookings",
        link: "/dashboard/attendee/my-bookings",
        icon: Ticket,
      },
    ],
  },
];

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (typeof window !== "undefined" ? window.location.origin : "");
