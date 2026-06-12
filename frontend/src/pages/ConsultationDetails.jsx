import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, FileText, Download, Play, MessageSquare, 
  Sparkles, Tag, Smile, Compass, AlertCircle, Send, Volume2
} from 'lucide-react';

const ConsultationDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'transcript', 'remedies', 'insights'

  // Chat RAG states
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef(null);

  const fetchConsultationDetails = async () => {
    try {
      const response = await axios.get(`/consultations/${id}`);
      setData(response.data);
      if (response.data.aiAnalysis?.chatHistory) {
        setChatHistory(response.data.aiAnalysis.chatHistory);
      }
      setError('');
    } catch (err) {
      console.error('Failed to load consultation details:', err);
      setError(err.response?.data?.message || 'Failed to load consultation details report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultationDetails();
  }, [id]);

  // Scroll chat to bottom when logs update
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const query = chatQuery.trim();
    setChatQuery('');
    setSendingChat(true);

    // Append user message immediately
    setChatHistory(prev => [...prev, { role: 'user', content: query }]);

    try {
      const response = await axios.post(`/consultations/${id}/chat`, { query });
      setChatHistory(response.data.history);
    } catch (err) {
      console.error('AI Chat request failed:', err);
      setChatHistory(prev => [
        ...prev, 
        { role: 'model', content: 'Connection error. The stars are temporarily misaligned. Please try again.' }
      ]);
    } finally {
      setSendingChat(false);
    }
  };

  const handlePdfDownload = () => {
    // Standard download query triggering backend PDFKIT stream
    const token = localStorage.getItem('cosmic_token');
    const downloadUrl = `http://localhost:5000/api/consultations/${id}/pdf`;
    
    // Open in new window or download programmatically
    const link = document.createElement('a');
    link.href = `${downloadUrl}?token=${token}`; // Token can be appended if needed, or open anchor
    // Since request needs Authorization headers, standard route allows token query fallback or we can trigger download
    // Let's open with token in URL parameter or set standard window download (if backend auth checks token query)
    // To make it simple, we can fetch PDF blob via axios and download it! That preserves JWT headers perfectly!
    axios({
      url: `/consultations/${id}/pdf`,
      method: 'GET',
      responseType: 'blob', // Important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Consultation_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch((err) => {
      console.error('PDF download failed:', err);
      alert('Failed to download PDF report.');
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <Sparkles className="w-10 h-10 text-astro-dark animate-spin mb-4" />
        <p className="text-astro-muted text-sm tracking-wider">Retrieving celestial transcriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 px-4">
        <div className="astro-card p-8 rounded-2xl border border-rose-500/20 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-astro-dark mb-2">Access Restrained</h2>
          <p className="text-astro-muted text-sm leading-relaxed mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="px-6 py-2.5 rounded-lg bg-astro-cream hover:bg-astro-cream-dark text-astro-dark font-semibold text-xs border border-astro-border"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { consultation, transcript, aiAnalysis } = data;
  const clientName = consultation.clientId?.name;
  const astrologerName = consultation.astrologerId?.userId?.name;
  const specialization = consultation.astrologerId?.specialization;

  const getAudioUrl = (url) => {
    if (url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Return link */}
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs text-astro-muted hover:text-astro-dark font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Portal
        </Link>
      </div>

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8 pb-6 border-b border-astro-border">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-astro-cream border border-purple-500/25 text-astro-dark uppercase tracking-widest">
            {specialization}
          </span>
          <h1 className="text-3xl font-serif font-semibold text-astro-dark mt-2">
            Consultation Report
          </h1>
          <p className="text-astro-muted text-xs mt-1">
            Conducted by Dr. {astrologerName} for client {clientName} on {new Date(consultation.createdAt).toLocaleDateString()}
          </p>
        </div>

        <button
          onClick={handlePdfDownload}
          className="px-4 py-2.5 rounded-xl bg-astro-cream hover:bg-astro-cream-dark text-astro-dark font-bold text-xs border border-purple-500/25 flex items-center gap-2 shadow-lg hover:border-astro-dark transition-all self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </button>
      </div>

      {/* Grid: Audio & Tabs Left, RAG Chat Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Audio Player + Tab Contents */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Audio Player Card */}
          <div className="astro-card p-6 rounded-2xl border border-astro-border">
            <h2 className="text-sm font-bold text-astro-dark uppercase tracking-wider mb-4 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-astro-muted" />
              Recorded Consultation Audio
            </h2>
            <div className="p-4 rounded-xl bg-white border border-astro-border">
              {consultation.recordingUrl ? (
                <audio
                  controls
                  src={getAudioUrl(consultation.recordingUrl)}
                  className="w-full audio-player-custom"
                />
              ) : (
                <div className="py-2 text-astro-muted text-xs italic text-center">Audio source track missing.</div>
              )}
            </div>
          </div>

          {/* Details / Report Tabs */}
          <div className="astro-card rounded-2xl border border-astro-border overflow-hidden">
            {/* Tab header buttons */}
            <div className="flex border-b border-astro-border bg-black/25">
              {[
                { id: 'summary', label: 'AI Summary', icon: FileText },
                { id: 'transcript', label: 'Verbatim Transcript', icon: Play },
                { id: 'remedies', label: 'Adviser Remedies', icon: Sparkles },
                { id: 'insights', label: 'AI Analytics', icon: Tag }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 px-2 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === tab.id
                        ? 'border-astro-dark text-astro-dark bg-purple-950/20'
                        : 'border-transparent text-astro-muted hover:text-astro-dark hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="p-6">
              
              {/* Summary */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-astro-dark">Session Summary</h3>
                  <p className="text-astro-dark text-sm leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis?.summary || 'AI summaries processing. Please check back shortly.'}
                  </p>
                </div>
              )}

              {/* Transcript */}
              {activeTab === 'transcript' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-astro-dark">Voice Transcription</h3>
                  <div className="p-4 rounded-xl bg-white border border-astro-border max-h-[300px] overflow-y-auto text-astro-dark text-xs leading-relaxed whitespace-pre-wrap scrollbar">
                    {transcript || 'Audio transcript unavailable.'}
                  </div>
                </div>
              )}

              {/* Remedies / Notes */}
              {activeTab === 'remedies' && (
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-astro-dark">Prescribed Remedies & Notes</h3>
                  <div className="text-astro-dark text-sm leading-relaxed whitespace-pre-wrap bg-astro-cream p-4 rounded-xl border border-astro-border">
                    {consultation.notes || 'No manual notes were submitted by the astrologer for this session.'}
                  </div>
                </div>
              )}

              {/* AI Insights (Sentiment & Keywords) */}
              {activeTab === 'insights' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-astro-cream border border-astro-border">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-astro-muted uppercase tracking-wider mb-3">
                      <Smile className="w-4 h-4 text-amber-700" />
                      Prediction Sentiment
                    </div>
                    <span className={`text-base font-serif font-semibold uppercase tracking-widest px-3 py-1 rounded-lg ${
                      aiAnalysis?.sentiment === 'Positive'
                        ? 'bg-emerald-950/60 border border-emerald-500/25 text-green-700'
                        : aiAnalysis?.sentiment === 'Negative'
                        ? 'bg-rose-950/60 border border-rose-500/25 text-red-600'
                        : 'bg-slate-900 border border-slate-700 text-astro-dark'
                    }`}>
                      {aiAnalysis?.sentiment || 'Neutral'}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-astro-cream border border-astro-border">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-astro-muted uppercase tracking-wider mb-3">
                      <Tag className="w-4 h-4 text-astro-muted" />
                      Tagged Focus Topics
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysis?.keywords && aiAnalysis.keywords.map((k) => (
                        <span key={k} className="text-xs px-2.5 py-1 rounded-lg bg-astro-cream border border-astro-border text-astro-dark">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Side: RAG Chat Widget */}
        <div className="lg:col-span-1">
          <div className="astro-card rounded-2xl border border-astro-border flex flex-col h-[520px] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-black/25 border-b border-astro-border flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-astro-dark" />
              <div>
                <h3 className="text-sm font-bold text-astro-dark">Consultation AI Chat</h3>
                <p className="text-[10px] text-astro-muted">Ask questions using the voice transcript</p>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[380px] scrollbar">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                  <Compass className="w-8 h-8 text-astro-muted/60 mb-2 animate-spin-slow" />
                  <p className="text-astro-muted text-xs font-bold">Ask about advice given</p>
                  <p className="text-astro-muted text-[10px] leading-relaxed max-w-xs mt-1">
                    "What advice was given about career growth?" or "Which mantras did the advisor suggest?"
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-astro-cream border border-astro-border text-astro-dark'
                          : 'bg-black/50 border border-astro-border text-astro-dark'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {sendingChat && (
                <div className="flex justify-start">
                  <div className="bg-black/50 border border-astro-border rounded-xl p-3 text-xs text-astro-muted flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-astro-dark animate-spin" />
                    <span>AI is reading transcript...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-astro-border flex gap-2">
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                disabled={sendingChat}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-black/55 border border-astro-border text-astro-dark placeholder-astro-muted focus:outline-none focus:ring-1 focus:ring-astro-dark"
                placeholder="Ask your AI transcript..."
              />
              <button
                type="submit"
                disabled={sendingChat || !chatQuery.trim()}
                className="p-2 rounded-lg bg-astro-cream hover:bg-astro-cream-dark text-astro-dark border border-astro-border disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ConsultationDetails;
