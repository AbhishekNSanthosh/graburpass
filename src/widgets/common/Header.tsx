"use client";

import { MoveRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/configs/firebaseConfig";

const navItems = [
  { title: "events", to: "/events" },
  { title: "pricing", to: "/#pricing" },
  { title: "contact", to: "/contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  return (
    <>
      <header className="fixed top-0 z-10 w-full bg-white">
        <div className="px-[5vw] py-4 flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-0">

          {/* Logo */}
          <div className="flex flex-1 flex-col items-start">
            <Link
              href="/"
              className="text-3xl md:text-4xl font-bold text-primary -mb-1"
            >
              Graburpass
            </Link>
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

          {/* Auth Action */}
          <div className="flex flex-1 items-center justify-end">
            {isLoggedIn ? (
              <Link
                href="/dashboard/home"
                className="flex items-center gap-2 font-medium text-red-600 hover:text-red-700"
              >
                Dashboard <MoveRight className="mt-1" />
              </Link>
            ) : (
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 font-medium"
              >
                Login <MoveRight className="mt-1" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modal */}
      {!isLoggedIn && (
        <LoginModal open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
