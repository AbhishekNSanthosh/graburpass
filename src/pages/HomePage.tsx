import React from "react";
import Header from "../widgets/common/Header";
import Hero from "@/widgets/home/Hero";
import EffortlessManagement from "@/widgets/home/Landing";
import Footer from "@/widgets/common/Footer";

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <EffortlessManagement />
      <section className="bg-white py-16" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Simple & Transparent Pricing
            </h2>
            <p className="mt-3 text-gray-600">
              Flexible plans designed for events of all sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="border rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">Starter</h3>
              <p className="text-gray-500 mt-2">For small events</p>
              <p className="text-3xl font-bold text-red-500 mt-4">₹0</p>
              <p className="text-sm text-gray-500">+ platform fee per ticket</p>

              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✔ Event listing</li>
                <li>✔ Online ticket sales</li>
                <li>✔ QR code tickets</li>
                <li>✔ Basic analytics</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="border-2 border-red-500 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
              <p className="text-gray-500 mt-2">For growing events</p>
              <p className="text-3xl font-bold text-red-500 mt-4">Custom</p>
              <p className="text-sm text-gray-500">Contact us for pricing</p>

              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✔ Everything in Starter</li>
                <li>✔ Organizer dashboard</li>
                <li>✔ Attendee management</li>
                <li>✔ Priority support</li>
              </ul>
            </div>

            {/* Enterprise */}
            <div className="border rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Enterprise
              </h3>
              <p className="text-gray-500 mt-2">Large & recurring events</p>
              <p className="text-3xl font-bold text-red-500 mt-4">Custom</p>
              <p className="text-sm text-gray-500">Tailored solutions</p>

              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✔ Custom integrations</li>
                <li>✔ Dedicated support</li>
                <li>✔ Advanced analytics</li>
                <li>✔ SLA-based services</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
