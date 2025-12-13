"use client"
import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Download,
  QrCode,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Ticket,
} from 'lucide-react';

interface Booking {
  id: string;
  eventName: string;
  date: string; // ISO date
  time: string;
  ticketCount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  qrCode: string; // Mock QR data
}

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Mock data (current date: Dec 13, 2025)
  const allBookings: Booking[] = [
    {
      id: '1',
      eventName: 'React Conf 2026',
      date: '2026-01-15',
      time: '10:00 AM',
      ticketCount: 2,
      status: 'confirmed',
      qrCode: 'mock-qr-1', // Placeholder for QR
    },
    {
      id: '2',
      eventName: 'AI Workshop',
      date: '2025-12-20',
      time: '2:00 PM',
      ticketCount: 1,
      status: 'confirmed',
      qrCode: 'mock-qr-2',
    },
    {
      id: '3',
      eventName: 'Startup Meetup',
      date: '2025-11-10',
      time: '6:00 PM',
      status: 'completed',
      ticketCount: 3,
      qrCode: 'mock-qr-3',
    },
    {
      id: '4',
      eventName: 'Tech Seminar',
      date: '2025-12-05',
      time: '9:00 AM',
      ticketCount: 1,
      status: 'cancelled',
      qrCode: 'mock-qr-4',
    },
    {
      id: '5',
      eventName: 'Dev Hackathon',
      date: '2025-12-25',
      time: '8:00 AM',
      ticketCount: 4,
      status: 'confirmed',
      qrCode: 'mock-qr-5',
    },
  ];

  const currentDate = new Date('2025-12-13').getTime();

  const filteredBookings = allBookings.filter(booking => {
    const bookingDate = new Date(booking.date).getTime();
    const isUpcoming = bookingDate >= currentDate;
    return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
  });

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewTicket = (id: string) => {
    setSelectedBookingId(id);
    setShowQrModal(true);
  };

  const handleDownloadTicket = (id: string) => {
    // Mock PDF download
    const link = document.createElement('a');
    link.href = `/api/ticket/${id}/pdf`; // Mock endpoint
    link.download = `ticket-${id}.pdf`;
    link.click();
    console.log(`Downloading ticket for ${id}`);
  };

  const handleCancelBooking = (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      // Mock update
      console.log(`Cancelling booking ${id}`);
      // In real app: API call to update status
    }
  };

  const selectedBooking = selectedBookingId ? allBookings.find(b => b.id === selectedBookingId) : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'upcoming'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'past'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Past
          </button>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-sm text-gray-500">
                {activeTab === 'upcoming' ? 'Book your first event!' : 'All past bookings will appear here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{booking.eventName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{booking.ticketCount} tickets</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewTicket(booking.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="View Ticket"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadTicket(booking.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Cancel Booking"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQrModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ticket QR Code</h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center mb-4">
              {/* Mock QR - In real app, use qrcode.react or canvas */}
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-2">
                <QrCode className="h-12 w-12 text-gray-500" />
              </div>
              <p className="text-sm text-gray-600">Scan this QR at the venue</p>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p><span className="font-medium">Event:</span> {selectedBooking.eventName}</p>
              <p><span className="font-medium">Date:</span> {new Date(selectedBooking.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Tickets:</span> {selectedBooking.ticketCount}</p>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => handleDownloadTicket(selectedBooking.id)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}