import React from 'react';
import { BookOpen, Compass, Feather, TrendingUp, ArrowRight } from 'lucide-react';
import { BookCategory } from '../types';

interface CategoriesSectionProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onViewAll: () => void;
}

const CATEGORY_CARDS = [
  {
    key: '문학/소설',
    title: '문학 & 소설',
    engTitle: 'Literature & Novels',
    bgClass: 'bg-[#EBF2FA]',
    borderClass: 'border-[#D5E3F5]',
    accentColor: 'text-[#1E4E79]',
    icon: BookOpen,
    desc: '베스트셀러 소설과 세계 문학을 통해 타인의 삶을 엿보고 위로를 얻습니다.',
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80',
    sampleBook: '<불편한 편의점>, <모순>'
  },
  {
    key: '인문/철학',
    title: '인문 & 철학',
    engTitle: 'Humanities & Thinking',
    bgClass: 'bg-[#E8F2E8]',
    borderClass: 'border-[#D1E5D2]',
    accentColor: 'text-[#2D6A4F]',
    icon: Compass,
    desc: '주의력, 철학, 심리학 등 삶의 본질을 짚어보는 깊이 있는 지적 대화.',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    sampleBook: '<도둑맞은 집중력>, <아침 그리고 저녁>'
  },
  {
    key: '에세이/이민',
    title: '에세이 & 이민생활',
    engTitle: 'Essays & Calgary Life',
    bgClass: 'bg-[#F6EBF2]',
    borderClass: 'border-[#EED5E7]',
    accentColor: 'text-[#8A3B68]',
    icon: Feather,
    desc: '캐나다 캘거리에서의 정착, 타향살이의 고민과 따뜻한 연대의 이야기.',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    sampleBook: '<어쩌다 캐나다>, <순간을 살다>'
  },
  {
    key: '경제/자기계발',
    title: '경제 & 자기계발',
    engTitle: 'Finance & Growth',
    bgClass: 'bg-[#FDEEE3]',
    borderClass: 'border-[#F8D8C3]',
    accentColor: 'text-[#DF612D]',
    icon: TrendingUp,
    desc: '캐나다에서의 경제적 자립, 자산 형성, 건강한 일상의 습관을 함께 다집니다.',
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80',
    sampleBook: '<돈의 속성>, <원씽>'
  }
];

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  onViewAll
}) => {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-[#F4F0E5] border-t border-[#E6DFD2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#19221C] tracking-tight">
              Pick a{' '}
              <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
                chapter
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2.5 text-[#2D6A4F]/30"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 2,15 Q 50,5 98,13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h2>
            <p className="text-xs sm:text-base text-[#616F65] mt-1.5 sm:mt-2">
              캘거리에서 함께 읽고 싶은 관심 분야를 선택해보세요
            </p>
          </div>

          <button
            onClick={onViewAll}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <span>전체 모임 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Pastel Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {CATEGORY_CARDS.map((card) => {
            const Icon = card.icon;
            const isSelected = selectedCategory === card.key;

            return (
              <div
                key={card.key}
                onClick={() => onSelectCategory(card.key)}
                className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 ${card.bgClass} border ${
                  isSelected ? 'ring-3 ring-[#DF612D] border-transparent shadow-md' : card.borderClass
                } transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between group active:scale-[0.99]`}
              >
                <div>
                  {/* Top Icon Badge */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/80 backdrop-blur-xs flex items-center justify-center shadow-xs">
                      <Icon className={`w-4 h-4 ${card.accentColor}`} />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-[#546258] bg-white/50 px-2 py-0.5 rounded-md">
                      {card.engTitle}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-lg sm:text-xl font-bold text-[#19221C] group-hover:text-[#DF612D] transition-colors mb-1 sm:mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#526056] leading-relaxed mb-3 sm:mb-4">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom Image Thumbnail */}
                <div className="mt-1 sm:mt-2">
                  <div className="w-full h-28 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-2.5">
                      <span className="text-[10px] sm:text-[11px] font-medium text-white/95 line-clamp-1">
                        추천: {card.sampleBook}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
