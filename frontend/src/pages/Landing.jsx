import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight } from 'lucide-react';

const CelestialArt = () => (
  <svg viewBox="0 0 400 300" className="w-full h-full opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="200" cy="150" r="80" stroke="#C4A882" strokeWidth="0.5" />
    <circle cx="200" cy="150" r="120" stroke="#C4A882" strokeWidth="0.3" />
    <circle cx="200" cy="150" r="50" stroke="#C4A882" strokeWidth="0.5" />
    <line x1="200" y1="30" x2="200" y2="270" stroke="#C4A882" strokeWidth="0.3" />
    <line x1="80" y1="150" x2="320" y2="150" stroke="#C4A882" strokeWidth="0.3" />
    <line x1="115" y1="65" x2="285" y2="235" stroke="#C4A882" strokeWidth="0.3" />
    <line x1="285" y1="65" x2="115" y2="235" stroke="#C4A882" strokeWidth="0.3" />
    <circle cx="200" cy="70" r="3" fill="#C4A882" />
    <circle cx="330" cy="150" r="2" fill="#C4A882" />
    <circle cx="200" cy="230" r="2.5" fill="#C4A882" />
    <circle cx="70" cy="150" r="2" fill="#C4A882" />
    <circle cx="140" cy="90" r="1.5" fill="#C4A882" />
    <circle cx="260" cy="210" r="1.5" fill="#C4A882" />
    <polygon points="200,110 205,125 220,125 208,135 213,150 200,140 187,150 192,135 180,125 195,125" stroke="#C4A882" strokeWidth="0.5" fill="none" />
  </svg>
);

const Landing = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative overflow-hidden min-h-[90vh] flex flex-col">
      {/* Header label */}
      <div className="text-center pt-8 pb-4">
        <span className="text-[10px] font-semibold tracking-[0.3em] text-astro-muted uppercase">
          Tumhara Pandit
        </span>
      </div>

      {/* Hero Content */}
      <div className="flex-1 max-w-lg mx-auto px-6 text-center relative z-10 flex flex-col">
        <div className="flex-1 pt-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-astro-dark leading-tight">
            Get to know your horoscope
          </h1>
          <p className="mt-5 text-sm text-astro-muted leading-relaxed max-w-sm mx-auto">
            Our best astrologers who tell you the answer of your all questions and tell your future predictions.
          </p>
        </div>

        {/* Dark card with celestial art */}
        <div className="relative mt-auto mb-0">
          <div className="astro-card-dark rounded-t-[2.5rem] pt-12 pb-16 px-8 relative overflow-hidden min-h-[280px]">
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <CelestialArt />
            </div>

            {/* Arrow button */}
            <Link
              to="/register"
              className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white text-astro-dark flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-10"
            >
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Login link below card */}
          <div className="text-center py-6">
            <p className="text-xs text-astro-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-astro-dark font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
