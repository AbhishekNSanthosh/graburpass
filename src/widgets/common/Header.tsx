"use client";

import { MoveRight } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import LoginModal from "./LoginModal";

const navItems = [
  { title: "about", to: "" },
  { title: "events", to: "" },
  { title: "pricing", to: "" },
  { title: "contact", to: "" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 z-10 w-full bg-white">
        <div className="px-[5vw] py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-0">

          {/* Logo */}
          <div className="flex flex-1 flex-col items-start">
            <h1 className="text-3xl md:text-4xl font-bold text-primary -mb-1">
              graburpass
            </h1>
            <span className="text-sm text-gray-500 font-light">
              Your all-in-one digital ticketing platform
            </span>
          </div>

          {/* Nav */}
          <nav className="flex flex-2 items-center justify-center gap-[4vw]">
            {navItems.map((item, index) => (
              <Link key={index} href={item.to} className="capitalize">
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Login */}
          <div className="flex flex-1 items-center justify-end">
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 font-medium"
            >
              Login <MoveRight className="mt-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal */}
      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
