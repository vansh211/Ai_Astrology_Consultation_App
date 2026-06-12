import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, History, Star, AlertCircle, Sparkles, MessageSquare,
  ChevronRight, X, ShieldCheck, Search, ArrowRight, Grid2X2
} from 'lucide-react';

const MandalaArt = () => (
  <svg viewBox="0 0 200 200" className="w-32 h-32 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="70" stroke="#1A1A1A" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="50" stroke="#1A1A1A" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="30" stroke="#1A1A1A" strokeWidth="0.5" />
    <circle cx="100" cy="100" r="10" stroke="#1A1A1A" strokeWidth="0.5" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      return (
        <line
          key={angle}
          x1={100 + 10 * Math.cos(rad)}
          y1={100 + 10 * Math.sin(rad)}
          x2={100 + 70 * Math.cos(rad)}
          y2={100 + 70 * Math.sin(rad)}
          stroke="#1A1A1A"
          strokeWidth="0.3"
        />
      );
    })}
  </svg>
);

const CATEGORIES = ['Daily Horoscope', 'Weekly', 'Monthly', 'Yearly', 'Love', 'Career'];

const ClientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('Daily Horoscope');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeReviewAppointment, setActiveReviewAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/dashboards/client');
      setData(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load client dashboard:', err);
      setError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openReviewModal = (appId) => {
    setActiveReviewAppointment(appId);
    setRating(5);
    setReviewText('');
    setReviewError('');
    setReviewSuccess(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);
    try {
      await axios.post('/reviews', { appointmentId: activeReviewAppointment, rating, reviewText });
      setReviewSuccess(true);
      fetchDashboardData();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-astro-dark animate-spin" />
        <span className="text-astro-muted text-sm ml-2">Loading...</span>
      </div>
    );
  }

  const { cards, upcomingAppointments, pastConsultations, favoriteAstrologers } = data || {
    cards: { upcomingCount: 0, pastConsultationsCount: 0, favoriteAstrologersCount: 0 },
    upcomingAppointments: [],
    pastConsultations: [],
    favoriteAstrologers: []
  };

  const today = new Date();
  const horoscopeCards = [
    { label: 'Tomorrow', date: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), dark: true },
    { label: 'Weekly', date: `${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(today.getTime() + 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, dark: false },
    { label: 'Month', date: today.toLocaleDateString('en-US', { month: 'short' }) + ' – ' + new Date(today.getFullYear(), today.getMonth() + 1).toLocaleDateString('en-US', { month: 'short' }), dark: false },
    { label: 'Year', date: String(today.getFullYear()), dark: false },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-astro-dark">
            Hello, {user?.name || 'Guest'}
          </h1>
          <p className="text-sm text-astro-muted mt-0.5">What would you like to know?</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-astro-dark text-white flex items-center justify-center text-xs font-semibold">
            {initials}
          </div>
          <button className="p-2 rounded-full hover:bg-white/60 transition-colors">
            <Grid2X2 className="w-4 h-4 text-astro-muted" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-astro-muted" strokeWidth={1.5} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search what you looking for?"
          className="w-full astro-input pl-11 pr-4 py-3 text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? 'astro-pill astro-pill-active' : 'astro-pill'}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Featured Card */}
      <div className="astro-card p-6 mb-6 flex items-center gap-4">
        <div className="flex-1">
          <MandalaArt />
          <h3 className="font-serif text-lg font-semibold text-astro-dark text-center mt-2">Aries</h3>
          <p className="text-xs text-astro-muted text-center mt-0.5">
            Elective & Horary Charts · {cards.upcomingCount} upcoming sessions
          </p>
        </div>
        <Link
          to="/marketplace"
          className="w-10 h-10 rounded-full bg-astro-dark text-white flex items-center justify-center shrink-0 hover:bg-neutral-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Daily Horoscope Section */}
      <div className="mb-8">
        <h2 className="font-serif text-lg font-semibold text-astro-dark mb-4">Daily Horoscope</h2>
        <div className="grid grid-cols-2 gap-3">
          {horoscopeCards.map((card) => (
            <Link
              key={card.label}
              to="/consultations"
              className={`p-4 rounded-2xl flex flex-col justify-between min-h-[100px] transition-all hover:scale-[1.02] ${
                card.dark
                  ? 'bg-astro-dark text-white'
                  : 'astro-card hover:shadow-lg'
              }`}
            >
              <div>
                <p className={`text-xs font-medium ${card.dark ? 'text-white/70' : 'text-astro-muted'}`}>
                  {card.label}
                </p>
                <p className={`text-sm font-semibold mt-1 ${card.dark ? 'text-white' : 'text-astro-dark'}`}>
                  {card.date}
                </p>
              </div>
              {!card.dark && (
                <ArrowRight className="w-4 h-4 text-astro-muted self-end mt-2" strokeWidth={1.5} />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: Calendar, label: 'Upcoming', value: cards.upcomingCount },
          { icon: History, label: 'Completed', value: cards.pastConsultationsCount },
          { icon: Star, label: 'Advisers', value: cards.favoriteAstrologersCount },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="astro-card p-4 text-center">
            <Icon className="w-4 h-4 text-astro-muted mx-auto mb-1" strokeWidth={1.5} />
            <p className="text-xl font-semibold text-astro-dark">{value}</p>
            <p className="text-[10px] text-astro-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="astro-card p-5 mb-6">
        <h2 className="font-serif text-base font-semibold text-astro-dark mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" strokeWidth={1.5} />
          Upcoming Schedules
        </h2>
        {upcomingAppointments.length === 0 ? (
          <p className="text-sm text-astro-muted text-center py-4">
            No upcoming sessions.{' '}
                <Link to="/marketplace" className="text-astro-dark font-semibold hover:underline">Find a pandit</Link>
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((app) => (
              <div key={app._id} className="p-3 rounded-xl bg-astro-cream flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm text-astro-dark">
                    Dr. {app.astrologerId?.userId?.name || 'Astrologer'}
                  </p>
                  <p className="text-xs text-astro-muted mt-0.5">
                    {new Date(app.date).toLocaleDateString()} · {app.slot}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                  app.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Consultations */}
      <div className="astro-card p-5 mb-6">
        <h2 className="font-serif text-base font-semibold text-astro-dark mb-4 flex items-center gap-2">
          <History className="w-4 h-4" strokeWidth={1.5} />
          Past Consultations
        </h2>
        {pastConsultations.length === 0 ? (
          <p className="text-sm text-astro-muted text-center py-4">No past consultation records.</p>
        ) : (
          <div className="space-y-3">
            {pastConsultations.map((c) => (
              <div key={c._id} className="p-3 rounded-xl bg-astro-cream">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm text-astro-dark">
                    Dr. {c.astrologerId?.userId?.name || 'Astrologer'}
                  </p>
                  <span className="text-[10px] text-astro-muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-astro-muted line-clamp-2 mb-3">
                  {c.analysis?.summary || 'Consultation summary available.'}
                </p>
                <div className="flex gap-2">
                  <Link
                    to={`/consultations/${c._id}`}
                    className="flex-1 text-center astro-btn-primary py-2 text-xs flex items-center justify-center gap-1"
                  >
                    View Details <ChevronRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => openReviewModal(c.appointmentId)}
                    className="flex-1 astro-btn-secondary py-2 text-xs flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> Rate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Advisers */}
      {favoriteAstrologers.length > 0 && (
        <div className="astro-card p-5 mb-6">
          <h2 className="font-serif text-base font-semibold text-astro-dark mb-4 flex items-center gap-2">
            <Star className="w-4 h-4" strokeWidth={1.5} />
            Favorite Advisers
          </h2>
          <div className="space-y-3">
            {favoriteAstrologers.map((ast) => (
              <div key={ast._id} className="p-3 rounded-xl bg-astro-cream flex items-center gap-3">
                <img
                  src={ast.profilePhoto || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&h=100&fit=crop&crop=face'}
                  alt={ast.userId?.name}
                  className="w-10 h-10 rounded-full object-cover border border-astro-border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-astro-dark truncate">{ast.userId?.name}</p>
                  <p className="text-xs text-astro-muted truncate">{ast.specialization}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-astro-accent fill-astro-accent" />
                    <span className="text-xs font-semibold">{ast.rating}</span>
                  </div>
                  <Link to="/marketplace" className="text-xs font-semibold text-astro-dark hover:underline">
                    Book →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {activeReviewAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-astro-dark/40 backdrop-blur-sm">
          <div className="w-full max-w-md astro-card p-6 sm:p-8 relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-lg font-semibold text-astro-dark">Rate Consultation</h3>
                <p className="text-xs text-astro-muted">Share your feedback</p>
              </div>
              <button onClick={() => setActiveReviewAppointment(null)} className="p-1 rounded-lg text-astro-muted hover:text-astro-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-astro-cream text-astro-dark mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-astro-dark mb-2">Review Submitted!</h4>
                <button onClick={() => setActiveReviewAppointment(null)} className="astro-btn-primary px-6 py-2 text-xs mt-4">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-125">
                      <Star className={`w-7 h-7 ${star <= rating ? 'fill-astro-accent text-astro-accent' : 'text-astro-border'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full astro-input-dark px-3 py-2 text-xs h-24 resize-none"
                  placeholder="Optional written feedback..."
                />
                <button type="submit" disabled={submittingReview} className="w-full astro-btn-primary py-3 text-xs disabled:opacity-40">
                  {submittingReview ? 'Submitting...' : 'Submit Rating'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
