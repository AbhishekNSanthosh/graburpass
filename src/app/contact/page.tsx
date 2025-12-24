import Footer from '@/widgets/common/Footer';
import Header from '@/widgets/common/Header';
import React from 'react';

export default function page() {
  return (
    <main className="bg-white">
        <Header/>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-[14vh]">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-3 text-gray-600">
            Reach out to us for any queries related to GraburPass.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-8 space-y-8 text-sm text-gray-700">

          {/* Platform Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Platform
            </h2>
            <p>GraburPass</p>
            <p className="text-gray-500">
              A digital ticketing and event management platform
            </p>
          </div>

          {/* Legal Entity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Operated By
            </h2>
            <p>Beond Innovations</p>
            <p className="text-gray-500">
              MSME Registered (UDYAM-KL-01-0060286)
            </p>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Registered Address
            </h2>
            <p>
              78, Nalpathil Chira<br />
              Payattupakka, Veliyanadu<br />
              Alappuzha, Kerala – 686534<br />
              India
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Contact Details
            </h2>
            <p>📞 Phone: +91 7907247909</p>
            <p>📧 Email: reach.abhisheksanthosh@gmail.com</p>
          </div>

        </div>
      </div>
      <Footer/>
    </main>
  );
}
