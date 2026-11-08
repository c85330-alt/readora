import React, { useState, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, Filter, X } from 'lucide-react';
import { BookClub, CalgaryArea, User } from '../types';
import { ClubCard } from './ClubCard';
import { CALGARY_AREAS } from '../data/initialClubs';

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
  currentUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<CalgaryArea>('전체');
  const [onlyOpen, setOnlyOpen] = useState(false);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesBook = club.bookTitle.toLowerCase().includes(query);
        const matchesAuthor = club.author.toLowerCase().includes(query);
        const matchesTitle = club.title.toLowerCase().includes(query);
        const matchesVenue = club.venueName.toLowerCase().includes(query);
        const matchesTags = club.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesBook && !matchesAuthor && !matchesTitle && !matchesVenue && !matchesTags) {
          return false;
        }
      }

      // Category
      if (selectedCategory && selectedCategory !== '전체') {
        if (club.category !== selectedCategory) return false;
      }

      // Area
      if (selectedArea && selectedArea !== '전체') {
        if (club.area !== selectedArea) return false;
      }

      // Only open
      if (onlyOpen) {
        if (club.currentSeats >= club.maxSeats) return false;
      }

      return true;
    });
  }, [clubs, searchTerm, selectedCategory, selectedArea, onlyOpen]);

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== '전체' || selectedArea !== '전체' || onlyOpen;

  const handleResetFilters = () => {
    setSearchTerm('');
    onSelectCategory('전체');
    setSelectedArea('전체');
    setOnlyOpen(false);
  };

  return (
    <section id="explore-section" className="py-12 sm:py-16 md:py-24 bg-[#F4F0E5] border-t border-[#EDE4D5] scroll-mt-16 sm:scroll-mt-20">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#19221C] tracking-tight">
            관심 있는 책과 모임을 찾아보세요
          </h2>
          <p className="text-xs sm:text-base text-[#616F65] mt-1.5 sm:mt-2 px-2">
            캘거리 주요 카페와 중앙도서관에서 열리는 소규모 독서모임입니다.
          </p>
        </div>

        {/* Filter & Search Bar Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-[#EBE3D5] mb-6 sm:mb-10">
          {/* Search Row */}
          <div className="relative w-full mb-4 sm:mb-5">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#8F9A92]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="책 제목, 작가, 키워드 검색..."
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[#F4F0E5] border border-[#E5DDCF] text-xs sm:text-sm text-[#19221C] placeholder-[#8F9A92] focus:outline-none focus:ring-2 focus:ring-[#DF612D]/50 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8F9A92] hover:text-[#19221C]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills Grid */}
          <div className="space-y-3 pt-3 border-t border-[#F0E9DC]">
            {/* Area Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar -mx-1 px-1">
              <span className="font-bold text-[#455248] flex items-center gap-1 flex-shrink-0 mr-1 text-[11px] sm:text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#DF612D]" />
                지역:
              </span>
              {CALGARY_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-colors flex-shrink-0 cursor-pointer ${
                    selectedArea === area
                      ? 'bg-[#DF612D] text-white shadow-xs'
                      : 'bg-[#F4F0E5] text-[#546258] hover:bg-[#F2ECE0] border border-[#ECE3D5]'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>

            {/* Category Filter & Open Seat Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar -mx-1 px-1 sm:flex-wrap">
                <span className="font-bold text-[#455248] flex items-center gap-1 flex-shrink-0 mr-1 text-[11px] sm:text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  주제:
                </span>
                {['전체', '문학/소설', '인문/철학', '에세이/이민', '경제/자기계발', '사회/과학'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-[#2D6A4F] text-white shadow-xs'
                        : 'bg-[#F4F0E5] text-[#546258] hover:bg-[#F2ECE0] border border-[#ECE3D5]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Open Seat Toggle */}
              <div className="flex items-center gap-2 pt-1 sm:pt-0">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#455248] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyOpen}
                    onChange={(e) => setOnlyOpen(e.target.checked)}
                    className="rounded text-[#DF612D] focus:ring-[#DF612D]"
                  />
                  <span>신청 가능만 보기</span>
                </label>
              </div>
            </div>
          </div>

          {/* Active Filter status */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t border-[#F0E9DC] flex items-center justify-between text-xs text-[#637267]">
              <span>
                필터 적용 중: <strong className="text-[#19221C]">{filteredClubs.length}개</strong>의 모임이 있습니다.
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[#DF612D] hover:underline font-semibold cursor-pointer"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>

        {/* Club Grid */}
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E9E1D2] max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#FDEEE3] text-[#DF612D] flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#19221C] mb-2">
              조건에 맞는 독서모임이 없습니다
            </h3>
            <p className="text-sm text-[#6B7970] mb-6">
              검색어나 필터를 변경하시거나, 직접 원하는 책으로 새로운 모임을 제안해보세요!
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-full bg-[#F4F0E5] border border-[#DDD4C3] text-xs font-semibold text-[#19221C] hover:bg-[#F2ECE0] cursor-pointer"
              >
                필터 전체 초기화
              </button>
              <button
                onClick={onOpenCreateClub}
                className="px-4 py-2 rounded-full bg-[#DF612D] text-white text-xs font-semibold hover:bg-[#c95221] cursor-pointer"
              >
                새 모임 개설하기
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
