import React from 'react';
import { Star, Briefcase, IndianRupee } from 'lucide-react';

const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&crop=face';

const PanditCard = ({ pandit, onBook }) => {
  const photo = pandit.profilePhoto || FALLBACK_PHOTO;
  const name = pandit.userId?.name || 'Pandit';

  return (
    <div className="astro-card overflow-hidden flex flex-col glass-panel-hover">
      {/* Photo */}
      <div className="relative h-48 overflow-hidden bg-astro-cream">
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover object-top"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_PHOTO; }}
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-astro-border px-2 py-1 rounded-full">
          <Star className="w-3.5 h-3.5 text-astro-accent fill-astro-accent" />
          <span className="text-xs font-bold text-astro-dark">
            {pandit.rating || 'New'}
          </span>
          {pandit.reviewsCount > 0 && (
            <span className="text-[10px] text-astro-muted">({pandit.reviewsCount})</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-semibold text-astro-dark">{name}</h3>
        <span className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-astro-cream border border-astro-border text-astro-muted w-fit mt-1 mb-3">
          {pandit.specialization}
        </span>

        <p className="text-astro-muted text-xs leading-relaxed mb-4 line-clamp-3 flex-1">
          {pandit.bio || 'Experienced pandit providing guidance through traditional astrological wisdom.'}
        </p>

        <div className="flex justify-between items-center text-xs text-astro-muted border-t border-astro-border pt-4 mb-4">
          <div className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{pandit.experience} yrs exp</span>
          </div>
          <div className="flex items-center gap-0.5 font-bold text-astro-dark">
            <IndianRupee className="w-3.5 h-3.5 text-astro-muted" strokeWidth={1.5} />
            <span className="text-base">{pandit.fee}</span>
            <span className="text-[10px] font-normal text-astro-muted">/session</span>
          </div>
        </div>

        <button
          onClick={() => onBook(pandit)}
          className="w-full py-2.5 rounded-full bg-astro-dark text-white font-semibold text-xs hover:bg-neutral-800 transition-all"
        >
          Book Consultation
        </button>
      </div>
    </div>
  );
};

export default PanditCard;
