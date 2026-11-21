import React from 'react';
import { MapPin, Calendar, ArrowUpRight, Lock } from 'lucide-react';
import { BookClub } from '../types';

interface ClubCardProps {
  club: BookClub;
  onSelect: (club: BookClub) => void;
  isRegistered?: boolean;
  isLoggedIn?: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = ({
  club,
  onSelect,
  isRegistered,
  isLoggedIn = false,
}) => {
  const seatsLeft = club.maxSeats - club.currentSeats;
  const isAlmostFull = seatsLeft <= 2 && seatsLeft > 0;
  const isFull = seatsLeft <= 0;
  const isCancelled = club.status === 'cancelled';

  return (
    <div
      onClick={() => onSelect(club)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(club);
        }
      }}
      className="bg-[#FFFDF4] rounded-2xl p-5 border border-[#191919]/15 hover:border-[#191919]/45 transition-colors cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Row: Category & Area Boxes + Recruitment Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-[#F16B47]/10 text-[#F16B47] border border-[#F16B47]/25 text-[11px] font-bold whitespace-nowrap shrink-0">
              {club.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#B9D8E6]/45 text-[#191919] border border-[#191919]/15 text-[11px] font-medium truncate">
              {club.area}
            </span>
          </div>

          {isCancelled ? (
            <span className="px-2 py-0.5 rounded-md bg-[#191919]/10 text-[#191919]/55 text-[11px] font-bold shrink-0">
              취소됨
            </span>
          ) : isRegistered ? (
            <span className="px-2 py-0.5 rounded-md bg-[#FFE57E] text-[#191919] border border-[#191919]/20 text-[11px] font-bold shrink-0">
              신청 완료
            </span>
          ) : isFull || club.status === 'closed' ? (
            <span className="px-2 py-0.5 rounded-md bg-[#191919]/10 text-[#191919]/60 text-[11px] font-bold shrink-0">
              마감
            </span>
          ) : isAlmostFull || club.status === 'almost_full' ? (
            <span className="px-2 py-0.5 rounded-md bg-[#F16B47]/15 text-[#F16B47] border border-[#F16B47]/30 text-[11px] font-bold shrink-0">
              마감임박
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-[#B9D8E6]/50 text-[#191919] border border-[#191919]/15 text-[11px] font-bold shrink-0">
              모집중
            </span>
          )}
        </div>

        {/* Middle Row: Vertical Book Cover + Title, Book Title, Author (no applicant count shown) */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-28 sm:w-22 sm:h-30 shrink-0 rounded-xl overflow-hidden border border-[#191919]/15 bg-[#FBF9E9]">
            <img
              src={club.coverImage}
              alt={club.bookTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-base font-extrabold text-[#191919] group-hover:text-[#F16B47] transition-colors line-clamp-2 leading-snug">
              {club.title}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-[#F16B47] mt-1.5 truncate">
              {club.bookTitle}
            </p>
            <p className="text-xs text-[#191919]/60 mt-0.5 truncate">
              {club.author}
            </p>
          </div>
        </div>

        {/* Inner Schedule & Venue Box */}
        <div className="bg-[#FBF9E9] rounded-xl px-3.5 py-2.5 border border-[#191919]/12 space-y-1.5 mb-4 text-xs text-[#191919]/80">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#F16B47] shrink-0" />
            <span className="font-bold text-[#191919] truncate">{club.dateTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#191919]/60 shrink-0" />
            <span className="truncate">{club.venueName}</span>
          </div>
        </div>
      </div>

      {/* Footer Row: Host Identity on Left + Price & Auth Hint on Right */}
      <div className="pt-3.5 border-t border-[#191919]/10 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#191919]/15 bg-[#FFE57E]/40 shrink-0 flex items-center justify-center text-xs font-bold text-[#191919]">
            {club.hostAvatar ? (
              <img
                src={club.hostAvatar}
                alt={club.hostName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{club.hostName.charAt(0)}</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#191919] truncate">
                {club.hostName}
              </span>
              {club.isOfficialHost && (
                <span className="px-1.5 py-0.5 rounded bg-[#F16B47]/10 border border-[#F16B47]/25 text-[9px] font-bold text-[#F16B47] shrink-0">
                  Official
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#191919]/55 truncate">{club.hostRole}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-sm font-extrabold text-[#191919] tabular-nums">
            CAD <span className="text-[#F16B47]">${club.feeCAD}</span>
          </div>

          {isLoggedIn ? (
            <div className="inline-flex items-center justify-end gap-1 text-[11px] font-bold text-[#191919]/80 group-hover:text-[#F16B47] mt-0.5">
              <span>상세 & 신청</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          ) : (
            <div className="inline-flex items-center justify-end gap-1 text-[11px] font-semibold text-[#F16B47] mt-0.5">
              <Lock className="w-2.5 h-2.5" />
              <span>로그인 후 상세 확인</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
