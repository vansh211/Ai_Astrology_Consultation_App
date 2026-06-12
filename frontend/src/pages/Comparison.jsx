import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FileText, Calendar, Sparkles, Smile, Tag, AlertCircle } from 'lucide-react';

const Comparison = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected sessions to compare
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchComparisonData = async () => {
    try {
      const response = await axios.get('/consultations/comparison');
      setData(response.data);
      // Select first two by default if available
      if (response.data.length >= 2) {
        setSelectedIds([response.data[0].id, response.data[1].id]);
      } else if (response.data.length === 1) {
        setSelectedIds([response.data[0].id]);
      }
      setError('');
    } catch (err) {
      console.error('Failed to load comparison records:', err);
      setError('Failed to fetch past consultations for comparison.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 consultations at a time.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-astro-dark animate-spin" />
        <span className="text-astro-muted text-sm ml-2">Mapping historical readings...</span>
      </div>
    );
  }

  // Parse sentiment value for Recharts plotting
  const sentimentMap = { 'Negative': 1, 'Neutral': 3, 'Positive': 5 };
  
  const chartData = data.map((c) => ({
    date: new Date(c.date).toLocaleDateString(),
    sentimentScore: sentimentMap[c.sentiment] || 3,
    sentiment: c.sentiment,
    astrologer: c.astrologer
  }));

  const selectedConsultations = data.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-semibold bg-gradient-to-r from-cosmic-gold via-purple-300 to-pink-400 bg-clip-text text-transparent mb-2">
          Consultation Comparison Tracker
        </h1>
        <p className="text-astro-muted max-w-lg mx-auto text-xs sm:text-sm">
          Select multiple readings to audit changes in astrological recommendations, remedies, and sentiment shifts
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {data.length === 0 ? (
        <div className="astro-card p-16 text-center rounded-2xl border border-astro-border">
          <FileText className="w-12 h-12 text-astro-muted/60 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-astro-dark mb-1">No Consultations Found</h3>
          <p className="text-astro-muted text-sm">
            Comparison metrics require at least one completed consultation.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top Panel: Sentiment graph and Picker list */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart: Sentiment trend */}
            <div className="lg:col-span-2 astro-card p-5 rounded-2xl border border-astro-border h-80">
              <h2 className="text-xs font-bold text-astro-dark uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-astro-muted" />
                Reading Sentiment Progression
              </h2>
              <ResponsiveContainer width="100%" height="80%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e1065/20" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis 
                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                    domain={[0, 6]} 
                    ticks={[1, 3, 5]}
                    tickFormatter={(v) => (v === 1 ? 'Neg' : v === 3 ? 'Neut' : v === 5 ? 'Pos' : '')} 
                  />
                  <Tooltip 
                    contentStyle={{ background: '#120e26', border: '1px solid rgba(168,85,247,0.2)' }}
                    formatter={(val, name, props) => [props.payload.sentiment, 'Sentiment']}
                  />
                  <Line type="monotone" dataKey="sentimentScore" stroke="#7C3AED" strokeWidth={3} dot={{ r: 5, fill: '#FDE047' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Picker checkbox block */}
            <div className="lg:col-span-1 astro-card p-5 rounded-2xl border border-astro-border max-h-80 overflow-y-auto scrollbar">
              <h2 className="text-xs font-bold text-astro-dark uppercase tracking-wider mb-4">Select to Compare (Max 3)</h2>
              <div className="space-y-2">
                {data.map((c) => (
                  <label 
                    key={c.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedIds.includes(c.id)
                        ? 'bg-purple-950/20 border-purple-500/60'
                        : 'bg-astro-cream border-astro-border hover:border-astro-border'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={() => handleCheckboxChange(c.id)}
                      className="rounded accent-purple-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <p className="font-bold text-xs text-astro-dark">Dr. {c.astrologer}</p>
                      <p className="text-[10px] text-astro-muted">{new Date(c.date).toLocaleDateString()} - {c.specialization}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Panel: Comparative columns */}
          {selectedConsultations.length > 0 && (
            <div className="astro-card p-6 rounded-2xl border border-astro-border">
              <h2 className="text-base font-bold text-astro-dark mb-6 border-b border-purple-500/15 pb-3">
                Side-by-Side Assessment
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedConsultations.map((c) => {
                  const dateStr = new Date(c.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div key={c.id} className="p-5 rounded-xl bg-white border border-astro-border flex flex-col justify-between space-y-5">
                      {/* Top section: Meta */}
                      <div>
                        <div className="flex justify-between items-start mb-3 border-b border-astro-border pb-3">
                          <div>
                            <h3 className="font-bold text-sm text-astro-dark">Dr. {c.astrologer}</h3>
                            <p className="text-[10px] text-astro-muted font-semibold">{c.specialization}</p>
                          </div>
                          <span className="text-[10px] text-astro-muted bg-white/5 px-2 py-0.5 rounded-lg">
                            {dateStr}
                          </span>
                        </div>

                        {/* Sentiment */}
                        <div className="mb-4">
                          <span className="text-[9px] font-bold text-astro-muted uppercase tracking-widest block mb-1">Sentiment</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            c.sentiment === 'Positive'
                              ? 'bg-emerald-950/60 border border-emerald-500/35 text-green-700'
                              : 'bg-slate-900 border border-slate-700 text-astro-dark'
                          }`}>
                            {c.sentiment}
                          </span>
                        </div>

                        {/* Focus keywords */}
                        <div className="mb-4">
                          <span className="text-[9px] font-bold text-astro-muted uppercase tracking-widest block mb-1.5">Focus Topics</span>
                          <div className="flex flex-wrap gap-1">
                            {c.keywords.map((k) => (
                              <span key={k} className="text-[9px] px-2 py-0.5 rounded bg-astro-cream text-astro-dark border border-astro-border">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* AI Summary */}
                        <div className="mb-4">
                          <span className="text-[9px] font-bold text-astro-muted uppercase tracking-widest block mb-1.5">AI Summary</span>
                          <p className="text-astro-dark text-xs leading-relaxed max-h-32 overflow-y-auto scrollbar whitespace-pre-wrap italic">
                            "{c.summary || 'Summary unavailable'}"
                          </p>
                        </div>

                        {/* Prescribed Remedies */}
                        <div>
                          <span className="text-[9px] font-bold text-astro-muted uppercase tracking-widest block mb-1.5">Remedies & Remedies</span>
                          <p className="text-astro-dark text-xs leading-relaxed max-h-32 overflow-y-auto scrollbar whitespace-pre-wrap bg-purple-900/5 p-2.5 rounded border border-astro-border">
                            {c.remedies || 'No custom remedies provided.'}
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/consultations/${c.id}`}
                        className="w-full text-center py-2 rounded-lg bg-astro-cream hover:bg-astro-cream-dark/50 text-astro-dark font-bold text-xs border border-astro-border hover:border-astro-dark transition-all shadow"
                      >
                        View Full Details
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Comparison;
