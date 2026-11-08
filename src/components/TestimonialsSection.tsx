import React from 'react';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      '“캘거리로 이주한 지 1년 차라 아는 사람도 적고 외로웠는데, 리도라 독서모임 덕분에 매달 깊은 대화를 나눌 수 있는 소중한 한인 친구들을 만났습니다.”',
    name: '민지 (Minji Kim)',
    role: '캘거리 다운타운 거주 • 직장인',
    book: '참여 모임: 《불편한 편의점》',
    bg: 'bg-[#DCEBF8]',
    border: 'border-[#C8DEF2]',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
  },
  {
    quote:
      '“혼자 읽을 땐 그냥 지나쳤던 문장들이 다른 분들의 시선과 캘거리 생활 경험담을 통해 완전히 새롭게 다가왔어요. 발제문 질문들이 정말 훌륭합니다.”',
    name: '준호 (Junho Park)',
    role: '캘거리 NW 거주 • 소프트웨어 엔지니어',
    book: '참여 모임: 《도둑맞은 집중력》',
    bg: 'bg-[#F5E6F0]',
    border: 'border-[#ECD3E5]',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    quote:
      '“처음에는 다 완독하지 못하면 어쩌나 걱정했는데, 호스트님이 편안하게 경청해주셔서 부담 없이 내 생각을 나눌 수 있었습니다. 주말 오클레어 카페 모임 강추해요!”',
    name: '수진 (Stella Lee)',
    role: '캘거리 SW 거주 • 주부 & 프리랜서',
    book: '참여 모임: 《모순》',
    bg: 'bg-[#FDECE0]',
    border: 'border-[#F8D5C0]',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-[#F4F0E5] border-t border-[#E6DFD2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching "What families say" */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#19221C] tracking-tight">
            What readers{' '}
            <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
              say
              <svg
                className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#2D6A4F]/30"
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
          <p className="text-sm text-[#637267] mt-2">
            캘거리 한인 회원들이 직접 전하는 생생한 모임 후기
          </p>
        </div>

        {/* 3 Pastel Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-6 sm:p-7 ${t.bg} border ${t.border} flex flex-col justify-between shadow-xs hover:-translate-y-1 transition-all duration-200`}
            >
              {/* Star sticker at top-left */}
              <div className="absolute -top-3 left-6">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EAA228] text-white shadow-xs">
                  ★
                </span>
              </div>

              <div className="pt-2">
                <p className="text-xs sm:text-sm font-medium text-[#1E2721] leading-relaxed mb-6">
                  {t.quote}
                </p>
              </div>

              {/* Author & Avatar */}
              <div className="pt-4 border-t border-black/5 flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-white"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#19221C]">{t.name}</h4>
                  <p className="text-[10px] text-[#556358]">{t.role}</p>
                  <p className="text-[10px] font-semibold text-[#DF612D]">{t.book}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rating summary badge at bottom */}
        <div className="flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-[#E5DDCF] shadow-xs">
            <div className="flex text-[#EAA228]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current text-[#EAA228]" />
              ))}
            </div>
            <span className="text-xs font-bold text-[#19221C]">
              4.9 / 5 Based on 150+ Calgary member reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
