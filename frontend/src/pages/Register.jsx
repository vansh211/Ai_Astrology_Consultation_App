import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, Sparkles, IndianRupee, Briefcase } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('client');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('');
  const [specialization, setSpecialization] = useState('Career & Finance');
  const [bio, setBio] = useState('');
  const [fee, setFee] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setError('Please fill in all standard credentials');

    const payload = { name, email, password, role };
    if (role === 'astrologer') {
      if (experience === '' || fee === '') return setError('Experience and consultation fee are required for Astrologers');
      payload.experience = Number(experience);
      payload.specialization = specialization;
      payload.bio = bio;
      payload.fee = Number(fee);
    }

    setError('');
    setSubmitting(true);
    const result = await register(payload);
    setSubmitting(false);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
  };

  const inputClass = 'w-full astro-input-dark pl-10 pr-4 py-2.5 text-sm';
  const iconClass = 'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-astro-muted';

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full astro-card p-8 sm:p-10">
        <div className="text-center mb-6">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-astro-muted uppercase">Tumhara Pandit</span>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-astro-dark">Create Account</h2>
          <p className="mt-2 text-sm text-astro-muted">Join the platform to begin consultations</p>
        </div>

        <div className="flex p-1 rounded-full bg-astro-cream border border-astro-border mb-6">
          {['client', 'astrologer'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => { setRole(r); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all ${
                role === r ? 'bg-astro-dark text-white' : 'text-astro-muted hover:text-astro-dark'
              }`}
            >
              {r === 'client' ? 'I am a Client' : 'I am an Astrologer'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-astro-muted mb-1.5">Name</label>
              <div className="relative">
                <User className={iconClass} strokeWidth={1.5} />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-astro-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail className={iconClass} strokeWidth={1.5} />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="email@example.com" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-astro-muted mb-1.5">Password</label>
            <div className="relative">
              <Lock className={iconClass} strokeWidth={1.5} />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Minimum 6 characters" />
            </div>
          </div>

          {role === 'astrologer' && (
            <div className="space-y-4 pt-2 border-t border-astro-border">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-astro-muted mb-1.5">Experience (Years)</label>
                  <div className="relative">
                    <Briefcase className={iconClass} strokeWidth={1.5} />
                    <input type="number" required min="0" value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass} placeholder="e.g. 5" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-astro-muted mb-1.5">Fee (₹ per session)</label>
                  <div className="relative">
                    <IndianRupee className={iconClass} strokeWidth={1.5} />
                    <input type="number" required min="0" value={fee} onChange={(e) => setFee(e.target.value)} className={inputClass} placeholder="e.g. 500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-astro-muted mb-1.5">Specialization</label>
                <div className="relative">
                  <Sparkles className={iconClass} strokeWidth={1.5} />
                  <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className={inputClass}>
                    <option value="Career & Finance">Career & Finance</option>
                    <option value="Love & Relationships">Love & Relationships</option>
                    <option value="Vedic Astrology">Vedic Astrology</option>
                    <option value="Kundli & Matchmaking">Kundli & Matchmaking</option>
                    <option value="Numerology">Numerology</option>
                    <option value="Tarot Reading">Tarot Reading</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-astro-muted mb-1.5">Short Biography</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full astro-input-dark px-4 py-2 text-sm h-20 resize-none" placeholder="Share a short bio..." />
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className="w-full astro-btn-primary py-3 text-sm disabled:opacity-50">
            {submitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-astro-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-astro-dark font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
