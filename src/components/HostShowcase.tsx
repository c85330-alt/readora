import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HostShowcaseProps {
  onBecomeHostClick: () => void;
}

const HOSTS = [
  {
    name: '리도라 운영팀',
    role: '운영자 직영 모임',
    category: '문학 & 에세이',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
    quote: '캘거리의 긴 겨울을 따뜻한 책과 다정한 이웃의 대화로 채워나갑니다.',
    bg: 'bg-[#2E7957]',
    badgeBg: 'bg-[#EBF3EC]',
    badgeText: 'text-[#2D6A4F]'
  },
  {
    name: '다니엘 (Daniel Kim)',
    role: '인증 호스트',
    category: '인문 & 생산성',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
    quote: '알림이 끊이지 않는 시대, 종이책 속에서 내 온전한 집중력을 되찾는 토론을 이끕니다.',
    bg: 'bg-[#C2DFCA]',
    badgeBg: 'bg-[#E8F2E8]',
    badgeText: 'text-[#2D6A4F]'
  },
  {
    name: '서연 (Chloe Song)',
    role: '인증 호스트',
    category: '한국문학 & 서사',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80',
    quote: '소설 속 인물들의 선택을 따라가며 우리 삶의 모순과 아름다움을 깊이 음미합니다.',
    bg: 'bg-[#F3D5EB]',
    badgeBg: 'bg-[#F6EBF2]',
    badgeText: 'text-[#8A3B68]'
  },
  {
    name: '제이슨 (Jason Park)',
    role: '인증 호스트',
    category: '경제 & 자산관리',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    quote: '캐나다에서의 경제적 독립과 삶의 기초 체력을 책과 함께 단단히 다져나갑니다.',
    bg: 'bg-[#F9D6C4]',
    badgeBg: 'bg-[#FDEEE3]',
    badgeText: 'text-[#DF612D]'
  }
];

export const HostShowcase: React.FC<HostShowcaseProps> = ({ onBecomeHostClick }) => {
  return (
    <section className="py-20 md:py-28 bg-[#F4F0E5] border-t border-[#E6DFD2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching "Meet the mentors" */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF3EC] text-[#2D6A4F] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Hosts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#19221C] tracking-tight">
            Meet the{' '}
            <span className="text-[#2D6A4F] font-serif-accent italic relative inline-block px-1">
              hosts
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
          <p className="text-sm sm:text-base text-[#616F65] mt-2">
            초기 운영진 직접 진행부터 일반 회원의 호스트 데뷔까지, 열정 있는 독서 리더들을 만나보세요.
          </p>
        </div>

        {/* 4 Host Cards Grid matching the mentors layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {HOSTS.map((host, i) => (
            <div
              key={i}
              className="rounded-3xl overflow-hidden bg-white border border-[#E9E1D2] shadow-sm flex flex-col justify-between group hover:-translate-y-1 transition-all duration-200"
            >
              <div>
                {/* Host Photo with tinted rounded background header */}
                <div className={`p-4 ${host.bg} flex items-center justify-center`}>
                  <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-md border-2 border-white/60">
                    <img
                      src={host.photo}
                      alt={host.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="p-5 text-left">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${host.badgeBg} ${host.badgeText}`}>
                      {host.role}
                    </span>
                    <span className="text-[11px] text-[#718076] font-medium">
                      {host.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#19221C] mb-2">
                    {host.name}
                  </h3>

                  <p className="text-xs text-[#526055] leading-relaxed line-clamp-3">
                    "{host.quote}"
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <span className="text-[11px] font-semibold text-[#DF612D] group-hover:underline flex items-center gap-1">
                  호스트 프로필 보기 →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Host Recruitment Link */}
        <div className="text-center">
          <button
            onClick={onBecomeHostClick}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#DF612D] hover:text-[#b84c1f] hover:underline cursor-pointer"
          >
            <span>나도 캘거리에서 책 모임을 열고 싶다면? 호스트 신청하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
