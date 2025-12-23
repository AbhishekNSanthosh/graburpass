import React from 'react';

export default function EffortlessManagement() {
  return (
    <section className="relative  py-16 lg:py-24 overflow-hidden">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Say goodbye to
              <span className="block text-red-600">manual check-ins!</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              All your events and ticket scans are automatically recorded and stored in our secure database. 
              You can access attendee insights, analytics, and reports anytime, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
              >
                View Dashboard
              </a>
              <a
                href="/features"
                className="inline-flex items-center justify-center px-6 py-3 border border-red-600 text-base font-medium rounded-lg text-red-600 bg-transparent hover:bg-red-50 transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Illustration */}
          <div className="lg:order-1 relative">
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-8">
                {/* QR Scan Icon */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4 lg:mb-0">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0v-1m0 1V4a2 2 0 112 2h-2zm0 0A2 2 0 0110 12H8a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v2" />
                    </svg>
                  </div>
                </div>
                {/* Event Data Icons */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">100% Scanned</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-4">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Real-Time Analytics</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center lg:text-left">
                <p className="text-sm text-gray-500">Powered by graburpass—Seamless, Secure, Event-Ready.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}