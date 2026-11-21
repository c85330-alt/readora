import React, { useState } from 'react';
import { 
  User, 
  BookClub, 
  RSVPRecord 
} from '../types';
import { 
  Crown, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Users, 
  PlusCircle, 
  ExternalLink, 
  LogOut, 
  Edit3, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Mail, 
  Phone, 
  CreditCard, 
  Sparkles, 
  X, 
  Send,
  AlertTriangle,
  Bell,
  User as UserIcon
} from 'lucide-react';

interface HostDashboardProps {
  currentUser: User;
  clubs: BookClub[];
  rsvps: RSVPRecord[];
  onOpenCreateClub: () => void;
  onEditClub: (club: BookClub) => void;
  onRequestCancelClub: (club: BookClub) => void;
  onSelectClubDetail: (club: BookClub) => void;
  onSwitchToUserView: () => void;
  onLogout: () => void;
  onOpenMyPage?: () => void;
  onTriggerAutoCancellationCheck?: () => void;
  onViewAutoCancelLogs?: () => void;
  autoCancelLogsCount?: number;
}

export const HostDashboard: React.FC<HostDashboardProps> = ({
  currentUser,
  clubs,
  rsvps,
  onOpenCreateClub,
  onEditClub,
  onRequestCancelClub,
  onSelectClubDetail,
  onSwitchToUserView,
  onLogout,
  onOpenMyPage,
  onTriggerAutoCancellationCheck,
  onViewAutoCancelLogs,
  autoCancelLogsCount = 0
}) => {
  const [selectedClubForApplicants, setSelectedClubForApplicants] = useState<BookClub | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'recruiting' | 'closed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastSent, setBroadcastSent] = useState<string | null>(null);

  // Filter clubs owned by this host (or where hostName matches or hostUserId matches)
  const myClubs = clubs.filter((c) => {
    return (
      c.hostUserId === currentUser.id ||
      c.hostName.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      currentUser.role === 'admin'
    );
  });

  // Filtered by status & search
  const filteredClubs = myClubs.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      c.title.toLowerCase().includes(q) ||
      c.bookTitle.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterStatus === 'recruiting') {
      return c.status === 'open' || c.status === 'almost_full';
    }
    if (filterStatus === 'closed') {
      return c.status === 'closed' || c.status === 'cancelled';
    }
    return true;
  });

  // Helper: Get RSVPs for a specific club
  const getClubRSVPs = (clubId: string) => {
    return rsvps.filter((r) => r.clubId === clubId);
  };

  // Metrics
  const totalHostClubs = myClubs.length;
  const activeRecruitingClubs = myClubs.filter((c) => c.status === 'open' || c.status === 'almost_full').length;
  const myClubIds = new Set(myClubs.map((c) => c.id));
  const totalApplicants = rsvps.filter((r) => myClubIds.has(r.clubId) && r.status === 'confirmed').length;
  const confirmedClubsCount = myClubs.filter((c) => getClubRSVPs(c.id).filter((r) => r.status === 'confirmed').length >= 4).length;

  // Handle simulated email broadcast to applicants
  const handleSendBroadcast = (club: BookClub) => {
    const applicants = getClubRSVPs(club.id).filter((r) => r.status === 'confirmed');
    setBroadcastSent(
      `《${club.bookTitle}》 신청 회원 총 ${applicants.length}명에게 모임 안내 알림(이메일/SMS)이 성공적으로 발송되었습니다!`
    );
    setTimeout(() => {
      setBroadcastSent(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FBF9E9] text-[#191919] flex flex-col overflow-x-clip">
      {/* Top Header */}
      <header className="bg-[#191919] text-[#FBF9E9] sticky top-0 z-40 border-b border-[#191919]">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-[#FBF9E9]">
                리도라
              </span>
              <span className="font-display-en text-[10px] sm:text-xs text-[#FBF9E9]/60 font-bold tracking-widest uppercase hidden sm:inline">
                READORA
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#FFE57E] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs text-[#191919] font-extrabold truncate">
              <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#191919] shrink-0" />
              <span className="truncate">호스트 센터</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#FBF9E9]/70">
              <span>호스트:</span>
              <strong className="text-[#FBF9E9] font-bold">{currentUser.name}</strong>
              <span className="text-[#FBF9E9]/30">|</span>
              <span className="font-mono text-[#FFE57E]">@{currentUser.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <button
              onClick={onOpenCreateClub}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] px-2 sm:px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="새로운 독서 모임을 등록합니다"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>모임 개설</span>
            </button>

            {onOpenMyPage && (
              <button
                onClick={onOpenMyPage}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-white/10 hover:bg-white/20 text-[#FBF9E9] px-2 sm:px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-white/15 whitespace-nowrap"
                title="마이페이지 (개인정보 및 참여 모임 관리)"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#FFE57E] shrink-0" />
                <span className="hidden sm:inline">마이페이지</span>
              </button>
            )}

            <button
              onClick={onSwitchToUserView}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-white/10 hover:bg-white/20 text-[#FBF9E9] px-2 sm:px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-white/15 whitespace-nowrap"
              title="사용자 화면 둘러보기"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">사용자 화면 둘러보기</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-[#F16B47]/20 hover:bg-[#F16B47]/35 text-[#FBF9E9] px-2 sm:px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-[#F16B47]/40 whitespace-nowrap"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Broadcast Alert Toast */}
      {broadcastSent && (
        <div className="bg-[#191919] text-[#FFE57E] border-b border-[#FFE57E]/30 px-4 py-3 text-center text-xs font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{broadcastSent}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full space-y-4 sm:space-y-6">
        {/* Welcome & Stats Row */}
        <div className="bg-[#FFFDF4] p-4 sm:p-6 rounded-2xl border border-[#191919]/15 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFE57E] text-[#191919] text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>호스트 전용 대시보드</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-[#191919]">
              {currentUser.name} 호스트님, 환영합니다!
            </h2>
            <p className="text-xs text-[#191919]/70 leading-relaxed max-w-xl text-pretty">
              개설하신 모임의 실시간 신청자 명단 조회, 모임 내용 수정 및 취소 관리가 가능합니다. 모임 신청이 4명 이상 접수되면 모임 진행이 자동으로 확정됩니다.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0">
            <div className="p-3 sm:p-3.5 bg-[#FBF9E9] rounded-xl border border-[#191919]/15 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#191919]/65">내 개설 모임</span>
              <div className="text-lg sm:text-xl font-extrabold text-[#191919] mt-0.5 tabular-nums">{totalHostClubs}개</div>
            </div>

            <div className="p-3 sm:p-3.5 bg-[#B9D8E6]/35 rounded-xl border border-[#191919]/15 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#191919]/80">모집 중</span>
              <div className="text-lg sm:text-xl font-extrabold text-[#191919] mt-0.5 tabular-nums">{activeRecruitingClubs}개</div>
            </div>

            <div className="p-3 sm:p-3.5 bg-[#FFE57E]/45 rounded-xl border border-[#191919]/15 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#191919]/80">총 신청자 수</span>
              <div className="text-lg sm:text-xl font-extrabold text-[#F16B47] mt-0.5 tabular-nums">{totalApplicants}명</div>
            </div>

            <div className="p-3 sm:p-3.5 bg-[#FBF9E9] rounded-xl border border-[#191919]/15 text-center">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#191919]/65">4명 확정 모임</span>
              <div className="text-lg sm:text-xl font-extrabold text-[#191919] mt-0.5 tabular-nums">{confirmedClubsCount}개</div>
            </div>
          </div>
        </div>

        {/* 24-Hour Auto Cancellation Rule & System Alert Banner */}
        <div className="bg-[#FFE57E]/25 border border-[#191919]/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#191919] text-[#FFE57E] flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-[#191919]">
                  모임 시작 24시간 전 최소 인원(4명) 자동 취소 시스템 가동 중
                </span>
                <span className="text-[10px] bg-[#191919] text-[#FFE57E] font-extrabold px-2 py-0.5 rounded-md">
                  실시간 연동
                </span>
              </div>
              <p className="text-xs text-[#191919]/75 mt-1 leading-relaxed">
                모든 모임은 시작 <strong>24시간 전까지 최소 4명</strong>이 모집되지 않으면 자동으로 취소 처리됩니다. 
                취소 시 호스트와 신청 멤버 전원에게 <strong>취소 안내 알림 및 메일이 자동 발송</strong>되며 참가비는 100% 전액 환불됩니다.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full md:w-auto">
            {onViewAutoCancelLogs && (
              <button
                onClick={onViewAutoCancelLogs}
                className="flex-1 md:flex-none px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#FFFDF4] hover:bg-[#FBF9E9] border border-[#191919]/20 text-[#191919] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 tabular-nums whitespace-nowrap"
                title="발송된 취소 안내 메일 및 SMS 내역 조회"
              >
                <Bell className="w-3.5 h-3.5 text-[#191919]/65 shrink-0" />
                <span>취소 알림/메일 내역 ({autoCancelLogsCount}건)</span>
              </button>
            )}

            {onTriggerAutoCancellationCheck && (
              <button
                onClick={onTriggerAutoCancellationCheck}
                className="flex-1 md:flex-none px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FFE57E] text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                title="현재 시점 기준으로 24시간 이내 최소 인원 미달 모임을 즉시 점검하고 자동 취소 처리합니다"
              >
                <span>24시간 자동 취소 즉시 점검</span>
              </button>
            )}
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-[#FFFDF4] p-4 sm:p-5 rounded-2xl border border-[#191919]/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer tabular-nums ${
                filterStatus === 'all'
                  ? 'bg-[#191919] text-[#FFE57E]'
                  : 'bg-[#FBF9E9] text-[#191919]/75 border border-[#191919]/15 hover:border-[#191919]/40'
              }`}
            >
              전체 모임 ({myClubs.length})
            </button>

            <button
              onClick={() => setFilterStatus('recruiting')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer tabular-nums ${
                filterStatus === 'recruiting'
                  ? 'bg-[#F16B47] text-white'
                  : 'bg-[#FBF9E9] text-[#191919]/75 border border-[#191919]/15 hover:border-[#191919]/40'
              }`}
            >
              모집 중 ({activeRecruitingClubs})
            </button>

            <button
              onClick={() => setFilterStatus('closed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                filterStatus === 'closed'
                  ? 'bg-[#191919] text-[#FBF9E9]'
                  : 'bg-[#FBF9E9] text-[#191919]/75 border border-[#191919]/15 hover:border-[#191919]/40'
              }`}
            >
              마감/종료
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="도서명 또는 모임 검색..."
              className="w-full sm:w-56 px-3.5 py-2 rounded-lg border border-[#191919]/20 text-xs text-[#191919] focus:outline-none focus:border-[#191919] bg-[#FBF9E9]"
            />
          </div>
        </div>

        {/* Clubs List */}
        {filteredClubs.length === 0 ? (
          <div className="bg-[#FFFDF4] rounded-2xl p-12 text-center border border-[#191919]/15">
            <BookOpen className="w-12 h-12 text-[#191919]/25 mx-auto mb-3" />
            <h3 className="text-base font-extrabold text-[#191919]">관리할 모임이 없습니다</h3>
            <p className="text-xs text-[#191919]/65 mt-1 mb-4">
              새로운 독서 모임을 개설하여 캘거리 이웃들과 함께 책을 읽어보세요.
            </p>
            <button
              onClick={onOpenCreateClub}
              className="px-5 py-2.5 rounded-xl bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 text-xs font-extrabold transition-colors cursor-pointer"
            >
              새 모임 개설하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredClubs.map((club) => {
              const clubApplicants = getClubRSVPs(club.id);
              const activeApplicants = clubApplicants.filter((r) => r.status === 'confirmed');
              const isConfirmed = activeApplicants.length >= 4;
              const isCancelled = club.status === 'cancelled';

              return (
                <div
                  key={club.id}
                  className={`bg-[#FFFDF4] rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors ${
                    isCancelled ? 'border-[#F16B47]/40 opacity-85' : 'border-[#191919]/15 hover:border-[#191919]/40'
                  }`}
                >
                  <div>
                    {/* Club Header Info */}
                    <div className="p-4 sm:p-5 flex gap-3 sm:gap-4 border-b border-[#191919]/10">
                      <img
                        src={club.coverImage}
                        alt={club.bookTitle}
                        referrerPolicy="no-referrer"
                        className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg border border-[#191919]/15 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onSelectClubDetail(club)}
                        title="클릭하여 모임 상세 정보 보기"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FBF9E9] text-[#191919] border border-[#191919]/15">
                            {club.category}
                          </span>

                          {/* Status Badge */}
                          {isCancelled ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F16B47]/15 text-[#F16B47]">
                              모임 취소됨
                            </span>
                          ) : club.status === 'open' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#B9D8E6] text-[#191919]">
                              모집중 (Open)
                            </span>
                          ) : club.status === 'almost_full' ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FFE57E] text-[#191919]">
                              마감임박
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#191919] text-[#FBF9E9]">
                              마감 (Closed)
                            </span>
                          )}

                          <span className="text-[11px] text-[#191919]/55 font-mono tabular-nums">
                            CAD ${club.feeCAD}
                          </span>
                        </div>

                        <h3 
                          onClick={() => onSelectClubDetail(club)}
                          className="font-extrabold text-sm sm:text-base text-[#191919] truncate cursor-pointer hover:text-[#F16B47] transition-colors"
                          title="클릭하여 모임 상세 정보 보기"
                        >
                          {club.bookTitle}
                        </h3>
                        <p className="text-xs text-[#191919]/65 mb-2 truncate">
                          {club.title}
                        </p>

                        <div className="text-[11px] text-[#191919]/75 space-y-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Calendar className="w-3.5 h-3.5 text-[#F16B47] shrink-0" />
                            <span className="tabular-nums truncate">{club.dateTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-[#191919]/45 shrink-0" />
                            <span className="truncate">{club.venueName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Minimum 4 people & Topic Status Bar */}
                    <div className="px-3.5 sm:px-4 py-2.5 bg-[#FBF9E9] border-b border-[#191919]/10 flex items-center justify-between text-xs flex-wrap gap-2">
                      {isCancelled ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-[#F16B47] font-extrabold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            취소된 모임 (전액 환불 완료)
                          </span>
                          {club.cancelReason && (
                            <span className="text-[11px] text-[#F16B47] font-normal">
                              사유: {club.cancelReason}
                            </span>
                          )}
                        </div>
                      ) : isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-[#191919] bg-[#B9D8E6]/60 px-2.5 py-1 rounded-md tabular-nums leading-snug">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#191919] shrink-0" />
                          <span>진행 확정 (신청 {activeApplicants.length}명 · 최소 4명 충족)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#191919] bg-[#FFE57E]/60 px-2.5 py-1 rounded-md tabular-nums leading-snug">
                          <Clock className="w-3.5 h-3.5 text-[#191919] shrink-0" />
                          <span>최소 인원(4명) 모집 중 (현재 {activeApplicants.length}명 신청)</span>
                        </span>
                      )}

                      <span className="text-[11px] text-[#191919]/65 font-semibold">
                        발제 질문: {club.shareDiscussionTopics !== false ? '사전 공개됨' : '현장 공개'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar for Host */}
                  <div className="p-4 bg-[#FFFDF4] flex flex-wrap items-center justify-between gap-2.5">
                    {/* View Applicants Button */}
                    <button
                      onClick={() => setSelectedClubForApplicants(club)}
                      className="px-3.5 py-2 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FFE57E] text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5 tabular-nums"
                    >
                      <Users className="w-3.5 h-3.5 text-[#FFE57E]" />
                      <span>신청자 명단 조회 ({activeApplicants.length}명)</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* View Detail Button */}
                      <button
                        onClick={() => onSelectClubDetail(club)}
                        className="px-3 py-2 rounded-lg bg-[#FBF9E9] hover:bg-[#191919]/10 text-[#191919] border border-[#191919]/15 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="모임 상세 페이지 보기"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#191919]/65" />
                        <span className="hidden sm:inline">상세보기</span>
                      </button>

                      {/* Edit Club Button */}
                      <button
                        onClick={() => onEditClub(club)}
                        className="px-3 py-2 rounded-lg bg-[#FFE57E]/50 hover:bg-[#FFE57E] text-[#191919] border border-[#191919]/15 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                        title="모임 내용 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>

                      {/* Cancel Club Button */}
                      {!isCancelled && (
                        <button
                          onClick={() => onRequestCancelClub(club)}
                          className="px-3 py-2 rounded-lg bg-[#F16B47]/15 hover:bg-[#F16B47]/25 text-[#F16B47] text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                          title="모임 취소 및 회원 환불"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>취소</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* APPLICANTS ROSTER MODAL */}
      {selectedClubForApplicants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#191919]/65 backdrop-blur-xs">
          <div 
            className="bg-[#FBF9E9] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#191919]/20 overflow-hidden max-h-[94dvh] sm:max-h-[90vh] flex flex-col min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-[#191919] text-[#FBF9E9] relative border-b border-[#191919] shrink-0">
              <button
                onClick={() => setSelectedClubForApplicants(null)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#FBF9E9]/70 hover:text-[#FBF9E9] p-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-3 sm:gap-4 pr-9">
                <img
                  src={selectedClubForApplicants.coverImage}
                  alt={selectedClubForApplicants.bookTitle}
                  referrerPolicy="no-referrer"
                  className="w-14 h-20 sm:w-16 sm:h-22 object-cover rounded-lg border border-white/20 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FFE57E] text-[#191919]">
                      {selectedClubForApplicants.category}
                    </span>
                    <span className="text-[11px] sm:text-xs text-[#FBF9E9]/75">
                      상태: {selectedClubForApplicants.status === 'open' ? '모집중' : selectedClubForApplicants.status === 'almost_full' ? '마감임박' : selectedClubForApplicants.status === 'cancelled' ? '모임 취소' : '마감'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-[#FBF9E9] break-words leading-snug">
                    {selectedClubForApplicants.bookTitle} 신청 회원 명단
                  </h3>
                  <p className="text-xs text-[#FBF9E9]/75 mt-0.5 break-words">{selectedClubForApplicants.title}</p>
                  <p className="text-[11px] text-[#FBF9E9]/60 mt-1 tabular-nums break-words">
                    {selectedClubForApplicants.dateTime} · {selectedClubForApplicants.venueName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-4">
              {/* Notification & Threshold Status */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[#191919]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF4]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[#191919]">진행 알림 시스템:</span>
                    {getClubRSVPs(selectedClubForApplicants.id).filter((r) => r.status === 'confirmed').length >= 4 ? (
                      <span className="text-[11px] sm:text-xs font-extrabold text-[#191919] bg-[#B9D8E6] px-2.5 py-0.5 rounded-md">
                        최소 인원(4명) 충족 · 진행 확정 알림 발송 완료
                      </span>
                    ) : (
                      <span className="text-[11px] sm:text-xs font-extrabold text-[#191919] bg-[#FFE57E] px-2.5 py-0.5 rounded-md">
                        최소 인원(4명) 모집 중 · 충족 시 자동 알림 발송
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#191919]/70 mt-1 leading-relaxed">
                    모임 시작 전 최소 4명이 충족되면 신청자 전원에게 알림이 전송됩니다. 미달로 인한 취소 시 비용은 100% 전액 환불됩니다.
                  </p>
                </div>

                <button
                  onClick={() => handleSendBroadcast(selectedClubForApplicants)}
                  className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-lg bg-[#F16B47] hover:bg-[#d95734] text-white text-xs font-extrabold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>신청자 전체 공지 발송</span>
                </button>
              </div>

              {/* Applicants List */}
              {getClubRSVPs(selectedClubForApplicants.id).length === 0 ? (
                <div className="text-center py-12 bg-[#FFFDF4] rounded-xl border border-[#191919]/15">
                  <p className="text-xs text-[#191919]/60 font-semibold">아직 접수된 신청자가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getClubRSVPs(selectedClubForApplicants.id).map((r, index) => (
                    <div
                      key={r.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-[#191919]/15 bg-[#FFFDF4] flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#191919] text-[#FFE57E] text-[11px] font-extrabold flex items-center justify-center tabular-nums shrink-0">
                            {index + 1}
                          </span>
                          <span className="font-extrabold text-sm text-[#191919]">{r.participantName}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            r.status === 'confirmed'
                              ? 'bg-[#B9D8E6] text-[#191919]'
                              : 'bg-[#F16B47]/15 text-[#F16B47]'
                          }`}>
                            {r.status === 'confirmed' ? '결제 완료 (참여 확정)' : '신청 취소'}
                          </span>
                        </div>

                        <div className="text-xs text-[#191919]/70 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1 pt-1">
                          <span className="flex items-center gap-1 min-w-0 break-all">
                            <Mail className="w-3.5 h-3.5 text-[#191919]/45 shrink-0" />
                            <a href={`mailto:${r.email}`} className="font-mono text-[#F16B47] font-bold hover:underline break-all">
                              {r.email}
                            </a>
                          </span>

                          <span className="flex items-center gap-1 shrink-0">
                            <Phone className="w-3.5 h-3.5 text-[#191919]/45 shrink-0" />
                            <a href={`tel:${r.phone}`} className="font-mono text-[#191919] font-semibold hover:underline">
                              {r.phone}
                            </a>
                          </span>

                          <span className="flex items-center gap-1 text-[#191919]/60 tabular-nums shrink-0">
                            <Clock className="w-3.5 h-3.5 text-[#191919]/45 shrink-0" />
                            <span>신청일: {r.registeredAt}</span>
                          </span>
                        </div>

                        {r.userNotes && (
                          <div className="mt-1 p-2.5 bg-[#FBF9E9] rounded-lg text-[11px] text-[#191919]/80 border border-[#191919]/15 break-words">
                            <strong className="text-[#191919]">독서 메모: </strong>
                            {r.userNotes}
                          </div>
                        )}
                      </div>

                      <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#191919]/10">
                        <div className="text-xs font-extrabold text-[#191919] flex items-center md:justify-end gap-1 tabular-nums">
                          <CreditCard className="w-3.5 h-3.5 text-[#F16B47] shrink-0" />
                          <span>CAD ${r.paymentAmountCAD || 15}</span>
                        </div>
                        <span className="text-[10px] text-[#191919]/55">
                          {r.paymentMethod || 'Interac e-Transfer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FFFDF4] border-t border-[#191919]/15 flex justify-between items-center">
              <span className="text-xs text-[#191919]/65 font-medium tabular-nums">
                총 {getClubRSVPs(selectedClubForApplicants.id).length}명의 신청자가 기록되었습니다.
              </span>
              <button
                onClick={() => setSelectedClubForApplicants(null)}
                className="px-5 py-2 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FBF9E9] text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
