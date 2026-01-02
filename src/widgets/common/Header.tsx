"use client";

import { MoveRight, Sun, Moon, Menu, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/configs/firebaseConfig";
import { useTheme } from "next-themes";
import Image from "next/image";

const navItems = [
  { title: "events", to: "/events" },
  { title: "pricing", to: "/#pricing" },
  { title: "contact", to: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe(); // cleanup listener
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileOpen]);

  return (
    <>
      <header className="fixed top-0 z-50 w-full glass-nav transition-all duration-300 border-b border-black/5">
        <div className="w-full px-[5vw] h-20 flex items-center justify-between">

          {/* Logo */}
          <div className="flex-1 flex justify-start z-50 relative">
            <Link href="/" onClick={() => setMobileOpen(false)} className="relative h-10 w-40 block transition-opacity hover:opacity-80">
              <Image 
                src="/mainlogo.svg" 
                alt="Graburpass" 
                fill
                className="object-contain object-left"
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav - Centered */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-1">
            {navItems.map((item, index) => (
              <Link key={index} href={item.to} className="capitalize text-sm font-medium text-muted hover:text-foreground px-4 py-2 rounded-full transition-all hover:bg-black/5">
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Action */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard/home"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
              >
                Dashboard <MoveRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 transition-all shadow-sm hover:translate-y-[-1px]"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex flex-1 justify-end z-50 relative">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ top: '0' }}
      >
        <div className="flex flex-col h-full p-6 pt-28 pb-8">
          
          <nav className="flex-1 flex flex-col space-y-2">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.to} 
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between p-4 rounded-xl hover:bg-black/5 transition-all duration-300 ${
                   mobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <span className="text-xl font-medium capitalize text-foreground">{item.title}</span>
                <MoveRight className="w-5 h-5 text-muted/50" />
              </Link>
            ))}
          </nav>

          <div 
            className={`mt-auto transition-all duration-500 delay-200 ${
              mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
             {isLoggedIn ? (
              <Link
                href="/dashboard/home"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-white text-base font-medium hover:bg-primary/90 transition-all shadow-sm"
              >
                Go to Dashboard <MoveRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 px-6 py-4 rounded-xl bg-foreground text-background hover:opacity-90 transition-all shadow-sm"
              >
                <span className="text-base font-bold">Login / Sign Up</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
