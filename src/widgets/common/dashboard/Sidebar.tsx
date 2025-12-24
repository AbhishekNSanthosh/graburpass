"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";

import { sidebarSections } from "@/utils/constants/constansts";
import { auth } from "@/utils/configs/firebaseConfig";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-white fixed">
      
      {/* Logo */}
      <div className="w-full flex items-center justify-center pt-[5vh] pb-[3vh]">
        <Image
          src="/logo.svg"
          alt="logo"
          width={120}
          height={40}
          priority
        />
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-6">
        {sidebarSections.map((section, index) => (
          <div key={index}>
            
            {/* Section Label */}
            {section.label && (
              <p className="px-4 mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {section.label}
              </p>
            )}

            {/* Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.link;

                return (
                  <Link
                    key={item.link}
                    href={item.link}
                    className={`flex px-5 items-center gap-3 py-2.5 relative transition
                      ${
                        isActive
                          ? "bg-red-100 text-primary font-medium"
                          : "text-gray-600 hover:bg-red-100"
                      }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 h-full w-[6px] rounded-r-md bg-primary" />
                    )}
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-4 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
