"use client"
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Download,
  QrCode,
  Ticket,
  Loader2,
} from 'lucide-react';
import { auth, db } from "@/utils/configs/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";

interface Booking {
  id: string;
  eventName: string;
  date: string; // ISO date string
  time: string;
  ticketCount: number;
  status: 'confirmed' | 'cancelled' | 'pending';
  amount: number;
  orderId: string;
}

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let unsubscribeOrders: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true);
        try {
          const q = query(
            collection(db, "orders"),
            where("customerId", "==", currentUser.uid)
          );

          unsubscribeOrders = onSnapshot(q, (querySnapshot) => {
            const fetchedBookings: Booking[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              // Map Firestore Order to Booking UI model
              let status: Booking['status'] = 'pending';
              if (data.status === 'SUCCESS') status = 'confirmed';
              else if (data.status === 'FAILED') status = 'cancelled';
              else status = 'pending';

              const createdAtDate = data.createdAt ? (typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt.toDate()) : new Date();

              fetchedBookings.push({
                id: doc.id,
                eventName: data.eventName || "Event Ticket",
                date: createdAtDate.toISOString(),
                time: createdAtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                ticketCount: 1, // Defaulting to 1 as create-order doesn't support multiples yet
                status: status,
                amount: data.amount,
                orderId: data.orderId
              });
            });

            // Sort by date descending
            fetchedBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setBookings(fetchedBookings);
            setLoading(false);
          }, (error) => {
             console.error("Error fetching bookings:", error);
             setLoading(false);
          });

        } catch (error) {
          console.error("Error setting up listener:", error);
          setLoading(false);
        }
      } else {
        setBookings([]);
        setLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);


  const currentDate = new Date().getTime();

  const filteredBookings = bookings.filter(booking => {
    // For "Past" vs "Upcoming", we'll use the event date logic. 
    // Since we don't have eventDate stored in order yet, we'll use booking date as proxy or just show all confirmed in upcoming?
    // Let's assume generic logic: All confirmed/pending are 'upcoming' (active), cancelled/old are 'past' (history)
    // OR simpler: Just show all in 'upcoming' for now if date checks are hard without eventDate.
    // ACTUAL: We'll compare booking.date. If it's a ticket for a future event, it's upcoming.
    // Since we only have 'createdAt', let's just put everything in 'upcoming' for now unless it is cancelled?
    // Let's stick to user request: "keep features". User's mock had dates.
    // Current tradeoff: I will classify everything as 'upcoming' unless it's older than today.
    
    const bookingTime = new Date(booking.date).getTime();
    // Using booking creation time isn't great for "Upcoming Events" tab, but it's what we have.
    // A better approach: 'Upcoming' = Confirmed/Pending, 'Past' = Cancelled/Rejected?
    // Let's stick to the Tab names. 
    // Upcoming = Confirmed & Pending.
    // Past = Cancelled or Completed (we don't have completed).
    
    if (activeTab === 'upcoming') {
        return booking.status === 'confirmed' || booking.status === 'pending';
    } else {
        return booking.status === 'cancelled';
    }
  });

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewTicket = (id: string) => {
    setSelectedBookingId(id);
    setShowQrModal(true);
  };

  const selectedBooking = selectedBookingId ? bookings.find(b => b.id === selectedBookingId) : null;

  if (loading) {
     return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600 h-8 w-8" /></div>;
  }

  if (!user) {
      return <div className="p-10 text-center">Please login to view bookings.</div>
  }

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
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'past'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History / Cancelled
          </button>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-sm text-gray-500">
                {activeTab === 'upcoming' ? 'You have no active tickets.' : 'No transaction history available.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map(booking => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${booking.status === 'confirmed' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Calendar className={`h-6 w-6 ${booking.status === 'confirmed' ? 'text-green-600' : 'text-gray-500'}`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{booking.eventName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                             {/* Displaying Booking Date as we don't have Event Date yet */}
                            <span>Booked: {new Date(booking.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{booking.ticketCount} ticket(s)</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.toUpperCase()}
                          </span>
                           <span className="text-gray-400 text-xs">#{booking.orderId.slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleViewTicket(booking.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="View Ticket"
                          >
                            <QrCode className="h-4 w-4" />
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
              <h3 className="text-lg font-semibold text-gray-900">Entrance Ticket</h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="text-center mb-4">
              {/* QR Mockup */}
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-dashed border-gray-300">
                 <div className="text-center">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <span className="text-xs text-gray-500 font-mono">{selectedBooking.orderId}</span>
                 </div>
              </div>
              <p className="text-sm text-gray-600">Show this order ID at the venue</p>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p><span className="font-medium">Event:</span> {selectedBooking.eventName}</p>
              <p><span className="font-medium">Date:</span> {new Date(selectedBooking.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Tickets:</span> {selectedBooking.ticketCount}</p>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
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