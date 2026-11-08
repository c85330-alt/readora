import React from 'react';
import { MapPin, Calendar, CheckCircle2, AlertCircle, ArrowUpRight, Lock } from 'lucide-react';
import { BookClub } from '../types';

interface ClubCardProps {
  club: BookClub;
  onSelect: (club: BookClub) => void;
  isRegistered?: boolean;
  isLoggedIn?: boolean;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onSelect, isRegistered, isLoggedIn = false }) => {
  const seatsLeft = club.maxSeats - club.currentSeats;
  const isAlmostFull = seatsLeft <= 2 && seatsLeft > 0;
  const isFull = seatsLeft <= 0;

  return (
    <div
      onClick={() => onSelect(club)}
      className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E9E1D2] hover:border-[#DF612D]/40 active:scale-[0.99] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between group"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF3EA] text-[#B54A18] border border-[#F3E2CF]">
              {club.category}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#EEF4FB] text-[#24547E] border border-[#D5E3F0]">
              {club.area}
            </span>
          </div>

          {/* Status badge: 신청 완료, 마감, 마감임박, 모집중 */}
          {isRegistered ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2D6A4F] bg-[#E8F2E8] px-2.5 py-0.5 rounded-full shrink-0">
              <CheckCircle2 className="w-3 h-3" />
              신청 완료
            </span>
          ) : isFull || club.status === 'closed' ? (
            <span className="text-[11px] font-semibold text-[#8C948F] bg-[#F2F4F2] px-2.5 py-0.5 rounded-full shrink-0">
              마감
            </span>
          ) : isAlmostFull || club.status === 'almost_full' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DF612D] bg-[#FDEEE3] px-2.5 py-0.5 rounded-full shrink-0">
              <AlertCircle className="w-3 h-3" />
              마감임박
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-[#2D6A4F] bg-[#E8F2E8] px-2.5 py-0.5 rounded-full shrink-0">
              모집중
            </span>
          )}
        </div>

        {/* Book Cover and Title Row */}
        <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="w-18 sm:w-20 h-24 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-sm bg-neutral-100 border border-[#EBE3D5] relative group-hover:scale-102 transition-transform">
            <img
              src={club.coverImage}
              alt={club.bookTitle}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5 space-y-1">
            <h3 className="text-base font-bold text-[#19221C] group-hover:text-[#DF612D] transition-colors line-clamp-2 leading-snug">
              {club.title}
            </h3>
            <p className="text-xs font-semibold text-[#DF612D] truncate">
              {club.bookTitle}
            </p>
            <p className="text-xs text-[#6B786F] truncate">
              {club.author} 저
            </p>
          </div>
        </div>

        {/* Info Grid (Date, Venue) */}
        <div className="bg-[#F4F0E5] rounded-2xl p-3 border border-[#EBE4D5] space-y-2 mb-4 text-xs text-[#3E4C41]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#DF612D] flex-shrink-0" />
            <span className="font-semibold text-[#19221C] truncate">{club.dateTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#2D6A4F] flex-shrink-0" />
            <span className="truncate">{club.venueName}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Host & Seat/Price */}
      <div className="pt-3 border-t border-[#F0E9DC] flex items-center justify-between">
        {/* Host Avatar & Name */}
        <div className="flex items-center gap-2">
          <img
            src={club.hostAvatar}
            alt={club.hostName}
            className="w-7 h-7 rounded-full object-cover border border-[#DF612D]/30"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#19221C]">{club.hostName}</span>
              {club.isOfficialHost && (
                <span className="text-[9px] font-bold text-[#DF612D] bg-[#FDEEE3] px-1 py-0.2 rounded">
                  Official
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#76847A]">{club.hostRole.split('&')[0]}</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="text-right">
          <div className="text-xs font-bold text-[#19221C]">
            CAD <span className="text-sm font-extrabold text-[#DF612D]">${club.feeCAD}</span>
          </div>
          {isLoggedIn ? (
            <span className="inline-flex items-center text-[11px] font-semibold text-[#DF612D] group-hover:underline">
              상세 정보 & 신청 <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          ) : (
            <span className="inline-flex items-center text-[11px] font-semibold text-[#DF612D] group-hover:underline">
              <Lock className="w-3 h-3 mr-1 text-[#DF612D]" />
              로그인 후 상세 확인
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
