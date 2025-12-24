"use client";
import React from "react";

export default function Hero() {
  return (
    <div className="relative px-[5vw] pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
        {/* Left Content */}
        <div className="lg:w-1/2 lg:pr-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            <span className="block text-red-600">GraburPass</span>
            Smart Event Ticketing,
            <span className="block">Made Simple</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            GraburPass is a modern digital ticketing platform that helps event
            organizers create events, sell tickets, and manage QR-based entry
            with real-time insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a
              href="/events"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold rounded-lg text-red-600 border border-red-600 hover:bg-red-50 transition-all duration-300"
            >
              Talk to Us
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            Trusted by colleges, communities, and event organizers.
          </p>
        </div>

        {/* Right Visual */}
        <div className="relative lg:w-1/2 lg:ml-8 mt-12 lg:mt-0">
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-12 transition-transform duration-500 hover:-translate-y-1">
            <div className="flex items-center justify-center h-64 lg:h-80 bg-gradient-to-br from-red-50 to-white rounded-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"
                    />
                  </svg>
                </div>

                <p className="text-lg font-semibold text-gray-900">
                  QR-Based Entry
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Fast, secure check-ins for every event
                </p>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 text-center">
              Powered by GraburPass · Simple · Secure · Scalable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
