"use client"
import React, { useState } from 'react';
import {
  Calendar,
  Image,
  Edit,
  Users,
  BarChart3,
  Copy,
  Filter,
  ChevronDown,
  Eye,
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  thumbnail: string;
  date: string; // ISO date
  status: 'draft' | 'live' | 'completed' | 'cancelled';
  attendees: number;
  sales: number;
}

export default function ManageEvents() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  // Mock data
  const allEvents: Event[] = [
    {
      id: '1',
      name: 'React Conf 2026',
      thumbnail: '/event-thumb-1.jpg', // Placeholder
      date: '2026-01-15',
      status: 'live',
      attendees: 150,
      sales: 124,
    },
    {
      id: '2',
      name: 'AI Workshop',
      thumbnail: '/event-thumb-2.jpg',
      date: '2025-12-20',
      status: 'draft',
      attendees: 0,
      sales: 0,
    },
    {
      id: '3',
      name: 'Startup Meetup',
      thumbnail: '/event-thumb-3.jpg',
      date: '2025-11-10',
      status: 'completed',
      attendees: 45,
      sales: 89,
    },
    {
      id: '4',
      name: 'Tech Seminar',
      thumbnail: '/event-thumb-4.jpg',
      date: '2026-02-05',
      status: 'live',
      attendees: 78,
      sales: 67,
    },
    {
      id: '5',
      name: 'Dev Hackathon',
      thumbnail: '/event-thumb-5.jpg',
      date: '2025-10-01',
      status: 'cancelled',
      attendees: 0,
      sales: 0,
    },
  ];

  const currentDate = new Date('2025-12-13').getTime();
  const filteredEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.date).getTime();
      const isUpcoming = eventDate >= currentDate;
      if (activeTab === 'upcoming' && !isUpcoming) return false;
      if (activeTab === 'past' && isUpcoming) return false;
      if (statusFilter === 'live' && event.status !== 'live') return false;
      if (statusFilter === 'draft' && event.status !== 'draft') return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'live': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = (eventId: string, action: string) => {
    console.log(`Action ${action} on event ${eventId}`);
    // Mock: e.g., navigate to edit page
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md"
              >
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-lg rounded-md border z-10">
                  <button
                    onClick={() => { setStatusFilter('all'); setFilterOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left ${statusFilter === 'all' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setStatusFilter('live'); setFilterOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left ${statusFilter === 'live' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => { setStatusFilter('draft'); setFilterOpen(false); }}
                    className={`block w-full px-4 py-2 text-sm text-left ${statusFilter === 'draft' ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    Draft
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-sm text-gray-500">Create your first event to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEvents.map(event => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <img
                        src={event.thumbnail || '/default-event-thumb.jpg'}
                        alt={event.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{event.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleAction(event.id, 'edit')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(event.id, 'attendees')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="View Attendees"
                      >
                        <Users className="h-4 w-4" />
                        <span className="sr-only">View Attendees ({event.attendees})</span>
                      </button>
                      <button
                        onClick={() => handleAction(event.id, 'analytics')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="View Analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="sr-only">View Analytics (Sales: {event.sales})</span>
                      </button>
                      <button
                        onClick={() => handleAction(event.id, 'duplicate')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction(event.id, 'view')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}