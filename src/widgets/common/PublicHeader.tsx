"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HelpCircle } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 h-16 md:h-20 transition-all">
      <div className="px-[5vw] h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative h-8 w-32 md:h-10 md:w-40 block transition-opacity hover:opacity-80">
          <Image src="/mainlogo.svg" alt="GraburPass" fill className="object-contain object-left" priority />
        </Link>
        
        {/* Support */}
        <Link href="/contact" className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition-colors bg-gray-50 px-4 py-2 rounded-full hover:bg-gray-100">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span>Support</span>
        </Link>
      </div>
    </header>
  );
}
