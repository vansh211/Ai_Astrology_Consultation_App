import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

const ComplaintModal = ({ isOpen, onClose }) => {
  const [complaint, setComplaint] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaint.trim()) {
      setError('Please describe your issue before submitting.');
      return;
    }

    setError('');
    setSubmitting(true);

    // Store locally since no backend endpoint exists yet
    const entry = {
      complaint: complaint.trim(),
      email: email.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('tumhara_pandit_complaints') || '[]');
      existing.push(entry);
      localStorage.setItem('tumhara_pandit_complaints', JSON.stringify(existing));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setComplaint('');
    setEmail('');
    setError('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-astro-dark/40 backdrop-blur-sm">
      <div className="w-full max-w-md astro-card p-6 sm:p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-astro-muted hover:text-astro-dark hover:bg-astro-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-astro-cream text-astro-dark mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-astro-dark mb-2">
              Thank You!
            </h3>
            <p className="text-astro-muted text-sm leading-relaxed mb-6">
              Your complaint has been received. Our team will review it and get back to you shortly.
            </p>
            <button
              onClick={handleClose}
              className="astro-btn-primary px-8 py-2.5 text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-serif text-xl font-semibold text-astro-dark mb-1">
              Report a Problem
            </h3>
            <p className="text-astro-muted text-xs mb-6">
              Tell us about any issues you experienced with the website. We value your feedback.
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-astro-muted mb-1.5">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full astro-input-dark px-4 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-astro-muted mb-1.5">
                  Describe your issue *
                </label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  placeholder="What went wrong? Please provide as much detail as possible..."
                  className="w-full astro-input-dark px-4 py-3 text-sm h-32 resize-none rounded-2xl"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full astro-btn-primary py-3 text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintModal;
