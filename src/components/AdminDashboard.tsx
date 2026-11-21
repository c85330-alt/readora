import React, { useState } from 'react';
import { User, BookClub, RSVPRecord } from '../types';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  LogOut, 
  PlusCircle, 
  MapPin, 
  X, 
  Eye, 
  Sparkles,
  Phone,
  Mail,
  CalendarDays,
  Trash2,
  Crown,
  CheckCircle2,
  CreditCard,
  Edit3,
  XCircle,
  AlertTriangle,
  Bell,
  BarChart3,
  TrendingUp,
  Activity,
  ArrowUpRight,
  PieChart,
  RefreshCw,
  Check,
  Sliders
} from 'lucide-react';

import { DailyPVRecord, getRealDailyPVRecords } from '../utils/analytics';
import { calculateAgeFromBirthDate, formatBirthDateKorean } from '../utils/birthDate';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchToUserView: () => void;
  users: User[];
  clubs: BookClub[];
  rsvps: RSVPRecord[];
  onUpdateClubStatus: (clubId: string, newStatus: 'open' | 'almost_full' | 'closed' | 'cancelled') => void;
  onUpdateRSVPStatus: (rsvpId: string, newStatus: 'confirmed' | 'cancelled') => void;
  onOpenCreateClub: () => void;
  onSelectClubDetail: (club: BookClub) => void;
  onEditClub?: (club: BookClub) => void;
  onRequestCancelClub?: (club: BookClub) => void;
  onDeleteClub?: (clubId: string) => void;
  onOpenMyPage?: () => void;
  onTriggerAutoCancellationCheck?: () => void;
  onViewAutoCancelLogs?: () => void;
  autoCancelLogsCount?: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onSwitchToUserView,
  users,
  clubs,
  rsvps,
  onUpdateClubStatus,
  onUpdateRSVPStatus,
  onOpenCreateClub,
  onSelectClubDetail,
  onEditClub,
  onRequestCancelClub,
  onDeleteClub,
  onOpenMyPage,
  onTriggerAutoCancellationCheck,
  onViewAutoCancelLogs,
  autoCancelLogsCount = 0
}) => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'members' | 'analytics'>('clubs');
  
  // Analytics state & Date selection
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'monthly'>('daily');
  const [livePVBoost, setLivePVBoost] = useState(0);
  const [dailyPVRecords, setDailyPVRecords] = useState<DailyPVRecord[]>(() => getRealDailyPVRecords());

  const initialEndDate = dailyPVRecords[dailyPVRecords.length - 1]?.date || new Date().toISOString().slice(0, 10);
  const initialStartDate = dailyPVRecords.length >= 7 
    ? dailyPVRecords[dailyPVRecords.length - 7].date 
    : (dailyPVRecords[0]?.date || initialEndDate);

  const [chartStartDate, setChartStartDate] = useState(initialStartDate);
  const [chartEndDate, setChartEndDate] = useState(initialEndDate);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  const handleRefreshAnalytics = () => {
    setDailyPVRecords(getRealDailyPVRecords());
  };

  // Filter records within chartStartDate and chartEndDate
  const filteredDailyRecords = dailyPVRecords.filter((r) => {
    return r.date >= chartStartDate && r.date <= chartEndDate;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const displayRecords = filteredDailyRecords.length > 0 ? filteredDailyRecords : dailyPVRecords;
  const totalFilteredPV = displayRecords.reduce((sum, r) => sum + r.pv, 0) + (displayRecords.some(r => r.isToday) ? livePVBoost : 0);
  const avgFilteredPV = Math.round(totalFilteredPV / Math.max(1, displayRecords.length));
  const maxFilteredPV = Math.max(1, ...displayRecords.map(r => r.pv + (r.isToday ? livePVBoost : 0)));
  const todayRecord = dailyPVRecords.find(r => r.isToday) || dailyPVRecords[dailyPVRecords.length - 1] || {
    date: new Date().toISOString().slice(0, 10),
    dateLabel: '오늘',
    fullDate: '오늘',
    pv: 1,
    uv: 1,
    detailViews: 0,
    pps: 1.0,
    isToday: true
  };
  const todayPVDisplay = todayRecord.pv + livePVBoost;

  // Real Monthly Aggregations
  const monthlyStats = React.useMemo(() => {
    const map = new Map<string, { pv: number; uv: number; detailViews: number }>();
    dailyPVRecords.forEach((r) => {
      const monthKey = r.date.slice(0, 7);
      const prev = map.get(monthKey) || { pv: 0, uv: 0, detailViews: 0 };
      map.set(monthKey, {
        pv: prev.pv + r.pv,
        uv: prev.uv + r.uv,
        detailViews: prev.detailViews + r.detailViews
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([mKey, data]) => {
        const [y, m] = mKey.split('-');
        const isCurrentMonth = mKey === new Date().toISOString().slice(0, 7);
        const pps = Number((data.pv / Math.max(1, data.uv)).toFixed(1));
        return {
          date: `${y}년 ${parseInt(m, 10)}월${isCurrentMonth ? ' (실시간 집계)' : ''}`,
          pv: data.pv + (isCurrentMonth ? livePVBoost : 0),
          uv: data.uv,
          detailViews: data.detailViews,
          pps,
          growth: '실시간 집계',
          isUp: true
        };
      });
  }, [dailyPVRecords, livePVBoost]);

  const currentMonthRecord = monthlyStats[0] || { pv: todayPVDisplay, uv: todayRecord.uv };
  const currentMonthPV = currentMonthRecord.pv;
  const currentMonthUV = currentMonthRecord.uv;
  const totalDetailViews = displayRecords.reduce((sum, r) => sum + r.detailViews, 0);

  // Member Search & Filter
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<User | null>(null);

  // Club Search & Filter
  const [clubSearch, setClubSearch] = useState('');
  const [clubHostFilter, setClubHostFilter] = useState<'all' | 'admin_host'>('all');
  const [selectedClubForApplicants, setSelectedClubForApplicants] = useState<BookClub | null>(null);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);
  const [confirmDeleteClubId, setConfirmDeleteClubId] = useState<string | null>(null);

  // Filtered Members
  const filteredUsers = users.filter((u) => {
    const q = memberSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  // Filtered Clubs
  const filteredClubs = clubs.filter((c) => {
    const q = clubSearch.toLowerCase();
    const matchesQuery = 
      c.title.toLowerCase().includes(q) ||
      c.bookTitle.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.hostName.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (clubHostFilter === 'admin_host') {
      return c.isOfficialHost || c.hostName.includes('운영팀') || c.hostName.includes('관리자') || c.hostName.includes('총괄');
    }

    return true;
  });

  // Helper: Get RSVPs for a specific member
  const getMemberRSVPs = (user: User) => {
    return rsvps.filter(
      (r) =>
        r.userId === user.id ||
        r.email.toLowerCase() === user.email.toLowerCase() ||
        r.participantName === user.name
    );
  };

  // Helper: Get RSVPs for a specific club
  const getClubRSVPs = (clubId: string) => {
    return rsvps.filter((r) => r.clubId === clubId);
  };

  // Metrics
  const totalMembers = users.length;
  const totalClubs = clubs.length;
  const adminClubsCount = clubs.filter(
    (c) => c.isOfficialHost || c.hostName.includes('운영팀') || c.hostName.includes('관리자') || c.hostName.includes('총괄')
  ).length;
  const totalRSVPs = rsvps.length;
  const activeRSVPs = rsvps.filter((r) => r.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-[#FBF9E9] text-[#191919] flex flex-col overflow-x-clip">
      {/* Top Admin Navigation Header */}
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
              <span className="truncate">관리자 포털</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <button
              onClick={onOpenCreateClub}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-extrabold bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] px-2 sm:px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="관리자가 직접 호스트로서 새 모임을 등록합니다"
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
                <Users className="w-3.5 h-3.5 text-[#FFE57E] shrink-0" />
                <span className="hidden sm:inline">마이페이지</span>
              </button>
            )}

            <button
              onClick={onSwitchToUserView}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-white/10 hover:bg-white/20 text-[#FBF9E9] px-2 sm:px-3.5 py-2 rounded-lg transition-colors cursor-pointer border border-white/15 whitespace-nowrap"
              title="사용자 화면으로 전환"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">사용자 화면</span>
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

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex gap-2 sm:gap-4 border-t border-white/15 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`py-2.5 sm:py-3.5 px-2.5 sm:px-3 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 tabular-nums ${
              activeTab === 'clubs'
                ? 'border-[#FFE57E] text-[#FFE57E]'
                : 'border-transparent text-[#FBF9E9]/60 hover:text-[#FBF9E9]'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>모임 개설 및 관리 ({clubs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`py-2.5 sm:py-3.5 px-2.5 sm:px-3 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 tabular-nums ${
              activeTab === 'members'
                ? 'border-[#FFE57E] text-[#FFE57E]'
                : 'border-transparent text-[#FBF9E9]/60 hover:text-[#FBF9E9]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>회원 계정 관리 ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 sm:py-3.5 px-2.5 sm:px-3 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'border-[#FFE57E] text-[#FFE57E]'
                : 'border-transparent text-[#FBF9E9]/60 hover:text-[#FBF9E9]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>페이지뷰 분석 & 통계</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full space-y-4 sm:space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          <div className="bg-[#FFFDF4] p-3.5 sm:p-5 rounded-2xl border border-[#191919]/15">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-[#191919]/65">호스트 운영 모임</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FFE57E] text-[#191919] flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#191919] tabular-nums">{adminClubsCount}개</div>
            <p className="text-[10px] sm:text-[11px] text-[#191919]/55 mt-0.5 sm:mt-1">관리자/호스트 클럽</p>
          </div>

          <div className="bg-[#FFFDF4] p-3.5 sm:p-5 rounded-2xl border border-[#191919]/15">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-[#191919]/65">전체 독서모임</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#B9D8E6] text-[#191919] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#191919] tabular-nums">{totalClubs}개</div>
            <p className="text-[10px] sm:text-[11px] text-[#191919]/55 mt-0.5 sm:mt-1">캘거리 전역 모임</p>
          </div>

          <div className="bg-[#FFFDF4] p-3.5 sm:p-5 rounded-2xl border border-[#191919]/15">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-[#191919]/65">신청 & 결제 접수</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#F16B47]/15 text-[#F16B47] flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#191919] tabular-nums">{totalRSVPs}건</div>
            <p className="text-[10px] sm:text-[11px] text-[#F16B47] font-bold mt-0.5 sm:mt-1 tabular-nums">확정 신청 {activeRSVPs}건</p>
          </div>

          <div className="bg-[#FFFDF4] p-3.5 sm:p-5 rounded-2xl border border-[#191919]/15">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-[#191919]/65">가입 회원 수</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#191919] text-[#FBF9E9] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#191919] tabular-nums">{totalMembers}명</div>
            <p className="text-[10px] sm:text-[11px] text-[#191919]/55 mt-0.5 sm:mt-1">이메일 인증 회원</p>
          </div>

          <div 
            onClick={() => setActiveTab('analytics')}
            className={`p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'analytics'
                ? 'bg-[#191919] text-[#FBF9E9] border-[#191919]'
                : 'bg-[#FFFDF4] border-[#191919]/15 hover:border-[#191919]/45'
            }`}
            title="클릭 시 페이지뷰 분석 및 트래픽 통계로 이동"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className={`text-[11px] sm:text-xs font-bold ${activeTab === 'analytics' ? 'text-[#FFE57E]' : 'text-[#191919]/65'}`}>
                당일 페이지뷰 (오늘)
              </span>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                activeTab === 'analytics' ? 'bg-[#FFE57E] text-[#191919]' : 'bg-[#FBF9E9] text-[#191919] border border-[#191919]/15'
              }`}>
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className={`text-2xl font-extrabold tabular-nums ${activeTab === 'analytics' ? 'text-[#FBF9E9]' : 'text-[#191919]'}`}>
              {todayPVDisplay.toLocaleString()}회
            </div>
            <p className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${
              activeTab === 'analytics' ? 'text-[#B9D8E6]' : 'text-[#F16B47]'
            }`}>
              <TrendingUp className="w-3 h-3" />
              <span>전일 대비 +8.4% 상승</span>
            </p>
          </div>
        </div>

        {/* TAB 1: CLUBS & APPLICANTS MANAGEMENT (Admin as Host) */}
        {activeTab === 'clubs' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#191919] flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[#F16B47]" />
                  <span>호스트 모임 개설 및 신청자 관리</span>
                </h2>
                <p className="text-xs text-[#191919]/65 mt-0.5">
                  관리자가 직접 호스트로서 모임을 개설하고, 모임의 상태(모집중/마감임박/마감) 및 신청자 명단을 관리합니다.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                {/* Host Filter Toggle */}
                <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-[#FBF9E9] p-1 rounded-lg border border-[#191919]/15 text-xs">
                  <button
                    onClick={() => setClubHostFilter('all')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer tabular-nums text-center whitespace-nowrap ${
                      clubHostFilter === 'all'
                        ? 'bg-[#191919] text-[#FFE57E]'
                        : 'text-[#191919]/65 hover:text-[#191919]'
                    }`}
                  >
                    전체 모임 ({clubs.length})
                  </button>
                  <button
                    onClick={() => setClubHostFilter('admin_host')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 tabular-nums whitespace-nowrap ${
                      clubHostFilter === 'admin_host'
                        ? 'bg-[#191919] text-[#FFE57E]'
                        : 'text-[#191919]/65 hover:text-[#191919]'
                    }`}
                  >
                    <Crown className="w-3 h-3 text-[#F16B47] shrink-0" />
                    <span>내 호스트 모임 ({adminClubsCount})</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-[#191919]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clubSearch}
                    onChange={(e) => setClubSearch(e.target.value)}
                    placeholder="도서명, 모임명 검색..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#191919]/20 text-xs text-[#191919] focus:outline-none focus:border-[#191919] bg-[#FBF9E9]"
                  />
                </div>

                {/* Create Club Button */}
                <button
                  onClick={onOpenCreateClub}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 rounded-lg text-xs font-extrabold cursor-pointer shrink-0 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>호스트로서 새 모임 개설</span>
                </button>
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
                      모임 24시간 전 최소 인원(4명) 자동 취소 및 환불 시스템 가동 중
                    </span>
                    <span className="text-[10px] bg-[#191919] text-[#FFE57E] font-extrabold px-2 py-0.5 rounded-md">
                      자동 연동
                    </span>
                  </div>
                  <p className="text-xs text-[#191919]/75 mt-1 leading-relaxed">
                    모임 시작 <strong>24시간 전까지 최소 4명</strong>이 모집되지 않은 모임은 자동으로 취소되며, 호스트 및 신청 회원 전원에게 <strong>취소 안내 알림 및 메일이 자동 발송</strong>되고 참가비는 100% 전액 환불됩니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full md:w-auto">
                {onViewAutoCancelLogs && (
                  <button
                    onClick={onViewAutoCancelLogs}
                    className="flex-1 md:flex-none px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#FFFDF4] hover:bg-[#FBF9E9] border border-[#191919]/20 text-[#191919] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 tabular-nums whitespace-nowrap"
                    title="자동 발송된 취소 안내 메일 및 SMS 내역 확인"
                  >
                    <Bell className="w-3.5 h-3.5 text-[#191919]/65 shrink-0" />
                    <span>취소 알림/메일 내역 ({autoCancelLogsCount}건)</span>
                  </button>
                )}

                {onTriggerAutoCancellationCheck && (
                  <button
                    onClick={onTriggerAutoCancellationCheck}
                    className="flex-1 md:flex-none px-3.5 py-2.5 sm:py-2 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FFE57E] text-xs font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                    title="현재 등록된 모임 중 24시간 이내 최소 4명 미달 모임을 즉시 점검하여 자동 취소 처리합니다"
                  >
                    <span>24시간 자동 취소 즉시 점검</span>
                  </button>
                )}
              </div>
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredClubs.map((club) => {
                const clubApplicants = getClubRSVPs(club.id);
                const isManagedByAdmin = 
                  club.isOfficialHost || 
                  club.hostName.includes('운영팀') || 
                  club.hostName.includes('관리자') || 
                  club.hostName.includes('총괄');
                const isCancelled = club.status === 'cancelled';

                return (
                  <div
                    key={club.id}
                    className={`bg-[#FFFDF4] rounded-2xl border overflow-hidden flex flex-col justify-between transition-colors ${
                      isCancelled ? 'border-[#F16B47]/40 opacity-85' : 'border-[#191919]/15 hover:border-[#191919]/40'
                    }`}
                  >
                    <div>
                      {/* Top Club Header - Clicking opens full club details */}
                      <div 
                        onClick={() => onSelectClubDetail(club)}
                        className="p-4 sm:p-5 flex gap-3 sm:gap-4 border-b border-[#191919]/10 cursor-pointer group hover:bg-[#FBF9E9]/70 transition-colors"
                        title="클릭하여 모임 상세 정보 보기"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={club.coverImage}
                            alt={club.bookTitle}
                            referrerPolicy="no-referrer"
                            className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg border border-[#191919]/15 group-hover:scale-102 transition-transform"
                          />
                          <div className="absolute inset-0 bg-[#191919]/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Eye className="w-5 h-5 text-[#FFE57E]" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FBF9E9] text-[#191919] border border-[#191919]/15">
                              {club.category}
                            </span>

                            {isManagedByAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#191919] bg-[#FFE57E] px-2 py-0.5 rounded-md">
                                <Crown className="w-3 h-3 text-[#191919] shrink-0" />
                                관리자 직영 호스트
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#191919]/65 font-semibold truncate">
                                호스트: {club.hostName}
                              </span>
                            )}

                            {isCancelled && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F16B47]/15 text-[#F16B47]">
                                취소된 모임
                              </span>
                            )}
                          </div>

                          <h3 className="font-extrabold text-sm sm:text-base text-[#191919] truncate group-hover:text-[#F16B47] transition-colors flex items-center gap-1.5">
                            <span className="truncate">{club.bookTitle}</span>
                            <Eye className="w-3.5 h-3.5 text-[#191919]/40 group-hover:text-[#F16B47] shrink-0" />
                          </h3>
                          <p className="text-xs text-[#191919]/65 mb-2 truncate">
                            {club.title}
                          </p>

                          <div className="text-[11px] text-[#191919]/75 space-y-0.5">
                            <div className="flex items-center gap-1 min-w-0">
                              <Calendar className="w-3 h-3 text-[#F16B47] shrink-0" />
                              <span className="tabular-nums truncate">{club.dateTime}</span>
                            </div>
                            <div className="flex items-center gap-1 min-w-0">
                              <MapPin className="w-3 h-3 text-[#191919]/45 shrink-0" />
                              <span className="truncate">{club.venueName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Management Bar (Only 모집중/마감임박/마감/취소 - No seat numbers) */}
                      <div className="p-3.5 sm:p-4 bg-[#FBF9E9] border-b border-[#191919]/10 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-xs font-bold text-[#191919]/75 shrink-0">모임 상태:</span>
                          <select
                            value={club.status}
                            onChange={(e) => onUpdateClubStatus(club.id, e.target.value as any)}
                            className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border font-extrabold cursor-pointer transition-colors min-w-0 max-w-full ${
                              club.status === 'open'
                                ? 'bg-[#B9D8E6] text-[#191919] border-[#191919]/25'
                                : club.status === 'almost_full'
                                ? 'bg-[#FFE57E] text-[#191919] border-[#191919]/25'
                                : club.status === 'cancelled'
                                ? 'bg-[#F16B47]/15 text-[#F16B47] border-[#F16B47]/35'
                                : 'bg-[#191919] text-[#FBF9E9] border-[#191919]'
                            }`}
                          >
                            <option value="open">모집중 (Open)</option>
                            <option value="almost_full">마감임박 (Almost Full)</option>
                            <option value="closed">마감 (Closed)</option>
                            <option value="cancelled">모임 취소 (Cancelled)</option>
                          </select>
                        </div>

                        {onDeleteClub && (
                          confirmDeleteClubId === club.id ? (
                            <div className="inline-flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteClub(club.id);
                                  setConfirmDeleteClubId(null);
                                }}
                                className="px-2.5 py-1 rounded-md bg-[#F16B47] hover:bg-[#d95734] text-white text-[11px] font-extrabold cursor-pointer transition-colors"
                              >
                                삭제 확인
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteClubId(null)}
                                className="px-2.5 py-1 rounded-md bg-[#FFFDF4] border border-[#191919]/20 text-[#191919] text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteClubId(club.id)}
                              className="p-1.5 text-[#191919]/45 hover:text-[#F16B47] rounded-lg hover:bg-[#F16B47]/10 transition-colors cursor-pointer shrink-0"
                              title="모임 삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>

                      {/* Minimum 4 people progress & discussion topic disclosure badge */}
                      <div className="px-3.5 sm:px-4 py-2.5 bg-[#FFFDF4] border-b border-[#191919]/10 flex items-center justify-between text-xs flex-wrap gap-2">
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
                        ) : club.currentSeats >= 4 ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold text-[#191919] bg-[#B9D8E6]/60 px-2.5 py-1 rounded-md leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#191919] shrink-0" />
                            <span>진행 확정 (최소 4명 충족 · 알림 발송 완료)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#191919] bg-[#FFE57E]/60 px-2.5 py-1 rounded-md leading-snug">
                            <Clock className="w-3.5 h-3.5 text-[#191919] shrink-0" />
                            <span>최소 4명 모집 중 (충족 시 신청자 자동 알림)</span>
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-[#191919]/65">
                          발제 질문: {club.shareDiscussionTopics !== false ? '사전 공개됨' : '당일 현장 공개'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action: View Detail, Edit, Cancel, and View Applicants */}
                    <div className="p-4 bg-[#FFFDF4] flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-[#191919]/75 tabular-nums">
                        {clubApplicants.length > 0 ? (
                          <span>
                            신청자 <strong className="text-[#F16B47] font-extrabold">{clubApplicants.length}명</strong> (결제 완료)
                          </span>
                        ) : (
                          <span className="text-[#191919]/45">접수된 신청 내역 없음</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Club Detail View Button */}
                        <button
                          onClick={() => onSelectClubDetail(club)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FBF9E9] hover:bg-[#191919]/10 text-[#191919] border border-[#191919]/15 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="모임 상세 내용 확인"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#191919]/65" />
                          <span>상세 내용</span>
                        </button>

                        {/* Edit Button */}
                        {onEditClub && (
                          <button
                            onClick={() => onEditClub(club)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#FFE57E]/50 hover:bg-[#FFE57E] text-[#191919] border border-[#191919]/15 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                            title="모임 내용 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>수정</span>
                          </button>
                        )}

                        {/* Cancel Button */}
                        {onRequestCancelClub && !isCancelled && (
                          <button
                            onClick={() => onRequestCancelClub(club)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#F16B47]/15 hover:bg-[#F16B47]/25 text-[#F16B47] text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                            title="모임 취소"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>취소</span>
                          </button>
                        )}

                        {/* Applicants Button */}
                        <button
                          onClick={() => setSelectedClubForApplicants(club)}
                          className="px-3 py-1.5 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FFE57E] text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1 tabular-nums"
                        >
                          <Users className="w-3.5 h-3.5 text-[#FFE57E]" />
                          <span>신청자 ({clubApplicants.length})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT (No calgaryYears, No status management) */}
        {activeTab === 'members' && (
          <div className="bg-[#FFFDF4] rounded-2xl border border-[#191919]/15 overflow-hidden">
            {/* Search and Action Bar */}
            <div className="p-5 sm:p-6 border-b border-[#191919]/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#191919]">회원 계정 및 참여 내역</h2>
                <p className="text-xs text-[#191919]/65 mt-0.5">
                  회원 이름, 아이디, 성별, 연령, 연락처, 가입 일자 및 과거 참여한 모임 목록을 실시간으로 확인합니다.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-[#191919]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="이름, 아이디, 이메일 검색..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#191919]/20 text-xs text-[#191919] focus:outline-none focus:border-[#191919] bg-[#FBF9E9]"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FBF9E9] border-b border-[#191919]/15 text-[#191919]/75 font-extrabold whitespace-nowrap">
                    <th className="py-3.5 px-4 sm:px-6">회원 정보 (이름/ID)</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">성별</th>
                    <th className="py-3.5 px-4 sm:px-6 text-center">연령</th>
                    <th className="py-3.5 px-4 sm:px-6">이메일 & 연락처</th>
                    <th className="py-3.5 px-4 sm:px-6">가입 일자</th>
                    <th className="py-3.5 px-4 sm:px-6">참여 모임 수</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">상세 참여 내역</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#191919]/10">
                  {filteredUsers.map((user) => {
                    const userRSVPs = getMemberRSVPs(user);
                    const isAdmin = user.role === 'admin';
                    const age = calculateAgeFromBirthDate(user.birthDate);

                    return (
                      <tr key={user.id} className="hover:bg-[#FBF9E9]/60 transition-colors whitespace-nowrap">
                        <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#FBF9E9] shrink-0 border border-[#191919]/20">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#191919] font-extrabold">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-extrabold text-[#191919] flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isAdmin && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#191919] text-[#FFE57E]">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#191919]/55 font-mono">@{user.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                            user.gender === '여성'
                              ? 'bg-[#FFE57E]/45 text-[#191919] border-[#191919]/20'
                              : user.gender === '남성'
                              ? 'bg-[#B9D8E6]/45 text-[#191919] border-[#191919]/20'
                              : 'bg-[#FBF9E9] text-[#191919]/60 border-[#191919]/15'
                          }`}>
                            {user.gender || '미입력'}
                          </span>
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-center">
                          {age !== null ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FBF9E9] text-[#191919] border border-[#191919]/20 tabular-nums">
                                만 {age}세
                              </span>
                              <span className="text-[10px] text-[#191919]/50 mt-0.5 tabular-nums">
                                {user.birthDate}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FBF9E9] text-[#191919]/50 border border-[#191919]/15">
                              미입력
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                          <div className="text-[#191919] font-mono text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#191919]/45 shrink-0" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && user.phone !== '미등록' && (
                            <div className="text-[#191919]/65 text-[11px] font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#191919]/45 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                          <div className="text-[#191919]/75 font-medium flex items-center gap-1 text-[11px] tabular-nums">
                            <CalendarDays className="w-3 h-3 text-[#191919]/45 shrink-0" />
                            <span>{user.createdAt}</span>
                          </div>
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6">
                          <span className={`px-2.5 py-1 rounded-md font-extrabold text-[11px] tabular-nums ${
                            userRSVPs.length > 0 
                              ? 'bg-[#B9D8E6] text-[#191919]' 
                              : 'bg-[#FBF9E9] text-[#191919]/50 border border-[#191919]/15'
                          }`}>
                            {userRSVPs.length}개 모임 참여
                          </span>
                        </td>

                        <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-right">
                          <button
                            onClick={() => setSelectedMemberForDetail(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FFE57E]/50 hover:bg-[#FFE57E] text-[#191919] border border-[#191919]/15 font-extrabold text-xs transition-colors cursor-pointer tabular-nums"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>참여 내역 ({userRSVPs.length})</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PAGEVIEW ANALYTICS & TRAFFIC DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Action Bar with Period Switcher */}
            <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#191919] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#F16B47]" />
                  <span>페이지뷰(PV) 분석 및 트래픽 현황</span>
                </h2>
                <p className="text-xs text-[#191919]/65 mt-0.5">
                  당일(오늘), 일간, 월간 누적 및 일평균 페이지뷰와 방문자 행동 흐름을 실시간으로 확인합니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center bg-[#FBF9E9] p-1 rounded-lg border border-[#191919]/15 text-xs">
                  <button
                    onClick={() => setAnalyticsPeriod('daily')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      analyticsPeriod === 'daily'
                        ? 'bg-[#191919] text-[#FFE57E]'
                        : 'text-[#191919]/65 hover:text-[#191919]'
                    }`}
                  >
                    일간 통계 (Daily)
                  </button>
                  <button
                    onClick={() => setAnalyticsPeriod('monthly')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md font-extrabold transition-colors cursor-pointer whitespace-nowrap ${
                      analyticsPeriod === 'monthly'
                        ? 'bg-[#191919] text-[#FFE57E]'
                        : 'text-[#191919]/65 hover:text-[#191919]'
                    }`}
                  >
                    월간 통계 (Monthly)
                  </button>
                </div>

                <button
                  onClick={handleRefreshAnalytics}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FBF9E9] hover:bg-[#191919]/10 text-[#191919] border border-[#191919]/20 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                  title="실시간 페이지뷰 갱신"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>실시간 새로고침</span>
                </button>
              </div>
            </div>

            {/* 4 Core Pageview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: 당일 페이지뷰 */}
              <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#191919]/65 uppercase tracking-wider">당일 페이지뷰 (오늘)</span>
                  <div className="w-9 h-9 rounded-lg bg-[#FFE57E] text-[#191919] flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#191919] tabular-nums">
                  {todayPVDisplay.toLocaleString()} <span className="text-base font-semibold text-[#191919]/60">회</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#191919]/10 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">오늘 순방문자(UV)</span>
                  <span className="font-extrabold text-[#191919] tabular-nums">{todayRecord.uv.toLocaleString()}명</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">모임 상세 조회</span>
                  <span className="text-[#191919] font-extrabold tabular-nums">
                    {todayRecord.detailViews.toLocaleString()}회
                  </span>
                </div>
              </div>

              {/* Metric 2: 선택 기간 총 페이지뷰 */}
              <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#191919]/65 uppercase tracking-wider">조회 기간 총 페이지뷰</span>
                  <div className="w-9 h-9 rounded-lg bg-[#B9D8E6] text-[#191919] flex items-center justify-center font-bold">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#191919] tabular-nums">
                  {totalFilteredPV.toLocaleString()} <span className="text-base font-semibold text-[#191919]/60">회</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#191919]/10 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">조회 일수</span>
                  <span className="font-extrabold text-[#191919] tabular-nums">{displayRecords.length}일간 집계</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">기간 최고 일간 PV</span>
                  <span className="font-extrabold text-[#F16B47] tabular-nums">{maxFilteredPV.toLocaleString()}회</span>
                </div>
              </div>

              {/* Metric 3: 조회 기간 일평균 페이지뷰 */}
              <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#191919]/65 uppercase tracking-wider">일평균 페이지뷰 (평균 PV)</span>
                  <div className="w-9 h-9 rounded-lg bg-[#191919] text-[#FBF9E9] flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#191919] tabular-nums">
                  {avgFilteredPV.toLocaleString()} <span className="text-base font-semibold text-[#191919]/60">회/일</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#191919]/10 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">세션당 페이지수 (PPS)</span>
                  <span className="font-extrabold text-[#F16B47] tabular-nums">{todayRecord.pps} 페이지</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">모임 상세 총 조회</span>
                  <span className="font-extrabold text-[#191919] tabular-nums">{totalDetailViews.toLocaleString()}회</span>
                </div>
              </div>

              {/* Metric 4: 월간 누적 페이지뷰 */}
              <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#191919]/65 uppercase tracking-wider">월간 페이지뷰 (이번 달 누적)</span>
                  <div className="w-9 h-9 rounded-lg bg-[#F16B47]/15 text-[#F16B47] flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#191919] tabular-nums">
                  {currentMonthPV.toLocaleString()} <span className="text-base font-semibold text-[#191919]/60">회</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#191919]/10 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">월간 누적 순방문자</span>
                  <span className="font-extrabold text-[#191919] tabular-nums">{currentMonthUV.toLocaleString()}명</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-[#191919]/60">실시간 데이터 수집</span>
                  <span className="text-[#191919] font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F16B47]" /> 정상 가동 중
                  </span>
                </div>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#191919]/10 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-[#191919] flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#F16B47]" />
                    <span>페이지뷰 조회 기간 선택</span>
                  </h3>
                  <p className="text-xs text-[#191919]/65 mt-0.5">
                    원하는 조회 기간을 선택하면 하단의 선 그래프와 상세 통계 테이블이 실시간으로 집계됩니다.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-[#191919]/60 font-bold mr-1">빠른 선택:</span>
                  {[
                    { label: '최근 7일', days: 7 },
                    { label: '최근 14일', days: 14 },
                    { label: '최근 30일', days: 30 },
                    { label: '이번 달', isCurrentMonth: true }
                  ].map((preset) => {
                    const getPresetRange = () => {
                      const endD = new Date();
                      if (preset.isCurrentMonth) {
                        const startD = new Date(endD.getFullYear(), endD.getMonth(), 1);
                        return { start: startD.toISOString().slice(0, 10), end: endD.toISOString().slice(0, 10) };
                      }
                      const startD = new Date();
                      startD.setDate(endD.getDate() - (preset.days || 7));
                      return { start: startD.toISOString().slice(0, 10), end: endD.toISOString().slice(0, 10) };
                    };
                    const range = getPresetRange();
                    const isActive = chartStartDate === range.start && chartEndDate === range.end;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setChartStartDate(range.start);
                          setChartEndDate(range.end);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg font-extrabold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#191919] text-[#FFE57E]'
                            : 'bg-[#FBF9E9] border border-[#191919]/15 text-[#191919]/75 hover:border-[#191919]/45'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Inputs + Summary Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-44">
                    <label className="block text-[11px] font-bold text-[#191919]/65 mb-1">시작일</label>
                    <input
                      type="date"
                      value={chartStartDate}
                      onChange={(e) => setChartStartDate(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-[#191919]/20 bg-[#FBF9E9] text-[#191919] focus:outline-none focus:border-[#191919]"
                    />
                  </div>
                  <span className="hidden sm:inline text-[#191919]/45 font-extrabold self-end pb-2">~</span>
                  <div className="w-full sm:w-44">
                    <label className="block text-[11px] font-bold text-[#191919]/65 mb-1">종료일</label>
                    <input
                      type="date"
                      value={chartEndDate}
                      onChange={(e) => setChartEndDate(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-[#191919]/20 bg-[#FBF9E9] text-[#191919] focus:outline-none focus:border-[#191919]"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-wrap items-center gap-3 text-xs bg-[#FBF9E9] px-4 py-2.5 rounded-xl border border-[#191919]/15 tabular-nums">
                  <span className="text-[#191919]/65">
                    조회 기간: <strong className="text-[#191919]">{displayRecords.length}일간</strong>
                  </span>
                  <span className="text-[#191919]/25">|</span>
                  <span className="text-[#191919]/65">
                    기간 합계: <strong className="text-[#191919]">{totalFilteredPV.toLocaleString()} PV</strong>
                  </span>
                  <span className="text-[#191919]/25">|</span>
                  <span className="text-[#191919]/65">
                    일평균: <strong className="text-[#F16B47]">{avgFilteredPV.toLocaleString()} PV/일</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Trend Chart (선 그래프: SVG Line Chart) */}
            <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#191919]/10 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-[#191919] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#F16B47]" />
                    <span>페이지뷰 추이 선 그래프 (Line Chart)</span>
                  </h3>
                  <p className="text-xs text-[#191919]/65 mt-0.5">
                    선택 기간({chartStartDate} ~ {chartEndDate}) 동안의 일간 페이지뷰 추이를 곡선 그래프로 제공합니다. 데이터 포인트에 마우스를 올리면 상세 정보를 확인할 수 있습니다.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#191919]/75 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#F16B47] inline-block" /> 일간 PV 추이선
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#191919]" /> 평일
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F16B47]" /> 주말
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFE57E] border border-[#191919]" /> 오늘 (당일)
                  </span>
                </div>
              </div>

              {/* High-Fidelity SVG Line Chart */}
              {(() => {
                const svgW = 840;
                const svgH = 260;
                const padL = 60;
                const padR = 40;
                const padT = 30;
                const padB = 40;
                const plotW = svgW - padL - padR;
                const plotH = svgH - padT - padB;

                const rawMax = Math.max(
                  ...displayRecords.map((r) => r.pv + (r.isToday ? livePVBoost : 0)),
                  5
                );
                const step = rawMax <= 20 ? 5 : rawMax <= 100 ? 20 : rawMax <= 500 ? 100 : 500;
                const yMax = Math.max(step * 2, Math.ceil(rawMax / step) * step);

                const points = displayRecords.map((r, i) => {
                  const effectivePV = r.pv + (r.isToday ? livePVBoost : 0);
                  const x =
                    displayRecords.length > 1
                      ? padL + (i / (displayRecords.length - 1)) * plotW
                      : padL + plotW / 2;
                  const y = padT + (1 - effectivePV / yMax) * plotH;
                  return { ...r, effectivePV, x, y, index: i };
                });

                // Generate smooth cubic Bezier curve path
                let linePath = '';
                if (points.length === 1) {
                  linePath = `M ${points[0].x - 30} ${points[0].y} L ${points[0].x + 30} ${points[0].y}`;
                } else if (points.length > 1) {
                  linePath = `M ${points[0].x} ${points[0].y}`;
                  for (let i = 0; i < points.length - 1; i++) {
                    const p0 = points[i];
                    const p1 = points[i + 1];
                    const cpX = (p0.x + p1.x) / 2;
                    linePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
                  }
                }

                const areaPath =
                  points.length > 1
                    ? `${linePath} L ${points[points.length - 1].x} ${padT + plotH} L ${points[0].x} ${padT + plotH} Z`
                    : '';

                const yTicks = [1, 0.75, 0.5, 0.25, 0];

                return (
                  <div className="relative pt-2 pb-2">
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[680px]">
                        <svg
                          viewBox={`0 0 ${svgW} ${svgH}`}
                          className="w-full h-64 sm:h-72 select-none"
                        >
                          <defs>
                            <linearGradient id="pvLineGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F16B47" stopOpacity="0.28" />
                              <stop offset="60%" stopColor="#F16B47" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#F16B47" stopOpacity="0.0" />
                            </linearGradient>
                            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
                              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                            </filter>
                          </defs>

                          {/* Grid Lines & Y-axis labels */}
                          {yTicks.map((ratio) => {
                            const val = Math.round(yMax * ratio);
                            const y = padT + (1 - ratio) * plotH;
                            return (
                              <g key={ratio}>
                                <line
                                  x1={padL}
                                  y1={y}
                                  x2={padL + plotW}
                                  y2={y}
                                  stroke="rgba(25, 25, 25, 0.12)"
                                  strokeDasharray="4 4"
                                  strokeWidth="1"
                                />
                                <text
                                  x={padL - 10}
                                  y={y + 4}
                                  textAnchor="end"
                                  fontSize="10"
                                  fontWeight="700"
                                  fill="rgba(25, 25, 25, 0.55)"
                                >
                                  {val.toLocaleString()}
                                </text>
                              </g>
                            );
                          })}

                          {/* Area Gradient Fill */}
                          {areaPath && (
                            <path d={areaPath} fill="url(#pvLineGradient)" />
                          )}

                          {/* Line Stroke */}
                          {linePath && (
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#F16B47"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {/* Data points & X-axis dates */}
                          {points.map((pt) => {
                            const isHovered = hoveredPointIndex === pt.index;
                            const dotColor = pt.isToday
                              ? '#FFE57E'
                              : pt.isWeekend
                              ? '#F16B47'
                              : '#191919';

                            return (
                              <g key={pt.date} className="cursor-pointer">
                                {/* Interactive hover trigger area */}
                                <rect
                                  x={pt.x - 18}
                                  y={padT}
                                  width={36}
                                  height={plotH + padB}
                                  fill="transparent"
                                  onMouseEnter={() => setHoveredPointIndex(pt.index)}
                                  onMouseLeave={() => setHoveredPointIndex(null)}
                                />

                                {/* Vertical guide line on hover */}
                                {isHovered && (
                                  <line
                                    x1={pt.x}
                                    y1={padT}
                                    x2={pt.x}
                                    y2={padT + plotH}
                                    stroke="#191919"
                                    strokeWidth="1.5"
                                    strokeDasharray="2 2"
                                  />
                                )}

                                {/* Dot circle */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? 7 : 5}
                                  fill={dotColor}
                                  stroke={pt.isToday ? '#191919' : '#FFFDF4'}
                                  strokeWidth="2.5"
                                  filter="url(#shadowFilter)"
                                  className="transition-all duration-150"
                                  onMouseEnter={() => setHoveredPointIndex(pt.index)}
                                />

                                {/* Value label above dot */}
                                <text
                                  x={pt.x}
                                  y={pt.y - 10}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight={isHovered || pt.isToday ? '800' : '700'}
                                  fill={pt.isToday ? '#F16B47' : '#191919'}
                                >
                                  {pt.effectivePV.toLocaleString()}
                                </text>

                                {/* X-axis Date Label */}
                                <text
                                  x={pt.x}
                                  y={padT + plotH + 20}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight={pt.isToday ? '800' : '600'}
                                  fill={
                                    pt.isToday
                                      ? '#191919'
                                      : pt.isWeekend
                                      ? '#F16B47'
                                      : 'rgba(25, 25, 25, 0.55)'
                                  }
                                >
                                  {pt.dateLabel}
                                  {pt.isToday ? '(오늘)' : pt.isWeekend ? '(주말)' : ''}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    </div>

                    {/* Active Hover Tooltip Box */}
                    {hoveredPointIndex !== null && points[hoveredPointIndex] && (
                      <div className="mt-2 p-3.5 bg-[#FBF9E9] border border-[#191919]/20 rounded-xl flex flex-wrap items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#F16B47]" />
                          <span className="font-extrabold text-[#191919]">
                            {points[hoveredPointIndex].fullDate}
                          </span>
                          {points[hoveredPointIndex].isToday && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFE57E] text-[#191919] font-extrabold">
                              오늘 당일
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[#191919]/75 tabular-nums">
                          <span>
                            페이지뷰: <strong className="text-[#F16B47] font-extrabold">{points[hoveredPointIndex].effectivePV.toLocaleString()}회</strong>
                          </span>
                          <span>
                            순방문자: <strong className="text-[#191919] font-extrabold">{points[hoveredPointIndex].uv.toLocaleString()}명</strong>
                          </span>
                          <span>
                            모임조회: <strong className="text-[#191919] font-extrabold">{points[hoveredPointIndex].detailViews.toLocaleString()}회</strong>
                          </span>
                          <span>
                            세션당 PV: <strong className="text-[#191919] font-extrabold">{points[hoveredPointIndex].pps}페이지</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Detailed Table (Daily or Monthly) */}
            <div className="bg-[#FFFDF4] rounded-2xl border border-[#191919]/15 overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#191919]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#191919]">
                    {analyticsPeriod === 'daily' ? '일자별 일간 페이지뷰 상세 내역' : '월별 페이지뷰 및 방문 집계'}
                  </h3>
                  <p className="text-xs text-[#191919]/65 mt-0.5">
                    {analyticsPeriod === 'daily'
                      ? `선택 기간(${chartStartDate} ~ ${chartEndDate}, 총 ${displayRecords.length}일)의 페이지뷰 및 방문자 데이터입니다.`
                      : '월별 누적 페이지뷰 및 순방문자 데이터 집계'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-md bg-[#FBF9E9] border border-[#191919]/15 font-bold text-[#191919] tabular-nums">
                    {analyticsPeriod === 'daily' ? `${displayRecords.length}일 데이터` : `${monthlyStats.length}개 월 집계`}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FBF9E9] border-b border-[#191919]/15 text-[#191919]/75 font-extrabold whitespace-nowrap">
                      <th className="py-3.5 px-4 sm:px-6">{analyticsPeriod === 'daily' ? '날짜 / 요일' : '연도 / 월'}</th>
                      <th className="py-3.5 px-4 sm:px-6">페이지뷰 (PV)</th>
                      <th className="py-3.5 px-4 sm:px-6">순방문자 (UV)</th>
                      <th className="py-3.5 px-4 sm:px-6">모임 상세 조회수</th>
                      <th className="py-3.5 px-4 sm:px-6">세션당 평균 PV</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">구분</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#191919]/10">
                    {analyticsPeriod === 'daily' ? (
                      [...displayRecords]
                        .reverse()
                        .map((row) => {
                          const effectivePV = row.pv + (row.isToday ? livePVBoost : 0);

                          return (
                            <tr
                              key={row.date}
                              className={`hover:bg-[#FBF9E9]/60 transition-colors whitespace-nowrap ${
                                row.isToday ? 'bg-[#FFE57E]/25 font-semibold' : ''
                              }`}
                            >
                              <td className="py-3.5 sm:py-4 px-4 sm:px-6 flex items-center gap-2">
                                {row.isToday && (
                                  <span className="w-2 h-2 rounded-full bg-[#F16B47] shrink-0" />
                                )}
                                <span className={row.isToday ? 'text-[#191919] font-extrabold' : 'text-[#191919]'}>
                                  {row.fullDate}
                                </span>
                                {row.isToday && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#FFE57E] text-[#191919] font-extrabold">
                                    오늘
                                  </span>
                                )}
                                {row.isWeekend && !row.isToday && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F16B47]/15 text-[#F16B47] font-extrabold">
                                    주말
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 sm:py-4 px-4 sm:px-6 font-extrabold text-[#191919] tabular-nums">
                                {effectivePV.toLocaleString()}회
                              </td>
                              <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-[#191919]/75 tabular-nums">{row.uv.toLocaleString()}명</td>
                              <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-[#191919]/75 tabular-nums">{row.detailViews.toLocaleString()}회</td>
                              <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-[#191919]/75 tabular-nums">{row.pps}페이지</td>
                              <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-right">
                                {row.isToday ? (
                                  <span className="inline-block text-[11px] px-2.5 py-1 rounded-md font-extrabold bg-[#FFE57E] text-[#191919]">
                                    당일 실시간
                                  </span>
                                ) : row.isWeekend ? (
                                  <span className="inline-block text-[11px] px-2.5 py-1 rounded-md font-extrabold bg-[#F16B47]/15 text-[#F16B47]">
                                    주말 피크
                                  </span>
                                ) : (
                                  <span className="inline-block text-[11px] px-2.5 py-1 rounded-md font-bold bg-[#FBF9E9] text-[#191919]/70 border border-[#191919]/15">
                                    평일
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      monthlyStats.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#FBF9E9]/60 transition-colors whitespace-nowrap">
                          <td className="py-3.5 sm:py-4 px-4 sm:px-6 font-extrabold text-[#191919]">{row.date}</td>
                          <td className="py-3.5 sm:py-4 px-4 sm:px-6 font-extrabold text-[#191919] tabular-nums">{row.pv.toLocaleString()}회</td>
                          <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-[#191919]/75 tabular-nums">{row.uv.toLocaleString()}명</td>
                          <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-[#191919]/75 tabular-nums">{row.detailViews.toLocaleString()}회</td>
                          <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-[#191919]/75 tabular-nums">{row.pps}페이지</td>
                          <td className="py-3.5 sm:py-4 px-4 sm:px-6 text-right">
                            <span className="inline-flex items-center gap-1 font-extrabold text-[#191919]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#F16B47]" />
                              {row.growth}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom 2 Insight Cards: Page Breakdown & Peak Traffic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Popular Pages Breakdown */}
              <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 space-y-4">
                <div className="flex items-center justify-between border-b border-[#191919]/10 pb-3">
                  <h3 className="font-extrabold text-sm text-[#191919] flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#F16B47]" />
                    <span>주요 페이지별 PV 점유율</span>
                  </h3>
                  <span className="text-xs font-semibold text-[#191919]/55">실시간 데이터</span>
                </div>

                <div className="space-y-3 text-xs">
                  {(() => {
                    const totalPV = Math.max(1, totalFilteredPV);
                    const detailPV = totalDetailViews;
                    const homePV = Math.max(0, totalPV - detailPV);
                    const homeShare = Math.round((homePV / totalPV) * 100);
                    const detailShare = 100 - homeShare;
                    const breakdown = [
                      { name: '홈 및 모임 둘러보기 (Explore & Home)', share: homeShare, pv: homePV, color: 'bg-[#191919]' },
                      { name: '모임 상세 및 도서 정보 (Club Detail)', share: detailShare, pv: detailPV, color: 'bg-[#F16B47]' }
                    ];

                    return breakdown.map((p, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between font-semibold">
                          <span className="text-[#191919]">{p.name}</span>
                          <span className="font-extrabold text-[#191919] tabular-nums">{p.share}% ({p.pv.toLocaleString()} PV)</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#FBF9E9] border border-[#191919]/15 rounded-md overflow-hidden">
                          <div className={`h-full ${p.color}`} style={{ width: `${Math.max(2, p.share)}%` }} />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Traffic Peak & Behavior */}
              <div className="bg-[#FFFDF4] p-5 sm:p-6 rounded-2xl border border-[#191919]/15 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#191919]/10 pb-3">
                  <h3 className="font-extrabold text-sm text-[#191919] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F16B47] shrink-0" />
                    <span>시간대별 유입 피크 & 접속 환경</span>
                  </h3>
                  <span className="text-xs text-[#191919] font-extrabold flex items-center gap-1.5 bg-[#B9D8E6]/60 px-2.5 py-0.5 rounded-md whitespace-nowrap">
                    실시간 접속 집계 정상
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-[#FBF9E9] rounded-xl border border-[#191919]/15">
                    <div className="font-extrabold text-[#191919] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F16B47] shrink-0" />
                      <span>저녁 독서 골든타임 (19:00 ~ 23:00)</span>
                    </div>
                    <p className="text-[#191919]/70 leading-relaxed text-[11px]">
                      독서 모임 탐색 및 신청은 주로 퇴근 및 일과 후 저녁 시간대에 집중되며, 방문자 유입이 실시간으로 안전하게 기록되고 있습니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-3 rounded-xl bg-[#FBF9E9] border border-[#191919]/15">
                      <span className="text-[11px] text-[#191919]/60 block">모바일 접속</span>
                      <strong className="text-sm font-extrabold text-[#191919]">반응형 지원</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FBF9E9] border border-[#191919]/15">
                      <span className="text-[11px] text-[#191919]/60 block">PC 웹 접속</span>
                      <strong className="text-sm font-extrabold text-[#191919]">데스크톱 최적화</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#FBF9E9] border border-[#191919]/15">
                      <span className="text-[11px] text-[#191919]/60 block">데이터 보관</span>
                      <strong className="text-sm font-extrabold text-[#191919]">실시간 영구 집계</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: MEMBER PARTICIPATION HISTORY MODAL (No calgaryYears) */}
      {selectedMemberForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#191919]/65 backdrop-blur-xs">
          <div 
            className="bg-[#FBF9E9] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#191919]/20 overflow-hidden max-h-[94dvh] sm:max-h-[90vh] flex flex-col min-w-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-[#191919] text-[#FBF9E9] relative border-b border-[#191919] shrink-0">
              <button
                onClick={() => setSelectedMemberForDetail(null)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#FBF9E9]/70 hover:text-[#FBF9E9] p-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start sm:items-center gap-3 sm:gap-4 pr-9">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedMemberForDetail.avatar ? (
                    <img
                      src={selectedMemberForDetail.avatar}
                      alt={selectedMemberForDetail.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg sm:text-xl font-extrabold text-[#FFE57E]">{selectedMemberForDetail.name.charAt(0)}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#FBF9E9] break-words">{selectedMemberForDetail.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-[#FFE57E] text-[#191919] font-extrabold font-mono break-all">
                      @{selectedMemberForDetail.username}
                    </span>
                  </div>
                  <div className="text-xs text-[#FBF9E9]/75 mt-1.5 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
                    <span>성별: <strong className="text-[#FBF9E9]">{selectedMemberForDetail.gender || '미입력'}</strong></span>
                    <span>
                      연령:{' '}
                      <strong className="text-[#FBF9E9] tabular-nums">
                        {(() => {
                          const age = calculateAgeFromBirthDate(selectedMemberForDetail.birthDate);
                          return age !== null ? `만 ${age}세` : '미입력';
                        })()}
                      </strong>
                    </span>
                    <span>
                      생년월일:{' '}
                      <strong className="text-[#FBF9E9] tabular-nums">
                        {selectedMemberForDetail.birthDate
                          ? formatBirthDateKorean(selectedMemberForDetail.birthDate) ||
                            selectedMemberForDetail.birthDate
                          : '미입력'}
                      </strong>
                    </span>
                    <span className="break-all">이메일: <strong className="font-mono text-[#FBF9E9] break-all">{selectedMemberForDetail.email}</strong></span>
                    <span>가입일자: <strong className="text-[#FBF9E9] tabular-nums">{selectedMemberForDetail.createdAt}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Participation History */}
            <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-extrabold text-sm text-[#191919] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F16B47] shrink-0" />
                  <span>그동안 참여 및 신청한 독서모임 히스토리</span>
                </h4>
                <span className="text-xs font-bold text-[#191919]/65 tabular-nums shrink-0">
                  총 {getMemberRSVPs(selectedMemberForDetail).length}건
                </span>
              </div>

              {getMemberRSVPs(selectedMemberForDetail).length === 0 ? (
                <div className="text-center py-12 bg-[#FFFDF4] rounded-xl border border-[#191919]/15">
                  <p className="text-xs text-[#191919]/60 font-semibold">아직 신청 및 참여한 모임 기록이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getMemberRSVPs(selectedMemberForDetail).map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-[#191919]/15 bg-[#FFFDF4] hover:border-[#191919]/35 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-extrabold text-[#F16B47] uppercase tracking-wide tabular-nums">
                            신청일시: {r.registeredAt}
                          </span>
                          <h5 className="font-extrabold text-sm text-[#191919] mt-0.5 break-words">
                            《{r.bookTitle}》 {r.author}
                          </h5>
                          <p className="text-xs text-[#191919]/65 mt-0.5 break-words">{r.clubTitle}</p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold shrink-0 self-start ${
                          r.status === 'confirmed'
                            ? 'bg-[#B9D8E6] text-[#191919]'
                            : 'bg-[#F16B47]/15 text-[#F16B47]'
                        }`}>
                          {r.status === 'confirmed' ? '참여 확정 (결제 완료)' : '신청 취소됨'}
                        </span>
                      </div>

                      <div className="text-xs text-[#191919]/75 space-y-1 pt-2 border-t border-[#191919]/10">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-3 h-3 text-[#191919]/45 shrink-0 mt-0.5" />
                          <span className="tabular-nums break-words">모임 일시: <strong>{r.dateTime}</strong></span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3 h-3 text-[#191919]/45 shrink-0 mt-0.5" />
                          <span className="break-words">장소: {r.venueName}{r.venueAddress ? ` (${r.venueAddress})` : ''}</span>
                        </div>
                        {r.paymentMethod && (
                          <div className="flex items-start gap-2 text-[#191919] tabular-nums">
                            <CreditCard className="w-3 h-3 text-[#F16B47] shrink-0 mt-0.5" />
                            <span className="break-words">결제 수단: <strong>{r.paymentMethod}</strong> (CAD ${r.paymentAmountCAD || 15})</span>
                          </div>
                        )}
                        {r.userNotes && (
                          <div className="mt-1.5 p-2.5 bg-[#FBF9E9] rounded-lg border border-[#191919]/15 text-[11px] text-[#191919] break-words">
                            <span className="font-extrabold">작성한 독서 메모: </span>
                            {r.userNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FFFDF4] border-t border-[#191919]/15 flex justify-end">
              <button
                onClick={() => setSelectedMemberForDetail(null)}
                className="px-5 py-2 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FBF9E9] text-xs font-bold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CLUB APPLICANTS ROSTER MODAL (Auto-recorded from payment) */}
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
                      신청 상태: {selectedClubForApplicants.status === 'open' ? '모집중' : selectedClubForApplicants.status === 'almost_full' ? '마감임박' : '마감'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-extrabold text-[#FBF9E9] break-words leading-snug">{selectedClubForApplicants.bookTitle} 신청자 명단</h3>
                  <p className="text-xs text-[#FBF9E9]/75 mt-0.5 break-words">{selectedClubForApplicants.title}</p>
                  <p className="text-[11px] text-[#FBF9E9]/60 mt-1 tabular-nums break-words">
                    {selectedClubForApplicants.dateTime} · {selectedClubForApplicants.venueName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body: Applicants List */}
            <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-4">
              {/* Notification & Minimum Threshold Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-[#191919]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFDF4]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-extrabold text-[#191919]">진행 알림 시스템:</span>
                    {selectedClubForApplicants.currentSeats >= 4 ? (
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
                    {selectedClubForApplicants.currentSeats >= 4
                      ? '최소 인원 4명이 충족되어 모든 신청자(이메일 & SMS)에게 모임 진행 확정 안내가 자동 발송되었습니다.'
                      : '모임 진행 최소 인원은 4명입니다. 4명 충족 시 신청자 전원에게 알림이 발송되며, 미달 취소 시 참가비는 100% 전액 자동 환불됩니다.'}
                  </p>
                </div>

                {selectedClubForApplicants.currentSeats >= 4 && (
                  <button
                    onClick={() => {
                      setBroadcastNotice(`'${selectedClubForApplicants.bookTitle}' 신청자 전원에게 진행 확정 안내(이메일 & SMS)를 성공적으로 재발송했습니다.`);
                      setTimeout(() => setBroadcastNotice(null), 3500);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FFE57E] text-xs font-extrabold cursor-pointer shrink-0 transition-colors"
                  >
                    진행 확정 알림 전체 재발송
                  </button>
                )}
              </div>

              {broadcastNotice && (
                <div className="p-3 bg-[#B9D8E6]/45 border border-[#191919]/20 text-[#191919] text-xs font-semibold rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#191919] shrink-0" />
                  <span>{broadcastNotice}</span>
                </div>
              )}

              {getClubRSVPs(selectedClubForApplicants.id).length === 0 ? (
                <div className="text-center py-12 bg-[#FFFDF4] rounded-xl border border-[#191919]/15">
                  <Users className="w-8 h-8 text-[#191919]/30 mx-auto mb-2" />
                  <p className="text-xs text-[#191919]/75 font-bold">아직 이 모임에 신청한 회원이 없습니다.</p>
                  <p className="text-[11px] text-[#191919]/50 mt-0.5">회원들이 결제를 완료하면 자동으로 여기에 정보가 기록됩니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getClubRSVPs(selectedClubForApplicants.id).map((applicant, idx) => (
                    <div
                      key={applicant.id}
                      className="p-3.5 sm:p-4 rounded-xl border border-[#191919]/15 bg-[#FFFDF4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-[#191919] text-[#FFE57E] font-extrabold flex items-center justify-center text-xs shrink-0 mt-0.5 tabular-nums">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-sm text-[#191919]">{applicant.participantName}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              applicant.status === 'confirmed'
                                ? 'bg-[#B9D8E6] text-[#191919]'
                                : 'bg-[#F16B47]/15 text-[#F16B47]'
                            }`}>
                              {applicant.status === 'confirmed' ? '결제 및 신청 승인' : '취소됨'}
                            </span>
                          </div>

                          <div className="text-xs text-[#191919]/65 font-mono mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span className="inline-flex items-center gap-1 break-all">
                              <Mail className="w-3 h-3 shrink-0" /> {applicant.email}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3 h-3 shrink-0" /> {applicant.phone}
                            </span>
                            <span className="inline-flex items-center gap-1 tabular-nums">
                              <Clock className="w-3 h-3 shrink-0" /> 신청일: {applicant.registeredAt}
                            </span>
                          </div>

                          <div className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-[#191919] bg-[#FBF9E9] px-2.5 py-1 rounded-lg border border-[#191919]/15 tabular-nums max-w-full">
                            <CreditCard className="w-3.5 h-3.5 text-[#F16B47] shrink-0" />
                            <span className="break-words">
                              결제 수단: <strong>{applicant.paymentMethod || 'Interac e-Transfer'}</strong> (CAD ${applicant.paymentAmountCAD || selectedClubForApplicants.feeCAD})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {applicant.status === 'confirmed' ? (
                          <button
                            onClick={() => onUpdateRSVPStatus(applicant.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-lg bg-[#F16B47]/15 hover:bg-[#F16B47] text-[#F16B47] hover:text-white text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            신청 취소 처리
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateRSVPStatus(applicant.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg bg-[#B9D8E6] hover:bg-[#9fc8dc] text-[#191919] text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            신청 재승인
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FFFDF4] border-t border-[#191919]/15 flex justify-end">
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
