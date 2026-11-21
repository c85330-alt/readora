import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Filter,
  X,
  ArrowUpRight,
  LayoutList,
  LayoutGrid,
  Plus,
  Lock,
} from 'lucide-react';
import { BookClub, CalgaryArea, User } from '../types';
import { ClubCard } from './ClubCard';
import { CALGARY_AREAS } from '../data/initialClubs';
import { parseClubDateTime } from '../utils/autoCancelClubs';

interface ClubExplorerProps {
  clubs: BookClub[];
  onSelectClub: (club: BookClub) => void;
  onOpenCreateClub: () => void;
  registeredClubIds: Set<string>;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  currentUser?: User | null;
}

export const ClubExplorer: React.FC<ClubExplorerProps> = ({
  clubs,
  onSelectClub,
  onOpenCreateClub,
  registeredClubIds,
  selectedCategory,
  onSelectCategory,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<CalgaryArea>('전체');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const filteredClubs = useMemo(() => {
    const nowMs = Date.now();
    return clubs.filter((club) => {
      // Hide cancelled clubs and already completed (past) clubs from public explorer
      if (club.status === 'cancelled') {
        return false;
      }
      const meetingDate = parseClubDateTime(club.dateTime);
      if (meetingDate && meetingDate.getTime() < nowMs) {
        return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesBook = club.bookTitle.toLowerCase().includes(query);
        const matchesAuthor = club.author.toLowerCase().includes(query);
        const matchesTitle = club.title.toLowerCase().includes(query);
        const matchesVenue = club.venueName.toLowerCase().includes(query);
        const matchesTags = club.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesBook && !matchesAuthor && !matchesTitle && !matchesVenue && !matchesTags) {
          return false;
        }
      }

      if (selectedCategory && selectedCategory !== '전체') {
        if (club.category !== selectedCategory) return false;
      }

      if (selectedArea && selectedArea !== '전체') {
        if (club.area !== selectedArea) return false;
      }

      if (onlyOpen) {
        if (club.status === 'closed' || club.currentSeats >= club.maxSeats) {
          return false;
        }
      }

      return true;
    });
  }, [clubs, searchTerm, selectedCategory, selectedArea, onlyOpen]);

  const hasActiveFilters =
    searchTerm !== '' || selectedCategory !== '전체' || selectedArea !== '전체' || onlyOpen;

  const handleResetFilters = () => {
    setSearchTerm('');
    onSelectCategory('전체');
    setSelectedArea('전체');
    setOnlyOpen(false);
  };

  const getRowStatusInfo = (club: BookClub) => {
    const isRegistered = registeredClubIds.has(club.id);
    if (club.status === 'cancelled') {
      return {
        label: '취소됨',
        className: 'bg-[#191919]/8 text-[#191919]/50 border-[#191919]/12',
      };
    }
    if (isRegistered) {
      return {
        label: '신청 완료',
        className: 'bg-[#FFE57E] text-[#191919] border-[#191919]/20',
      };
    }
    if (club.status === 'closed' || club.currentSeats >= club.maxSeats) {
      return {
        label: '마감',
        className: 'bg-[#191919]/8 text-[#191919]/55 border-[#191919]/12',
      };
    }
    if (club.status === 'almost_full' || club.maxSeats - club.currentSeats <= 2) {
      return {
        label: '마감임박',
        className: 'bg-[#F16B47]/15 text-[#F16B47] border-[#F16B47]/35',
      };
    }
    return {
      label: '모집중',
      className: 'bg-[#B9D8E6]/45 text-[#191919] border-[#191919]/15',
    };
  };

  return (
    <section
      id="explore-section"
      className="py-16 sm:py-24 bg-[#FBF9E9] scroll-mt-20 overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <p className="font-display-en text-xs font-bold tracking-[0.16em] uppercase text-[#191919]/55 mb-2.5">
              UPCOMING CLUBS
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#191919] tracking-tight">
              다음 모임에서 볼래?
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* List / Card View Switcher */}
            <div className="inline-flex items-center p-1 rounded-lg bg-[#FFFDF4] border border-[#191919]/15">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="리스트 보기"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#191919] text-[#FFE57E]'
                    : 'text-[#191919]/65 hover:text-[#191919]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>리스트</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="카드 보기"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#191919] text-[#FFE57E]'
                    : 'text-[#191919]/65 hover:text-[#191919]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>카드</span>
              </button>
            </div>

            {currentUser && (currentUser.role === 'admin' || currentUser.role === 'host') && (
              <button
                type="button"
                onClick={onOpenCreateClub}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FFE57E] hover:bg-[#191919] text-[#191919] hover:text-[#FFE57E] border border-[#191919]/15 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>모임 개설</span>
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Filter & Search Bar */}
        <div className="bg-[#FFFDF4] rounded-xl p-4 sm:p-5 border border-[#191919]/15 mb-8">
          <div className="relative w-full mb-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#191919]/45" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="책 제목, 작가, 모임 장소, 키워드 검색..."
              className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/15 text-xs sm:text-sm text-[#191919] placeholder-[#191919]/40 focus:outline-none focus:border-[#191919] transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#191919]/50 hover:text-[#191919] cursor-pointer"
                aria-label="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-[#191919]/10 text-xs">
            {/* Area Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="font-bold text-[#191919] flex items-center gap-1 shrink-0 mr-1">
                <MapPin className="w-3.5 h-3.5 text-[#F16B47]" />
                지역
              </span>
              {CALGARY_AREAS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors shrink-0 cursor-pointer border ${
                    selectedArea === area
                      ? 'bg-[#191919] text-[#FFE57E] border-[#191919]'
                      : 'bg-[#FBF9E9] text-[#191919]/75 border-[#191919]/12 hover:border-[#191919]/40'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Category Filter & Open Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap">
                <span className="font-bold text-[#191919] flex items-center gap-1 shrink-0 mr-1">
                  <Filter className="w-3.5 h-3.5 text-[#191919]" />
                  주제
                </span>
                {['전체', '문학/소설', '인문/철학', '에세이/이민', '경제/자기계발', '사회/과학'].map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onSelectCategory(cat)}
                      className={`px-2.5 py-1.5 rounded-md font-semibold transition-colors shrink-0 cursor-pointer border ${
                        selectedCategory === cat
                          ? 'bg-[#FFE57E] text-[#191919] border-[#191919]'
                          : 'bg-[#FBF9E9] text-[#191919]/75 border-[#191919]/12 hover:border-[#191919]/40'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#191919] cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={onlyOpen}
                  onChange={(e) => setOnlyOpen(e.target.checked)}
                  className="w-4 h-4 rounded border-[#191919]/30 accent-[#191919] cursor-pointer"
                />
                <span>신청 가능만 보기</span>
              </label>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-[#191919]/10 flex items-center justify-between text-xs text-[#191919]/70">
              <span>
                검색 결과 <strong className="text-[#191919] tabular-nums">{filteredClubs.length}</strong>개
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[#F16B47] hover:underline font-bold cursor-pointer"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Clubs List / Grid */}
        {filteredClubs.length > 0 ? (
          viewMode === 'list' ? (
            <div className="border-t border-[#191919]/15">
              {/* Desktop Column Headings */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-[#191919]/50 border-b border-[#191919]/12">
                <div className="col-span-5">모임 제목 · 선정 도서</div>
                <div className="col-span-4">일시 · 장소</div>
                <div className="col-span-3 text-right">
                  {currentUser?.role === 'admin' || currentUser?.role === 'host'
                    ? '인원 · 모집 상태'
                    : '모집 상태'}
                </div>
              </div>

              {/* Thin Horizontal-Divider Rows */}
              <div className="divide-y divide-[#191919]/15 border-b border-[#191919]/15">
                {filteredClubs.map((club) => {
                  const status = getRowStatusInfo(club);
                  return (
                    <div
                      key={club.id}
                      onClick={() => onSelectClub(club)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectClub(club);
                        }
                      }}
                      className="group py-5 px-2 sm:px-4 mx-0 sm:-mx-4 rounded-lg hover:bg-[#FFFDF4] transition-colors cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center"
                    >
                      {/* Col 1: Book Cover Thumb + Club Title & Book */}
                      <div className="md:col-span-5 flex items-start gap-3.5 min-w-0">
                        <div className="w-11 h-14 rounded-md overflow-hidden border border-[#191919]/15 bg-[#FFE57E]/25 shrink-0">
                          <img
                            src={club.coverImage}
                            alt={club.bookTitle}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-extrabold text-[#191919] group-hover:text-[#F16B47] transition-colors leading-snug line-clamp-2">
                            {club.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#191919]/70 mt-1 truncate">
                            <span className="font-semibold text-[#191919]">
                              《{club.bookTitle}》
                            </span>{' '}
                            · {club.author}
                          </p>
                        </div>
                      </div>

                      {/* Col 2: Date/Time & Venue */}
                      <div className="md:col-span-4 space-y-0.5 text-xs sm:text-sm min-w-0">
                        <p className="font-semibold text-[#191919] truncate">{club.dateTime}</p>
                        <p className="text-xs text-[#191919]/65 truncate">
                          {club.venueName} · {club.area}
                        </p>
                      </div>

                      {/* Col 3: Status + Arrow (seat counts hidden from regular users) */}
                      <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 pt-1 md:pt-0">
                        <div className="flex items-center gap-2.5">
                          {(currentUser?.role === 'admin' || currentUser?.role === 'host') && (
                            <span className="text-xs font-bold text-[#191919]/75 tabular-nums">
                              {club.currentSeats}/{club.maxSeats}명
                            </span>
                          )}
                          <span
                            className={`px-2.5 py-1 rounded-md border text-[11px] font-bold whitespace-nowrap ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#191919]/50 group-hover:text-[#191919] transition-colors shrink-0">
                          {!currentUser && <Lock className="w-3 h-3" />}
                          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onSelect={onSelectClub}
                  isRegistered={registeredClubIds.has(club.id)}
                  isLoggedIn={!!currentUser}
                />
              ))}
            </div>
          )
        ) : (
          <div className="bg-[#FFFDF4] rounded-2xl p-10 sm:p-12 text-center border border-[#191919]/15 max-w-lg mx-auto">
            <h3 className="text-lg font-extrabold text-[#191919] mb-2">
              조건에 맞는 모임이 없어요
            </h3>
            <p className="text-sm text-[#191919]/65 mb-6">
              검색어나 필터를 조정하거나 새로운 독서모임을 둘러보세요.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-xs font-bold text-[#191919] hover:bg-[#191919] hover:text-white transition-colors cursor-pointer"
              >
                필터 초기화
              </button>
              <button
                type="button"
                onClick={onOpenCreateClub}
                className="px-4 py-2.5 rounded-lg bg-[#FFE57E] border border-[#191919]/20 text-xs font-bold text-[#191919] hover:bg-[#191919] hover:text-[#FFE57E] transition-colors cursor-pointer"
              >
                모임 제안하기
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
