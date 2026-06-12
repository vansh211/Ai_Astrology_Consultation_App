import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings, Sparkles, AlertCircle, Save, Calendar, Clock, IndianRupee, Briefcase } from 'lucide-react';

const Profile = () => {
  const { astrologerProfile, updateLocalAstrologerProfile } = useAuth();
  
  const [experience, setExperience] = useState('');
  const [specialization, setSpecialization] = useState('Career & Finance');
  const [bio, setBio] = useState('');
  const [fee, setFee] = useState('');
  
  // Weekly slots grid representation
  const [availability, setAvailability] = useState([]);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Time slots list available to choose from
  const timeSlotsOptions = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', 
    '05:00 PM', '06:00 PM'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (astrologerProfile) {
      setExperience(astrologerProfile.experience);
      setSpecialization(astrologerProfile.specialization);
      setBio(astrologerProfile.bio || '');
      setFee(astrologerProfile.fee);
      
      // Load availability configs or seed empty defaults
      const seededAvailability = daysOfWeek.map(dayName => {
        const existingConfig = astrologerProfile.availability?.find(
          a => a.day.toLowerCase() === dayName.toLowerCase()
        );
        return {
          day: dayName,
          slots: existingConfig ? existingConfig.slots : []
        };
      });
      setAvailability(seededAvailability);
    }
  }, [astrologerProfile]);

  const handleSlotToggle = (dayName, slotTime) => {
    setAvailability(prev => 
      prev.map(dayConfig => {
        if (dayConfig.day === dayName) {
          const isSelected = dayConfig.slots.includes(slotTime);
          return {
            ...dayConfig,
            slots: isSelected 
              ? dayConfig.slots.filter(s => s !== slotTime)
              : [...dayConfig.slots, slotTime].sort((a, b) => {
                  // Basic sort by time
                  return timeSlotsOptions.indexOf(a) - timeSlotsOptions.indexOf(b);
                })
          };
        }
        return dayConfig;
      })
    );
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaving(true);

    try {
      const response = await axios.put('/astrologers/profile', {
        experience: Number(experience),
        specialization,
        bio,
        fee: Number(fee),
        availability
      });

      // Update state in context
      updateLocalAstrologerProfile(response.data.astrologer);
      setSuccess('Profile and scheduling slots saved successfully!');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 pb-4 border-b border-astro-border">
        <h1 className="text-3xl font-serif font-semibold text-astro-dark flex items-center gap-2">
          <Settings className="w-7 h-7 text-astro-muted" />
          Professional Profile Settings
        </h1>
        <p className="text-astro-muted text-xs mt-1">
          Customize your specializations, hourly rates, and define your available slots matrix
        </p>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm mb-6">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Common Parameters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="astro-card p-6 rounded-2xl border border-astro-border space-y-4">
            <h2 className="text-base font-bold text-astro-dark border-b border-astro-border pb-2 mb-4">
              Profile Parameters
            </h2>

            {/* Experience */}
            <div>
              <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                Years of Experience
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-astro-muted">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-astro-border text-astro-dark focus:outline-none focus:ring-2 focus:ring-astro-dark/20 text-sm"
                />
              </div>
            </div>

            {/* Fee */}
            <div>
              <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                Consultation Fee (₹ per session)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-astro-muted">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  required
                  min="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 rounded-lg bg-white border border-astro-border text-astro-dark focus:outline-none focus:ring-2 focus:ring-astro-dark/20 text-sm"
                />
              </div>
            </div>

            {/* Specialization */}
            <div>
              <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                Primary Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="block w-full py-2 px-3 rounded-lg bg-white border border-astro-border text-astro-dark text-sm focus:outline-none focus:ring-2 focus:ring-astro-dark/20"
              >
                <option value="Career & Finance">Career & Finance</option>
                <option value="Love & Relationships">Love & Relationships</option>
                <option value="Vedic Astrology">Vedic Astrology</option>
                <option value="Kundli & Matchmaking">Kundli & Matchmaking</option>
                <option value="Numerology">Numerology</option>
                <option value="Tarot Reading">Tarot Reading</option>
              </select>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-astro-muted uppercase tracking-wider mb-1.5">
                Biography / Experience details
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="block w-full px-3 py-2 rounded-lg bg-white border border-astro-border text-astro-dark placeholder-astro-muted focus:outline-none focus:ring-2 focus:ring-astro-dark/20 text-xs h-32 resize-none"
                placeholder="Share your expertise with clients..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-lg astro-btn-primary text-white font-bold text-xs shadow-lg hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </div>

          </div>
        </div>

        {/* Right Columns: Available Slots Matrix Grid */}
        <div className="lg:col-span-2">
          <div className="astro-card p-6 rounded-2xl border border-astro-border">
            <h2 className="text-base font-bold text-astro-dark border-b border-astro-border pb-2 mb-4 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-astro-muted" />
              Weekly Consultation Slots Planner
            </h2>
            <p className="text-astro-muted text-[11px] mb-6 leading-relaxed">
              Check/Uncheck hourly slots to define your booking availabilities. Clients can book sessions on these days for selected times.
            </p>

            <div className="space-y-6">
              {availability.map((dayConfig) => (
                <div key={dayConfig.day} className="p-4 rounded-xl bg-astro-cream border border-astro-border">
                  <h3 className="font-bold text-xs text-astro-dark mb-3 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dayConfig.day}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {timeSlotsOptions.map((slot) => {
                      const isChecked = dayConfig.slots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotToggle(dayConfig.day, slot)}
                          className={`py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                            isChecked
                              ? 'bg-astro-cream text-astro-dark border-purple-500/80 shadow-md'
                              : 'bg-white text-astro-muted border-astro-border hover:border-astro-border hover:text-astro-dark'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
