import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className=" px-[5vw] py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-2xl font-bold text-red-500">Graburpass</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              GraburPass is a digital ticketing and event management platform
              operated by <strong>Beond Innovations</strong>.
            </p>
            <p className="text-gray-500 text-xs leading-relaxed mb-6">
              We provide technology solutions for event organizers including
              online ticket sales, QR-based check-ins, and analytics.
            </p>

            <div className="flex space-x-4">
              {/* Social icons unchanged */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-red-500 text-sm">Home</a></li>
              <li><a href="/events" className="text-gray-400 hover:text-red-500 text-sm">Events</a></li>
              <li><a href="/dashboard" className="text-gray-400 hover:text-red-500 text-sm">Dashboard</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-red-500 text-sm">Support</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {/* <li><a href="/about" className="text-gray-400 hover:text-red-500 text-sm">About Us</a></li> */}
              <li><a href="/contact" className="text-gray-400 hover:text-red-500 text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li><a href="/privacy-policy" className="text-gray-400 hover:text-red-500 text-sm">Privacy Policy</a></li>
              <li><a href="/terms-and-conditions" className="text-gray-400 hover:text-red-500 text-sm">Terms & Conditions</a></li>
              <li><a href="/refund-policy" className="text-gray-400 hover:text-red-500 text-sm">Refund & Cancellation Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-6 text-center text-xs text-gray-400 space-y-2">
          <p>
            © 2025 GraburPass. All rights reserved.
          </p>
          <p>
            Operated by <strong>Beond Innovations</strong> · MSME (UDYAM-KL-01-0060286)
          </p>
          <p>
            78, Nalpathil Chira, Payattupakka, Veliyanadu, Alappuzha, Kerala – 686534
          </p>
        </div>
      </div>
    </footer>
  );
}
