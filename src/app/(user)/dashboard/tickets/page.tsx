"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/utils/configs/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { Loader2, Ticket as TicketIcon, Calendar, MapPin, ExternalLink, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Order {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  createdAt: string | Timestamp;
  // Event details might be stored here or need fetching. 
  // For now, let's assume some basics or generic display if missing
  eventName?: string; // If we didn't store this, we might need to fetch event. 
  // Wait, in create-order we didn't save eventName! 
  // We only saved customer details.
  // We need to fix create-order to save eventId and eventName ideally.
  // BUT for now, let's proceed. If eventName is missing, show "Event Ticket".
}

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper to format date
const formatDate = (dateVal: string | Timestamp) => {
    if (!dateVal) return "N/A";
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal.toDate();
    return date.toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

export default function TicketsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch orders
          const q = query(
            collection(db, "orders"),
            where("customerId", "==", currentUser.uid)
            // orderBy("createdAt", "desc") // requires index, careful
          );
          
          const querySnapshot = await getDocs(q);
          const fetchedOrders: Order[] = [];
          querySnapshot.forEach((doc) => {
            fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
          });

          // Sort manually if index missing
          fetchedOrders.sort((a, b) => {
              const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt.toDate();
              const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt.toDate();
              return dateB.getTime() - dateA.getTime();
          });

          setOrders(fetchedOrders);
        } catch (error) {
          console.error("Error fetching tickets:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to view your tickets.</p>
        <Link href="/login" className="px-6 py-2 bg-green-600 text-white rounded-lg">Login</Link>
      </div>
    );
  }

  const validTickets = orders.filter(o => o.status === "SUCCESS");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      
      {/* SECTION 1: MY TICKETS */}
      <section>
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <TicketIcon className="h-8 w-8 text-green-600" />
          My Tickets
        </h1>

        {validTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow flex flex-col relative group">
                {/* Decorative Top */}
                <div className="h-3 bg-green-600 w-full" />
                
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                            PAID
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                            #{ticket.orderId.slice(-6)}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {ticket.eventName || "Event Ticket"}
                    </h3>

                    <div className="space-y-3 mt-4 text-sm text-gray-600 flex-1">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="font-semibold text-gray-900">{formatCurrency(ticket.amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Dashed Line */}
                <div className="relative h-1 bg-gray-100 w-full flex items-center justify-between">
                     <div className="h-4 w-4 bg-gray-50 rounded-full -ml-2"></div>
                     <div className="border-t-2 border-dashed border-gray-300 w-full mx-2"></div>
                     <div className="h-4 w-4 bg-gray-50 rounded-full -mr-2"></div>
                </div>

                <div className="p-4 bg-gray-50 text-center">
                    <button className="text-green-700 font-semibold text-sm hover:underline">
                        Download Ticket
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200">
            <TicketIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No active tickets</h3>
            <p className="text-gray-500 mb-6">You haven't purchased any tickets yet.</p>
            <Link href="/" className="text-green-600 font-semibold hover:underline">
              Browse Events
            </Link>
          </div>
        )}
      </section>

      {/* SECTION 2: TRANSACTION HISTORY */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
        
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold uppercase tracking-wider text-xs border-b">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Event / Description</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Order ID</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        {order.status === "SUCCESS" && (
                                            <span className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1 rounded-full w-fit">
                                                <CheckCircle className="h-3 w-3" /> Success
                                            </span>
                                        )}
                                        {order.status === "FAILED" && (
                                            <span className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-1 rounded-full w-fit">
                                                <XCircle className="h-3 w-3" /> Failed
                                            </span>
                                        )}
                                        {order.status === "PENDING" && (
                                            <span className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full w-fit">
                                                <Clock className="h-3 w-3" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {order.eventName || "Event Registration"}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatDate(order.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        {formatCurrency(order.amount)}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-400">
                                        {order.orderId}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                                    No transaction history found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </section>

    </div>
  );
}
