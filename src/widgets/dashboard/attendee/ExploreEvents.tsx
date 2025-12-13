"use client"
import React, { useState } from 'react';
import {
  Search,
  Calendar,
  MapPin,
  Filter,
  ChevronDown,
  TrendingUp,
  Star,
  Clock,
  Globe,
  Ticket,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Event {
  id: string;
  banner: string;
  name: string;
  date: string; // ISO date
  location: string;
  locationType: 'online' | 'offline';
  price: number | null; // null for free
  category: string;
}

export default function ExploreEvents() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPrice, setSelectedPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'online' | 'offline'>('all');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'all'>('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 9;

  // Mock data (filtered by current date: Dec 13, 2025)
  const allEvents: Event[] = [
    {
      id: '1',
      banner: '/event-banner-1.jpg',
      name: 'React Conf 2026',
      date: '2026-01-15',
      location: 'Bengaluru Convention Center',
      locationType: 'offline',
      price: 499,
      category: 'Conference',
    },
    {
      id: '2',
      banner: '/event-banner-2.jpg',
      name: 'AI Workshop Online',
      date: '2025-12-20',
      location: 'Zoom Webinar',
      locationType: 'online',
      price: null,
      category: 'Workshop',
    },
    {
      id: '3',
      banner: '/event-banner-3.jpg',
      name: 'Startup Meetup',
      date: '2025-12-18',
      location: 'Kochi Startup Hub',
      locationType: 'offline',
      price: 299,
      category: 'Meetup',
    },
    {
      id: '4',
      banner: '/event-banner-4.jpg',
      name: 'Tech Seminar',
      date: '2026-02-05',
      location: 'Delhi Tech Park',
      locationType: 'offline',
      price: null,
      category: 'Seminar',
    },
    {
      id: '5',
      banner: '/event-banner-5.jpg',
      name: 'Dev Hackathon',
      date: '2025-12-25',
      location: 'Virtual Hackathon Platform',
      locationType: 'online',
      price: 199,
      category: 'Workshop',
    },
    {
      id: '6',
      banner: '/event-banner-6.jpg',
      name: 'Music Concert',
      date: '2025-12-30',
      location: 'Mumbai Arena',
      locationType: 'offline',
      price: 999,
      category: 'Concert',
    },
    {
      id: '7',
      banner: '/event-banner-7.jpg',
      name: 'Data Science Bootcamp',
      date: '2026-01-10',
      location: 'Online via Google Meet',
      locationType: 'online',
      price: null,
      category: 'Workshop',
    },
    {
      id: '8',
      banner: '/event-banner-8.jpg',
      name: 'Blockchain Summit',
      date: '2025-12-22',
      location: 'Hyderabad Expo',
      locationType: 'offline',
      price: 799,
      category: 'Conference',
    },
    {
      id: '9',
      banner: '/event-banner-9.jpg',
      name: 'Free Coding Meetup',
      date: '2025-12-28',
      location: 'Chennai Co-working Space',
      locationType: 'offline',
      price: null,
      category: 'Meetup',
    },
    // Add more for pagination demo
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `extra-${i}`,
      banner: '/event-banner-placeholder.jpg',
      name: `Extra Event ${i + 1}`,
      date: '2026-01-20',
      location: `Location ${i + 1}`,
      locationType: 'offline' as const,
      price: i % 2 === 0 ? null : 399,
      category: 'Conference',
    })),
  ];

  const categories = ['all', 'Conference', 'Workshop', 'Meetup', 'Concert', 'Seminar'];

  const currentDate = new Date('2025-12-13').getTime();

  const filteredEvents = allEvents
    .filter(event => {
      const eventDate = new Date(event.date).getTime();
      const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = dateFilter === 'all' || eventDate >= currentDate;
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesPrice = selectedPrice === 'all' || (selectedPrice === 'free' ? event.price === null : event.price !== null);
      const matchesLocation = selectedLocation === 'all' || event.locationType === selectedLocation;
      return matchesSearch && matchesDate && matchesCategory && matchesPrice && matchesLocation;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);

  // Trending/Recommended: Top 3 by mock popularity
  const trendingEvents = filteredEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header & Search */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Events</h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-gray-400 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as 'upcoming' | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="upcoming">Upcoming Events</option>
              <option value="all">All Events</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="flex items-center space-x-2">
            <Ticket className="h-5 w-5 text-gray-500" />
            <select
              value={selectedPrice}
              onChange={e => setSelectedPrice(e.target.value as 'all' | 'free' | 'paid')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Location Filter */}
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-500" />
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value as 'all' | 'online' | 'offline')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Locations</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Trending Section */}
        {trendingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-red-600" />
              Trending Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingEvents.map(event => (
                <EventCard key={event.id} event={event} isTrending />
              ))}
            </div>
          </section>
        )}

        {/* Events Grid */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Events</h2>
          {paginatedEvents.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or search.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  isTrending?: boolean;
}

function EventCard({ event, isTrending = false }: EventCardProps) {
  const formatPrice = (price: number | null) => {
    if (price === null) return 'Free';
    return `₹${price}`;
  };

  return (
    <a href={`/events/${event.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative h-48 bg-gray-200">
          <img
            src={event.banner || '/default-banner.jpg'}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {isTrending && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 inline mr-1" />
              Trending
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {event.category}
            </span>
            <span className="text-sm text-gray-500">
              {event.locationType === 'online' ? <Globe className="h-3 w-3 inline mr-1" /> : <MapPin className="h-3 w-3 inline mr-1" />}
              {event.locationType}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">{event.name}</h3>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-1 font-medium text-gray-900">
              <Clock className="h-4 w-4" />
              <span>TBA</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-red-600">{formatPrice(event.price)}</span>
            <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Get Tickets</span>
            </button>
          </div>
        </div>
      </div>
    </a>
  );
}