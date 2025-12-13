import Sidebar from '@/widgets/common/dashboard/Sidebar';
import Topbar from '@/widgets/common/dashboard/Topbar'; // Assuming you have or will create a Topbar component
import React from 'react';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-52 bg-white shadow-xs md:relative md:translate-x-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white px-6 shadow-xs">
          <Topbar />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}