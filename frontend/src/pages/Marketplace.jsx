import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Filter, Star, AlertCircle, X, ShieldCheck, Calendar, Clock } from 'lucide-react';
import PanditCard from '../components/PanditCard';

const Marketplace = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering states
  const [specFilter, setSpecFilter] = useState('');
  const [maxFee, setMaxFee] = useState(1500);
  const [minRating, setMinRating] = useState('');

  // Booking Modal states
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Fetch astrologers list with active query parameters
  const fetchAstrologers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (specFilter) params.specialization = specFilter;
      if (minRating) params.minRating = minRating;
      if (maxFee) params.maxFee = maxFee;

      const response = await axios.get('/astrologers', { params });
      setAstrologers(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch astrologers:', err);
      setError('Failed to load astrologers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologers();
  }, [specFilter, maxFee, minRating]);

  // Handle slot options based on selected date
  useEffect(() => {
    if (!bookingDate || !selectedAstrologer) {
      setAvailableSlots([]);
      return;
    }

    const dateObj = new Date(bookingDate);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = dayNames[dateObj.getDay()];

    // Find the astrologer's availability config for this weekday
    const dayConfig = selectedAstrologer.availability.find(
      (a) => a.day.toLowerCase() === weekday.toLowerCase()
    );

    if (dayConfig && dayConfig.slots && dayConfig.slots.length > 0) {
      setAvailableSlots(dayConfig.slots);
      setBookingError('');
    } else {
      setAvailableSlots([]);
      setBookingError(`Dr. ${selectedAstrologer.userId.name} does not have slots defined on ${weekday}s`);
    }
  }, [bookingDate, selectedAstrologer]);

  const openBookingModal = (astrologer) => {
    setSelectedAstrologer(astrologer);
    setBookingDate('');
    setSelectedSlot('');
    setBookingNotes('');
    setBookingError('');
    setBookingSuccess(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !selectedSlot) {
      return setBookingError('Please select a valid date and time slot');
    }

    setBookingError('');
    setSubmittingBooking(true);

    try {
      await axios.post('/bookings', {
        astrologerId: selectedAstrologer._id,
        date: bookingDate,
        slot: selectedSlot,
        notes: bookingNotes
      });
      setBookingSuccess(true);
    } catch (err) {
      console.error('Booking failed:', err);
      setBookingError(err.response?.data?.message || 'Failed to submit booking request.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-serif font-semibold text-astro-dark mb-2">
          Find Your Pandit
        </h1>
        <p className="text-astro-muted max-w-lg mx-auto">
          Browse verified pandits and book a consultation slot that suits you
        </p>
      </div>

      {/* Grid of filters and results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Panel */}
        <div className="lg:col-span-1 astro-card p-6 rounded-2xl h-fit border border-astro-border">
          <div className="flex items-center gap-2 mb-6 border-b border-astro-border pb-3">
            <Filter className="w-5 h-5 text-astro-dark" />
            <h2 className="font-bold text-astro-dark">Refine Search</h2>
          </div>

          <div className="space-y-6">
            {/* Specialization Filter */}
            <div>
              <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-2">
                Specialization
              </label>
              <select
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-white border border-astro-border text-astro-dark text-sm focus:outline-none focus:ring-2 focus:ring-astro-dark/20"
              >
                <option value="">All Specializations</option>
                <option value="Career & Finance">Career & Finance</option>
                <option value="Love & Relationships">Love & Relationships</option>
                <option value="Vedic Astrology">Vedic Astrology</option>
                <option value="Kundli & Matchmaking">Kundli & Matchmaking</option>
                <option value="Numerology">Numerology</option>
                <option value="Tarot Reading">Tarot Reading</option>
              </select>
            </div>

            {/* Fee Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider">
                  Max Fee (per session)
                </label>
                <span className="text-xs font-bold text-astro-dark">₹{maxFee}</span>
              </div>
              <input
                type="range"
                min="200"
                max="2500"
                step="50"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-full accent-purple-500 bg-astro-cream h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-2">
                {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(minRating === String(rating) ? '' : String(rating))}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                      minRating === String(rating)
                        ? 'bg-astro-cream text-astro-dark border-purple-500/80 shadow-md'
                        : 'bg-astro-cream text-astro-muted border-astro-border hover:border-astro-border hover:text-astro-dark'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-astro-accent text-astro-dark" />
                    {rating}+
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Astrologers list area */}
        <div className="lg:col-span-3">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="glass-panel h-60 rounded-2xl animate-pulse border border-astro-border" />
              ))}
            </div>
          ) : astrologers.length === 0 ? (
            <div className="astro-card p-16 text-center rounded-2xl border border-astro-border">
              <h3 className="text-lg font-bold text-astro-dark mb-1">No Pandits Found</h3>
              <p className="text-astro-muted text-sm">Try broadening your filter parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {astrologers.map((astrologer) => (
                <PanditCard
                  key={astrologer._id}
                  pandit={astrologer}
                  onBook={openBookingModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Scheduling Modal */}
      {selectedAstrologer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-astro-dark/40 backdrop-blur-sm">
          <div className="w-full max-w-md astro-card p-6 sm:p-8 rounded-2xl border border-astro-border relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-astro-border">
              <div>
                <h3 className="text-lg font-bold text-astro-dark">Schedule Consultation</h3>
                <p className="text-xs text-astro-muted">With Dr. {selectedAstrologer.userId.name}</p>
              </div>
              <button
                onClick={() => setSelectedAstrologer(null)}
                className="p-1 rounded-lg text-astro-muted hover:text-astro-dark hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-green-700 mb-4 animate-bounce">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-astro-dark mb-2">Request Submitted!</h4>
                <p className="text-astro-muted text-xs leading-relaxed max-w-sm mx-auto mb-6">
                  Your slot request has been sent to Dr. {selectedAstrologer.userId.name}. You will receive an email and notification once it is confirmed.
                </p>
                <button
                  onClick={() => setSelectedAstrologer(null)}
                  className="px-6 py-2 rounded-lg bg-astro-cream hover:bg-astro-cream-dark text-astro-dark font-semibold text-xs border border-astro-border"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Date Input */}
                <div>
                  <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                    Select Consultation Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-astro-muted">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      required
                      min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // from tomorrow
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-astro-border text-astro-dark focus:outline-none focus:ring-2 focus:ring-astro-dark/20 text-sm"
                    />
                  </div>
                </div>

                {/* Slots Selector */}
                {bookingDate && availableSlots.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                            selectedSlot === slot
                              ? 'bg-astro-cream text-astro-dark border-purple-500/80 shadow-md'
                              : 'bg-astro-cream text-astro-dark border-astro-border hover:border-purple-500/40 hover:text-astro-dark'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                    Describe your query (Optional)
                  </label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-astro-border text-astro-dark placeholder-astro-muted focus:outline-none focus:ring-2 focus:ring-astro-dark/20 text-xs h-20 resize-none"
                    placeholder="e.g. Asking about job transition timeline, birth time rectification details..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingBooking || !bookingDate || !selectedSlot}
                    className="w-full py-3 rounded-lg astro-btn-primary text-white font-bold text-xs shadow-lg shadow-astro-dark/10 hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-40"
                  >
                    {submittingBooking ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
