"use client";
import React, { useState } from "react";
import {
  Plus,
  Search,
  Bell,
  HelpCircle,
} from "lucide-react";

interface TopbarProps {
  onCreateEvent?: () => void;
  onSearch?: (query: string) => void;
  currentTab?: "upcoming" | "past";
  onTabChange?: (tab: "upcoming" | "past") => void;
  userName?: string;
}

export default function Topbar({
  onCreateEvent,
  onSearch,
  currentTab = "upcoming",
  onTabChange,
  userName = "Abhishek Santhosh",
}: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-14 w-full items-center justify-between border-gray-200 pl-1 pr-3 bg-white">
      
      {/* Left */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-medium text-primary">
          Welcome, <span className="font-semibold">{userName} 👋</span>
        </h1>

      </div>

      {/* Center Tabs */}

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}


        {/* Icons */}
        <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
        </button>

        <button className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Avatar */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
          <span className="mt-[-1px]">{userName.charAt(0).toUpperCase()}</span>
        </button>
      </div>
    </div>
  );
}
