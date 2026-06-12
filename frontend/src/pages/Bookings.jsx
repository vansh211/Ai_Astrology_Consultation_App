import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Check, X, AlertCircle, Compass } from 'lucide-react';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/bookings');
      setBookings(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Failed to fetch bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (appId, status) => {
    try {
      await axios.patch(`/bookings/${appId}`, { status });
      fetchBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Calendar className="w-8 h-8 text-astro-dark animate-bounce" />
        <span className="text-astro-muted text-sm ml-2">Loading appointments schedule...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-astro-border">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-astro-dark">
            {user.role === 'client' ? 'My Consultation Bookings' : 'Client Consultation Schedule'}
          </h1>
          <p className="text-astro-muted text-xs mt-1">
            Audit time slots, confirm booking requests, and review pending sessions
          </p>
        </div>
        {user.role === 'client' && (
          <Link
            to="/marketplace"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-astro-cream hover:bg-astro-cream-dark text-astro-dark border border-astro-border hover:border-astro-dark transition-all"
          >
            Request New Slot
          </Link>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="astro-card p-16 text-center rounded-2xl border border-astro-border">
          <Calendar className="w-12 h-12 text-astro-muted/60 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-astro-dark mb-1">No Bookings Scheduled</h3>
          <p className="text-astro-muted text-sm mb-4">You have no pending, completed, or active bookings lists.</p>
          {user.role === 'client' && (
            <Link
              to="/marketplace"
              className="px-6 py-2.5 rounded-lg astro-btn-primary text-white font-semibold text-xs shadow-lg"
            >
              Browse Astrologers
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => {
            const dateStr = new Date(booking.date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={booking._id}
                className="astro-card p-6 rounded-2xl border border-astro-border flex flex-col justify-between"
              >
                <div>
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-astro-muted font-medium">{dateStr}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-950/60 border border-emerald-500/35 text-green-700'
                          : booking.status === 'completed'
                          ? 'bg-astro-cream border border-astro-border text-astro-dark'
                          : booking.status === 'cancelled'
                          ? 'bg-rose-950/60 border border-rose-500/35 text-red-600'
                          : 'bg-amber-950/60 border border-amber-500/35 text-amber-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Header Title */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-astro-cream border border-astro-border text-astro-muted">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-astro-dark">
                        {user.role === 'client'
                          ? `Dr. ${booking.astrologerId?.userId?.name || 'Astrologer'}`
                          : booking.clientId?.name}
                      </h3>
                      <p className="text-[10px] text-astro-muted uppercase tracking-wider">
                        {user.role === 'client'
                          ? booking.astrologerId?.specialization
                          : 'Client Account'}
                      </p>
                    </div>
                  </div>

                  {/* Time Detail */}
                  <div className="flex items-center gap-2 text-xs text-astro-dark mb-4 bg-astro-cream p-2.5 rounded-lg border border-astro-border">
                    <Clock className="w-3.5 h-3.5 text-astro-muted" />
                    <span>Time Slot: <strong className="text-astro-dark">{booking.slot}</strong></span>
                  </div>

                  {/* Client query notes */}
                  {booking.notes && (
                    <div className="mb-4">
                      <p className="text-[10px] font-bold text-astro-muted uppercase tracking-wider mb-1">Notes</p>
                      <p className="text-astro-muted text-xs italic bg-astro-cream p-2 rounded border border-astro-border">
                        "{booking.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions Block */}
                {user.role === 'astrologer' && booking.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-astro-border mt-4">
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'confirmed')}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-900/50 hover:bg-emerald-800 text-green-700 font-bold text-xs border border-emerald-500/20 flex items-center justify-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                      className="flex-1 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800 text-red-600 font-bold text-xs border border-rose-500/20 flex items-center justify-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
