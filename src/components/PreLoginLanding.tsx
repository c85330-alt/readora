import React from 'react';
import { BookClub } from '../types';
import { Lock, ArrowRight, ShieldCheck, BookOpen, Users, MapPin, Sparkles, CheckCircle2, Mail } from 'lucide-react';

interface PreLoginLandingProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  clubs: BookClub[];
}

export const PreLoginLanding: React.FC<PreLoginLandingProps> = ({
  onOpenLogin,
  onOpenSignup,
  clubs
}) => {
  return (
    <div className="min-h-screen bg-[#F4F0E5] text-[#19221C] flex flex-col font-sans selection:bg-[#DF612D]/20 selection:text-[#DF612D]">
      {/* Top Pre-login Bar */}
      <header className="sticky top-0 z-40 bg-[#F4F0E5]/95 backdrop-blur-md border-b border-[#E6DFD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-[Arial,sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1D2520]">
              리도라
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-[#19221C] uppercase pl-2 border-l border-[#C8BFB0] font-sans">
              Book Club
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onOpenLogin}
              className="text-xs sm:text-sm font-semibold text-[#19221C] hover:text-[#DF612D] px-3.5 py-2 transition-colors cursor-pointer"
            >
              로그인
            </button>

            <button
              onClick={onOpenSignup}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-[#DF612D] hover:bg-[#c95221] text-white px-4 sm:px-5 py-2.5 rounded-full shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <span>회원가입</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Welcome Banner */}
      <main className="flex-1">
        <section className="pt-12 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E0D8C8] shadow-xs text-xs font-medium text-[#465349] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#DF612D]" />
            <span>캘거리 한인 독서 커뮤니티 · 이메일 본인인증 회원제</span>
          </div>

          {/* Heading with Slogan */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#19221C] leading-[1.2] max-w-4xl mx-auto text-balance">
            Where Books Bring Us Together, <span className="font-serif italic font-bold text-[#2D6A4F]">Readora</span>
          </h1>

          {/* Launch Copy */}
          <p className="mt-5 text-base sm:text-lg text-[#556358] max-w-2xl mx-auto leading-relaxed text-pretty">
            같은 문장에 머물고, 같은 생각에 설레는 순간.<br />
            혼자 읽으면 지나쳤을 이야기들이 우리가 함께하는 시간 속에서 더 깊어집니다.
          </p>

          {/* Central Login & Join Gate Card */}
          <div className="mt-10 max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#E8E1D3] text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DF612D] via-[#2D6A4F] to-[#DF612D]" />

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#DF612D]/10 flex items-center justify-center text-[#DF612D]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1D2520]">회원 로그인 후 이용하기</h2>
                <p className="text-xs text-stone-500">
                  신뢰할 수 있는 교민 커뮤니티를 위해 회원 인증 후 독서모임 신청이 가능합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                onClick={onOpenLogin}
                className="w-full py-3.5 px-4 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>아이디로 로그인</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSignup}
                className="w-full py-3.5 px-4 bg-[#172E22] hover:bg-[#234332] text-white rounded-2xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>이메일 인증 회원가입</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-12 bg-[#EFEAE0] border-y border-[#E4DDD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#19221C]">
                왜 리도라(Readora)인가요?
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                타향살이의 외로움을 녹이고 같은 생각과 설렘으로 깊이 연결되는 독서 공간입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E6DFD2] shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#19221C] mb-2">
                  캘거리 중심 소규모 모임
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  센트럴 도서관, 켄싱턴 Higher Ground, 벨트라인 로스터리 등 캘거리의 따뜻한 베뉴에서 격주로 만납니다.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E6DFD2] shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#DF612D] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#19221C] mb-2">
                  이메일 본인인증 안심 커뮤니티
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  모든 참가자는 이메일 본인확인을 거쳐 가입하므로, 신뢰할 수 있고 안전한 분위기 속에서 대화가 진행됩니다.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E6DFD2] shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E4E79] flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#19221C] mb-2">
                  엄선된 큐레이션 & 가이드
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  책을 끝까지 읽지 못해도 질문 중심 발제문과 호스트의 따뜻한 리딩으로 누구나 편안하게 참여할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Preview of Upcoming Clubs (Locked / Login prompt) */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#DF612D]">Upcoming Clubs</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#19221C] mt-1">
                현재 신청 진행 중인 캘거리 독서모임
              </h2>
            </div>
            <button
              onClick={onOpenLogin}
              className="text-xs font-semibold text-[#DF612D] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>로그인하고 전체 모임 확인하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.slice(0, 3).map((club) => (
              <div
                key={club.id}
                onClick={onOpenLogin}
                className="bg-white rounded-3xl overflow-hidden border border-[#E6DFD2] shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col relative"
              >
                {/* Book Cover */}
                <div className="h-52 relative overflow-hidden bg-stone-100">
                  <img
                    src={club.coverImage}
                    alt={club.bookTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#172E22]/90 text-white backdrop-blur-xs">
                      {club.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-lg leading-tight line-clamp-1">{club.bookTitle}</h3>
                    <p className="text-xs text-stone-200 mt-0.5">{club.author}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-end">
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-[#DF612D]" />
                      <span className="truncate max-w-[150px]">{club.venueName}</span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-orange-50 text-[#DF612D] font-bold text-[11px] border border-orange-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      로그인 후 신청
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#172E22] hover:bg-[#234332] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>로그인하고 캘거리 모임 전체 둘러보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#172E22] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-[#234332]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-[Arial,sans-serif] text-2xl font-black tracking-tight text-white">리도라</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#DF612D] text-white font-medium font-serif-accent">Readora</span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              우리가 책으로 만나는 시간, 리도라
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-stone-400">
            <span>대표 문의:</span>
            <a
              href="mailto:readoracontact@gmail.com"
              className="text-[#DF612D] hover:underline font-mono font-medium"
            >
              readoracontact@gmail.com
            </a>
          </div>

          <div className="text-xs text-stone-500">
            © 2026 리도라 (Readora). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
