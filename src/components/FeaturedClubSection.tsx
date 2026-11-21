import React, { useState } from 'react';
import { ArrowUpRight, Calendar, MapPin, BookOpen } from 'lucide-react';
import { BookClub } from '../types';

interface FeaturedClubSectionProps {
  clubs: BookClub[];
  onSelectClub: (club: BookClub) => void;
  isLoggedIn?: boolean;
}

export const FeaturedClubSection: React.FC<FeaturedClubSectionProps> = ({
  clubs,
  onSelectClub,
  isLoggedIn = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const featuredClub =
    clubs.find((c) => c.status === 'open' || c.status === 'almost_full') ??
    clubs.find((c) => c.status !== 'cancelled') ??
    clubs[0];

  // Do not fabricate a featured club if no real clubs exist
  if (!featuredClub) return null;

  return (
    <section className="pb-10 sm:pb-16 bg-[#FBF9E9]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          onClick={() => onSelectClub(featuredClub)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectClub(featuredClub);
            }
          }}
          className="group relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden border border-[#191919]/15 bg-[#191919] cursor-pointer"
        >
          {featuredClub.coverImage && !imgError ? (
            <img
              src={featuredClub.coverImage}
              alt={featuredClub.bookTitle}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#191919] text-[#FBF9E9] p-8 text-center">
              <BookOpen className="w-10 h-10 text-[#FFE57E] mb-3" />
              <p className="text-lg font-bold">{featuredClub.bookTitle}</p>
              <p className="text-xs text-[#FBF9E9]/60 mt-1">{featuredClub.author}</p>
            </div>
          )}

          {/* Subtle dark editorial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#191919]/92 via-[#191919]/35 to-transparent" />

          {/* Top-left Highlight Tag */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-md bg-[#FFE57E] text-[#191919] font-display-en text-xs font-bold tracking-wide">
              Featured Club
            </span>
          </div>

          {/* Top-right Seat / Fee summary */}
          <div className="hidden sm:flex absolute top-6 right-6 items-center gap-2 px-3 py-1.5 rounded-md bg-[#FFFDF4]/95 text-[#191919] text-xs font-bold tabular-nums">
            <span>
              {featuredClub.currentSeats}/{featuredClub.maxSeats}명
            </span>
            <span className="text-[#191919]/30">·</span>
            <span>CAD ${featuredClub.feeCAD}</span>
          </div>

          {/* Bottom Content Bar */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 text-[#FBF9E9]">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs sm:text-sm font-semibold text-[#FFE57E]">
                《{featuredClub.bookTitle}》 · {featuredClub.author}
              </p>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-snug text-white">
                {featuredClub.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-[#FBF9E9]/85 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFE57E]" />
                  <span>{featuredClub.dateTime}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B9D8E6]" />
                  <span>{featuredClub.venueName}</span>
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#FFFDF4] text-[#191919] group-hover:bg-[#FFE57E] text-xs sm:text-sm font-bold transition-colors">
                <span>{isLoggedIn ? '모임 상세 보기' : '로그인 후 신청하기'}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
