import React from 'react';
import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="px-[5vw] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
                <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-1">
                    A product from Beond Innovations
                </p>
                <p className="text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} GraburPass. All rights reserved.
                </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-gray-500">
                <Link href="/privacy-policy" className="hover:text-red-600 transition-colors">Privacy Policy</Link>
                <Link href="/terms-and-conditions" className="hover:text-red-600 transition-colors">Terms of Service</Link>
                <Link href="/refund-policy" className="hover:text-red-600 transition-colors">Refund Policy</Link>
            </div>
        </div>
    </footer>
  );
}
