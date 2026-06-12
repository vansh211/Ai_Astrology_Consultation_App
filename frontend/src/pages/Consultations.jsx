import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { History, Play, FileText, ChevronRight, Sparkles, Smile, Tag, AlertCircle } from 'lucide-react';

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchConsultations = async () => {
    try {
      const response = await axios.get('/consultations');
      setConsultations(response.data);
      setError('');
    } catch (err) {
      console.error('Failed to load consultations:', err);
      setError('Failed to retrieve consultations history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <History className="w-8 h-8 text-astro-dark animate-spin" />
        <span className="text-astro-muted text-sm ml-2">Loading consultations archive...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 pb-4 border-b border-astro-border">
        <h1 className="text-3xl font-serif font-semibold text-astro-dark flex items-center gap-2">
          <History className="w-7 h-7 text-astro-muted" />
          Consultation Archives
        </h1>
        <p className="text-astro-muted text-xs mt-1">
          Access past voice recording transcripts, AI summarizations, keyword tags, and advisor remedies
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {consultations.length === 0 ? (
        <div className="astro-card p-16 text-center rounded-2xl border border-astro-border">
          <History className="w-12 h-12 text-astro-muted/60 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-astro-dark mb-1">No Consultations Completed</h3>
          <p className="text-astro-muted text-sm">Completed session logs and AI reports will be cataloged here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {consultations.map((c) => {
            const dateStr = new Date(c.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div 
                key={c._id}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-astro-border flex flex-col justify-between h-72"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-base text-astro-dark">
                        Dr. {c.astrologerId?.userId?.name || 'Astrologer'}
                      </h3>
                      <p className="text-xs text-astro-muted font-semibold">{c.astrologerId?.specialization}</p>
                    </div>
                    <span className="text-[10px] text-astro-muted bg-white/5 px-2.5 py-1 rounded-lg border border-astro-border">
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-astro-muted text-xs leading-relaxed line-clamp-3 italic mb-4">
                    "{c.analysis?.summary || 'AI Report compiled. Open details to review remedies and transcripts.'}"
                  </p>
                </div>

                <div>
                  {/* Info Tags */}
                  <div className="flex justify-between items-center border-t border-astro-border pt-4 mb-4 text-[10px]">
                    <div className="flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-astro-muted">Sentiment:</span>
                      <strong className="text-astro-dark uppercase">{c.analysis?.sentiment || 'Neutral'}</strong>
                    </div>
                    {c.analysis?.keywords && (
                      <div className="flex gap-1">
                        {c.analysis.keywords.slice(0, 2).map((k) => (
                          <span key={k} className="px-2 py-0.5 rounded bg-astro-cream text-astro-dark border border-astro-border">
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/consultations/${c._id}`}
                    className="w-full py-2.5 rounded-xl bg-astro-cream hover:bg-astro-cream-dark text-astro-dark font-bold text-xs border border-astro-border hover:border-astro-dark/40 transition-all flex items-center justify-center gap-1.5 shadow"
                  >
                    Open AI Report
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Consultations;
