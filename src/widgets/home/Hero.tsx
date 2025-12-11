"use client"
import React from 'react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Elements */}
      {/* <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div> */}

      <div className="relative px-[5vw] pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2 lg:pr-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              <span className="block text-red-600">Ticko</span>
              Your Events,
              <span className="block">Effortlessly Ticketed</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Create, manage, and scan digital tickets with QR codes in seconds. From small gatherings to epic events—Ticko handles it all with seamless check-ins and real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/events"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
              >
                Create Your Event
              </a>
              <a
                href="/demo"
                className="inline-flex items-center justify-center px-8 py-3 border border-red-600 text-base font-medium rounded-md text-red-600 bg-transparent hover:bg-red-50 transition-all duration-300"
              >
                Watch Demo
              </a>
            </div>
          </div>
          <div className="relative lg:w-1/2 lg:ml-8 mt-12 lg:mt-0">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 lg:p-12 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-center h-64 lg:h-80 bg-gradient-to-r from-red-50 to-red-50 rounded-xl">
                <div className="text-center">
                  <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2M7.5 17.5l-2.5-2.5L7.5 11l4 4L21 7l-7 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Scan & Attend</p>
                  <p className="text-sm text-gray-600 mt-1">QR-powered entry</p>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>Powered by Ticko—Simple, Secure, Scalable.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}