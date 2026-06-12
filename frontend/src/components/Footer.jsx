import React from 'react';

const Footer = ({ onReportProblem }) => {
  return (
    <footer className="border-t border-astro-border mt-auto py-8 bg-white/50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="font-serif text-sm font-semibold text-astro-dark mb-3">
          Tumhara Pandit
        </p>
        <p className="text-xs text-astro-muted max-w-md mx-auto leading-relaxed">
          Embark on your journey of celestial discovery. Connect with expert astrologers and unlock personalized horoscope insights.
        </p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={onReportProblem}
            className="text-xs text-astro-muted hover:text-astro-dark underline underline-offset-2 transition-colors"
          >
            Report a Problem
          </button>
        </div>
        <p className="text-[10px] text-astro-muted/60 mt-4">
          &copy; {new Date().getFullYear()} Tumhara Pandit. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
