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
    <div className="min-h-screen bg-[#F0EBE0] text-[#19221C] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#172E22] text-white sticky top-0 z-40 border-b border-[#2D4536] shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="font-[Arial,sans-serif] text-xl sm:text-2xl font-bold tracking-tight text-white">
                리도라
              </span>
              <span className="text-[10px] sm:text-xs text-stone-300 font-medium hidden sm:inline">Readora</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#DF612D] px-2.5 py-1 rounded-full text-[11px] sm:text-xs text-white font-bold shadow-xs truncate">
              <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">호스트 센터</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-300">
              <span>호스트:</span>
              <strong className="text-white font-medium">{currentUser.name}</strong>
              <span className="text-white/40">|</span>
              <span className="font-mono text-stone-300">@{currentUser.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenCreateClub}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-[#DF612D] hover:bg-[#c95221] text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer shadow-sm"
              title="새로운 독서 모임을 등록합니다"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>모임 개설</span>
            </button>

            {onOpenMyPage && (
              <button
                onClick={onOpenMyPage}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer border border-white/15"
                title="마이페이지 (개인정보 및 참여 모임 관리)"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">마이페이지</span>
              </button>
            )}

            <button
              onClick={onSwitchToUserView}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer border border-white/15"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">사용자 화면 둘러보기</span>
              <span className="sm:hidden">일반화면</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-200 px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer border border-red-500/30"
              title="로그아웃"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Broadcast Alert Toast */}
      {broadcastSent && (
        <div className="bg-emerald-600 text-white px-4 py-3 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{broadcastSent}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full space-y-4 sm:space-y-6">
        {/* Welcome & Stats Row */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#E0D8C8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#DF612D] text-xs font-bold border border-orange-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>호스트 전용 대시보드</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-[#19221C]">
              {currentUser.name} 호스트님, 환영합니다!
            </h2>
            <p className="text-xs text-stone-500 leading-relaxed max-w-xl text-pretty">
              개설하신 모임의 실시간 신청자 명단 조회, 모임 내용 수정 및 취소 관리가 가능합니다. 모임 신청이 4명 이상 접수되면 모임 진행이 자동으로 확정됩니다.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0">
            <div className="p-3 sm:p-3.5 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-200 text-center">
              <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500">내 개설 모임</span>
              <div className="text-lg sm:text-xl font-bold text-[#19221C] mt-0.5">{totalHostClubs}개</div>
            </div>

            <div className="p-3 sm:p-3.5 bg-emerald-50 rounded-xl sm:rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800">모집 중</span>
              <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-0.5">{activeRecruitingClubs}개</div>
            </div>

            <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-200 text-center">
              <span className="text-[11px] font-semibold text-orange-800">총 신청자 수</span>
              <div className="text-xl font-bold text-[#DF612D] mt-0.5">{totalApplicants}명</div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-center">
              <span className="text-[11px] font-semibold text-blue-800">4명 확정 모임</span>
              <div className="text-xl font-bold text-blue-700 mt-0.5">{confirmedClubsCount}개</div>
            </div>
          </div>
        </div>

        {/* 24-Hour Auto Cancellation Rule & System Alert Banner */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-stone-900">
                  모임 시작 24시간 전 최소 인원(4명) 자동 취소 시스템 가동 중
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  실시간 연동
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                모든 모임은 시작 <strong>24시간 전까지 최소 4명</strong>이 모집되지 않으면 자동으로 취소 처리됩니다. 
                취소 시 호스트와 신청 멤버 전원에게 <strong>취소 안내 알림 및 메일이 자동 발송</strong>되며 참가비는 100% 전액 환불됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            {onViewAutoCancelLogs && (
              <button
                onClick={onViewAutoCancelLogs}
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                title="발송된 취소 안내 메일 및 SMS 내역 조회"
              >
                <Bell className="w-3.5 h-3.5 text-stone-500" />
                <span>취소 알림/메일 내역 ({autoCancelLogsCount}건)</span>
              </button>
            )}

            {onTriggerAutoCancellationCheck && (
              <button
                onClick={onTriggerAutoCancellationCheck}
                className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                title="현재 시점 기준으로 24시간 이내 최소 인원 미달 모임을 즉시 점검하고 자동 취소 처리합니다"
              >
                <span>⚡ 24시간 자동 취소 즉시 점검</span>
              </button>
            )}
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E0D8C8] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#172E22] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              전체 모임 ({myClubs.length})
            </button>

            <button
              onClick={() => setFilterStatus('recruiting')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === 'recruiting'
                  ? 'bg-[#DF612D] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              모집 중 ({activeRecruitingClubs})
            </button>

            <button
              onClick={() => setFilterStatus('closed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === 'closed'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
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
              className="w-full sm:w-56 px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#DF612D] bg-[#FCFAF6]"
            />
          </div>
        </div>

        {/* Clubs List */}
        {filteredClubs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E0D8C8]">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-700">관리할 모임이 없습니다</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              새로운 독서 모임을 개설하여 캘거리 이웃들과 함께 책을 읽어보세요.
            </p>
            <button
              onClick={onOpenCreateClub}
              className="px-5 py-2.5 rounded-full bg-[#DF612D] text-white text-xs font-bold hover:bg-[#c95221] transition-colors cursor-pointer"
            >
              새 모임 개설하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClubs.map((club) => {
              const clubApplicants = getClubRSVPs(club.id);
              const activeApplicants = clubApplicants.filter((r) => r.status === 'confirmed');
              const isConfirmed = activeApplicants.length >= 4;
              const isCancelled = club.status === 'cancelled';

              return (
                <div
                  key={club.id}
                  className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                    isCancelled ? 'border-red-200 opacity-80' : 'border-[#E0D8C8] hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Club Header Info */}
                    <div className="p-5 flex gap-4 border-b border-stone-100">
                      <img
                        src={club.coverImage}
                        alt={club.bookTitle}
                        className="w-20 h-28 object-cover rounded-xl shadow-xs shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => onSelectClubDetail(club)}
                        title="클릭하여 모임 상세 정보 보기"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                            {club.category}
                          </span>

                          {/* Status Badge */}
                          {isCancelled ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              모임 취소됨
                            </span>
                          ) : club.status === 'open' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              모집중 (Open)
                            </span>
                          ) : club.status === 'almost_full' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                              마감임박
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-700">
                              마감 (Closed)
                            </span>
                          )}

                          <span className="text-[11px] text-stone-400 font-mono">
                            CAD ${club.feeCAD}
                          </span>
                        </div>

                        <h3 
                          onClick={() => onSelectClubDetail(club)}
                          className="font-bold text-base text-[#19221C] truncate cursor-pointer hover:text-[#DF612D] transition-colors"
                          title="클릭하여 모임 상세 정보 보기"
                        >
                          {club.bookTitle}
                        </h3>
                        <p className="text-xs text-stone-500 mb-2 truncate">
                          {club.title}
                        </p>

                        <div className="text-[11px] text-stone-600 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#DF612D]" />
                            <span>{club.dateTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            <span className="truncate">{club.venueName}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Minimum 4 people & Topic Status Bar */}
                    <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs flex-wrap gap-2">
                      {isCancelled ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-red-700 font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            취소된 모임 (전액 환불 완료)
                          </span>
                          {club.cancelReason && (
                            <span className="text-[11px] text-red-600 font-normal">
                              사유: {club.cancelReason}
                            </span>
                          )}
                        </div>
                      ) : isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          진행 확정 (신청 {activeApplicants.length}명 • 최소 4명 충족)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          최소 인원(4명) 모집 중 (현재 {activeApplicants.length}명 신청)
                        </span>
                      )}

                      <span className="text-[11px] text-stone-500 font-medium">
                        발제 질문: {club.shareDiscussionTopics !== false ? '✅ 사전 공개됨' : '🔒 현장 공개'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar for Host */}
                  <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-2.5 border-t border-stone-100">
                    {/* View Applicants Button */}
                    <button
                      onClick={() => setSelectedClubForApplicants(club)}
                      className="px-3.5 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>신청자 명단 조회 ({activeApplicants.length}명)</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* View Detail Button */}
                      <button
                        onClick={() => onSelectClubDetail(club)}
                        className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="모임 상세 페이지 보기"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span className="hidden sm:inline">상세보기</span>
                      </button>

                      {/* Edit Club Button */}
                      <button
                        onClick={() => onEditClub(club)}
                        className="px-3 py-2 rounded-xl bg-[#DF612D]/10 hover:bg-[#DF612D]/20 text-[#DF612D] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        title="모임 내용 수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>

                      {/* Cancel Club Button */}
                      {!isCancelled && (
                        <button
                          onClick={() => onRequestCancelClub(club)}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-[#172E22] text-white relative">
              <button
                onClick={() => setSelectedClubForApplicants(null)}
                className="absolute top-5 right-5 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <img
                  src={selectedClubForApplicants.coverImage}
                  alt={selectedClubForApplicants.bookTitle}
                  className="w-16 h-22 object-cover rounded-xl shadow-xs shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#DF612D] text-white">
                      {selectedClubForApplicants.category}
                    </span>
                    <span className="text-xs text-stone-300">
                      상태: {selectedClubForApplicants.status === 'open' ? '모집중' : selectedClubForApplicants.status === 'almost_full' ? '마감임박' : selectedClubForApplicants.status === 'cancelled' ? '모임 취소' : '마감'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold truncate">
                    {selectedClubForApplicants.bookTitle} 신청 회원 명단
                  </h3>
                  <p className="text-xs text-stone-300 mt-0.5">{selectedClubForApplicants.title}</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {selectedClubForApplicants.dateTime} · {selectedClubForApplicants.venueName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Notification & Threshold Status */}
              <div className="p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#19221C]">진행 알림 시스템:</span>
                    {getClubRSVPs(selectedClubForApplicants.id).filter((r) => r.status === 'confirmed').length >= 4 ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        ✅ 최소 인원(4명) 충족 • 진행 확정 알림 발송 완료
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        ⏳ 최소 인원(4명) 모집 중 • 충족 시 자동 알림 발송
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                    모임 시작 전 최소 4명이 충족되면 신청자 전원에게 알림이 전송됩니다. 미달로 인한 취소 시 비용은 100% 전액 환불됩니다.
                  </p>
                </div>

                <button
                  onClick={() => handleSendBroadcast(selectedClubForApplicants)}
                  className="px-3.5 py-2 rounded-xl bg-[#DF612D] hover:bg-[#c95221] text-white text-xs font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>신청자 전체 공지 발송</span>
                </button>
              </div>

              {/* Applicants List */}
              {getClubRSVPs(selectedClubForApplicants.id).length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                  <p className="text-xs text-stone-500">아직 접수된 신청자가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getClubRSVPs(selectedClubForApplicants.id).map((r, index) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#172E22] text-white text-[11px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="font-bold text-sm text-[#19221C]">{r.participantName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {r.status === 'confirmed' ? '결제 완료 (참여 확정)' : '신청 취소'}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-stone-400" />
                            <a href={`mailto:${r.email}`} className="font-mono text-[#DF612D] hover:underline">
                              {r.email}
                            </a>
                          </span>

                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <a href={`tel:${r.phone}`} className="font-mono text-stone-700 font-semibold hover:underline">
                              {r.phone}
                            </a>
                          </span>

                          <span className="flex items-center gap-1 text-stone-500">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>신청일: {r.registeredAt}</span>
                          </span>
                        </div>

                        {r.userNotes && (
                          <div className="mt-1 p-2 bg-stone-50 rounded-lg text-[11px] text-stone-700 border border-stone-200">
                            <strong className="text-stone-900">독서 메모: </strong>
                            {r.userNotes}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-700 flex items-center md:justify-end gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CAD ${r.paymentAmountCAD || 15}</span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {r.paymentMethod || 'Interac e-Transfer'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-between items-center">
              <span className="text-xs text-stone-500">
                총 {getClubRSVPs(selectedClubForApplicants.id).length}명의 신청자가 기록되었습니다.
              </span>
              <button
                onClick={() => setSelectedClubForApplicants(null)}
                className="px-5 py-2 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
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
