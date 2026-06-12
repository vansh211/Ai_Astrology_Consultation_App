import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { Calendar, Users, Star, History, Check, X, Upload, FileAudio, AlertCircle, Sparkles, ShieldCheck, ArrowUpRight } from 'lucide-react';

const AstrologerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload Modal states
  const [activeUploadAppointment, setActiveUploadAppointment] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [remediesText, setRemediesText] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadProgressState, setUploadProgressState] = useState(''); // 'uploading', 'transcribing', 'analyzing', 'done'
  const [submittingUpload, setSubmittingUpload] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const statsResponse = await axios.get('/dashboards/astrologer');
      setDashboardData(statsResponse.data);

      const appointmentsResponse = await axios.get('/bookings');
      setAppointments(appointmentsResponse.data);
      setError('');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to fetch dashboard metrics. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await axios.patch(`/bookings/${appId}`, { status: newStatus });
      fetchDashboardStats();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update appointment slot.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const openUploadModal = (app) => {
    setActiveUploadAppointment(app);
    setAudioFile(null);
    setRemediesText('');
    setUploadError('');
    setUploadProgressState('');
    setSubmittingUpload(false);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      return setUploadError('Please select an audio recording file');
    }

    setUploadError('');
    setSubmittingUpload(true);
    
    // Set custom progression loaders to show pipeline in action
    setUploadProgressState('uploading');
    
    const formData = new FormData();
    formData.append('appointmentId', activeUploadAppointment._id);
    formData.append('recording', audioFile);
    formData.append('notes', remediesText);

    try {
      // Simulate pipeline loader timings for premium UX feedback
      setTimeout(() => setUploadProgressState('transcribing'), 3500);
      setTimeout(() => setUploadProgressState('analyzing'), 7500);

      await axios.post('/consultations/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUploadProgressState('done');
      fetchDashboardStats();
    } catch (err) {
      console.error('Upload process failed:', err);
      setUploadError(err.response?.data?.message || 'Error occurred in uploading or transcribing pipeline.');
      setSubmittingUpload(false);
      setUploadProgressState('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-astro-dark animate-spin" />
        <span className="text-astro-muted text-sm ml-2">Assembling charts and dash stats...</span>
      </div>
    );
  }

  const { cards, charts, recentReviews } = dashboardData || {
    cards: { totalClients: 0, totalAppointments: 0, upcomingAppointments: 0, totalConsultations: 0, averageRating: 0 },
    charts: { keywordChart: [], monthlyConsultationsChart: [], ratingsTrendChart: [] },
    recentReviews: []
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-astro-dark flex items-center gap-2">
            <span>Astrologer Portal</span>
            <Sparkles className="w-5 h-5 text-astro-dark animate-pulse" />
          </h1>
          <p className="text-astro-muted text-sm mt-1">
            Manage your schedule, confirm pending slots, upload audio files, and audit reviews
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="astro-card p-4 rounded-xl border border-astro-border">
          <p className="text-[10px] font-semibold text-astro-muted uppercase tracking-wider">Clients</p>
          <p className="text-2xl font-bold text-astro-dark mt-1">{cards.totalClients}</p>
        </div>
        <div className="astro-card p-4 rounded-xl border border-astro-border">
          <p className="text-[10px] font-semibold text-astro-muted uppercase tracking-wider">Bookings</p>
          <p className="text-2xl font-bold text-astro-dark mt-1">{cards.totalAppointments}</p>
        </div>
        <div className="astro-card p-4 rounded-xl border border-astro-border">
          <p className="text-[10px] font-semibold text-astro-muted uppercase tracking-wider">Upcoming</p>
          <p className="text-2xl font-bold text-astro-dark mt-1">{cards.upcomingAppointments}</p>
        </div>
        <div className="astro-card p-4 rounded-xl border border-astro-border">
          <p className="text-[10px] font-semibold text-astro-muted uppercase tracking-wider">Consultations</p>
          <p className="text-2xl font-bold text-astro-dark mt-1">{cards.totalConsultations}</p>
        </div>
        <div className="astro-card p-4 rounded-xl border border-astro-border col-span-2 lg:col-span-1">
          <p className="text-[10px] font-semibold text-astro-muted uppercase tracking-wider">Rating</p>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-5 h-5 text-astro-dark fill-astro-accent" />
            <p className="text-2xl font-bold text-astro-dark">{cards.averageRating}</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Keywords chart */}
        <div className="astro-card p-5 rounded-2xl border border-astro-border h-72">
          <h3 className="text-xs font-bold text-astro-dark uppercase tracking-wider mb-4">Top Focus Keywords</h3>
          {charts.keywordChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-astro-muted text-xs">No keywords parsed yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={charts.keywordChart} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#120e26', border: '1px solid rgba(168,85,247,0.2)' }} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly consultations chart */}
        <div className="astro-card p-5 rounded-2xl border border-astro-border h-72">
          <h3 className="text-xs font-bold text-astro-dark uppercase tracking-wider mb-4">Monthly Sessions Trend</h3>
          {charts.monthlyConsultationsChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-astro-muted text-xs">No sessions completed.</div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={charts.monthlyConsultationsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e1065/20" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#120e26', border: '1px solid rgba(168,85,247,0.2)' }} />
                <Area type="monotone" dataKey="count" stroke="#ec4899" fill="rgba(236,72,153,0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Reviews history chart */}
        <div className="astro-card p-5 rounded-2xl border border-astro-border h-72">
          <h3 className="text-xs font-bold text-astro-dark uppercase tracking-wider mb-4">Feedback Trend</h3>
          {charts.ratingsTrendChart.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-astro-muted text-xs">No feedback ratings yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={charts.ratingsTrendChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e1065/20" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[1, 5]} />
                <Tooltip contentStyle={{ background: '#120e26', border: '1px solid rgba(168,85,247,0.2)' }} />
                <Line type="monotone" dataKey="rating" stroke="#fde047" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left block: Slots grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="astro-card p-6 rounded-2xl border border-astro-border">
            <h2 className="text-lg font-bold text-astro-dark border-b border-astro-border pb-3 mb-4">
              Schedule Slots & Recording Uploads
            </h2>

            {appointments.length === 0 ? (
              <div className="py-8 text-center text-astro-muted text-sm">
                No appointment slots requested or scheduled.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-astro-dark">
                  <thead className="text-xs uppercase bg-white text-astro-muted border-b border-astro-border">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Slot</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/5">
                    {appointments.map((app) => (
                      <tr key={app._id} className="hover:bg-purple-950/5">
                        <td className="px-4 py-3 font-semibold text-astro-dark">{app.clientId?.name}</td>
                        <td className="px-4 py-3">{new Date(app.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">{app.slot}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              app.status === 'confirmed'
                                ? 'bg-emerald-950/60 border border-emerald-500/35 text-green-700'
                                : app.status === 'completed'
                                ? 'bg-astro-cream border border-astro-border text-astro-dark'
                                : app.status === 'cancelled'
                                ? 'bg-rose-950/60 border border-rose-500/35 text-red-600'
                                : 'bg-amber-950/60 border border-amber-500/35 text-amber-700'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {app.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(app._id, 'confirmed')}
                                  className="p-1 rounded bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/20 text-green-700"
                                  title="Confirm Appointment"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(app._id, 'cancelled')}
                                  className="p-1 rounded bg-rose-950/50 hover:bg-rose-900 border border-rose-500/20 text-red-600"
                                  title="Reject Appointment"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            {app.status === 'confirmed' && (
                              <button
                                onClick={() => openUploadModal(app)}
                                className="px-3 py-1 rounded bg-astro-cream hover:bg-astro-cream-dark text-astro-dark border border-astro-border flex items-center gap-1 text-xs font-bold"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Post Record
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column: recent reviews */}
        <div className="space-y-6">
          <div className="astro-card p-5 rounded-2xl border border-astro-border">
            <h2 className="text-sm font-bold text-astro-dark uppercase tracking-wider mb-4 border-b border-astro-border pb-2">
              Recent Feedback
            </h2>
            {recentReviews.length === 0 ? (
              <div className="py-6 text-center text-astro-muted text-xs">No client reviews posted yet.</div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((rev) => (
                  <div key={rev._id} className="p-3.5 rounded-xl bg-astro-cream border border-astro-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-astro-dark">{rev.clientId?.name}</span>
                      <div className="flex text-astro-dark">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-astro-accent text-astro-dark" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-astro-muted italic leading-relaxed">
                      "{rev.reviewText || 'No text review left.'}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Recording Modal */}
      {activeUploadAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-astro-dark/40 backdrop-blur-sm">
          <div className="w-full max-w-md astro-card p-6 sm:p-8 rounded-2xl border border-astro-border relative">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-astro-border">
              <div>
                <h3 className="text-lg font-bold text-astro-dark">Post Session Recording</h3>
                <p className="text-xs text-astro-muted">Upload audio of consultation with {activeUploadAppointment.clientId?.name}</p>
              </div>
              <button
                onClick={() => !submittingUpload && setActiveUploadAppointment(null)}
                className="p-1 rounded-lg text-astro-muted hover:text-astro-dark hover:bg-white/5 disabled:opacity-30"
                disabled={submittingUpload}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadProgressState === 'done' ? (
              <div className="text-center py-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-green-700 mb-4 animate-bounce">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-astro-dark mb-2">Upload Complete!</h4>
                <p className="text-astro-muted text-xs max-w-xs mx-auto mb-6">
                  The session audio was compiled, Whisper transcribed it, and Gemini successfully generated summaries and remedy plans.
                </p>
                <button
                  onClick={() => setActiveUploadAppointment(null)}
                  className="px-6 py-2 rounded-lg bg-astro-cream hover:bg-astro-cream-dark text-astro-dark font-semibold text-xs border border-astro-border"
                >
                  Done
                </button>
              </div>
            ) : submittingUpload ? (
              <div className="text-center py-8">
                <Compass className="w-12 h-12 text-astro-dark animate-spin mx-auto mb-6" />
                
                {uploadProgressState === 'uploading' && (
                  <div className="space-y-1">
                    <p className="text-astro-dark font-bold text-sm">Uploading Audio Track...</p>
                    <p className="text-astro-muted text-xs">Storing media securely...</p>
                  </div>
                )}
                {uploadProgressState === 'transcribing' && (
                  <div className="space-y-1">
                    <p className="text-astro-dark font-bold text-sm">Speech-to-Text in Action...</p>
                    <p className="text-astro-muted text-xs">OpenAI Whisper is generating conversation transcripts...</p>
                  </div>
                )}
                {uploadProgressState === 'analyzing' && (
                  <div className="space-y-1">
                    <p className="text-astro-dark font-bold text-sm">Analyzing Celestial Alignment...</p>
                    <p className="text-astro-muted text-xs">Google Gemini is compiling predictions & summaries...</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {uploadError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Audio File upload selector */}
                <div>
                  <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-2">
                    Upload Audio Recording (MP3, WAV, M4A)
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-astro-border hover:border-purple-500/40 rounded-xl bg-white transition-colors cursor-pointer relative">
                    <div className="space-y-1 text-center">
                      <FileAudio className="mx-auto h-12 w-12 text-astro-muted" />
                      <div className="flex text-sm text-astro-dark">
                        <label className="relative cursor-pointer rounded-md font-medium text-astro-dark hover:underline">
                          <span>Choose audio file</span>
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-astro-muted text-[11px]">
                        {audioFile ? audioFile.name : 'Audio tracks up to 20MB limit'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Remedies & Notes input */}
                <div>
                  <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                    Your Prescription/Remedies
                  </label>
                  <textarea
                    value={remediesText}
                    onChange={(e) => setRemediesText(e.target.value)}
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-astro-border text-astro-dark placeholder-astro-muted focus:outline-none focus:ring-2 focus:ring-astro-dark/20 text-xs h-24 resize-none"
                    placeholder="Enter manual remedies, crystals, or lifestyle modifications for the client..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg astro-btn-primary text-white font-bold text-xs shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                  >
                    Start Processing Pipeline
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

export default AstrologerDashboard;
