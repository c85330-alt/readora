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

export interface DailyPVRecord {
  date: string; // YYYY-MM-DD
  dateLabel: string; // MM.DD
  fullDate: string; // YYYY년 MM월 DD일 (요일)
  pv: number;
  uv: number;
  detailViews: number;
  pps: number;
  isToday?: boolean;
  isWeekend?: boolean;
}

const INITIAL_DAILY_PV_RECORDS: DailyPVRecord[] = [
  { date: '2026-10-01', dateLabel: '10.01', fullDate: '2026년 10월 01일 (목)', pv: 1120, uv: 710, detailViews: 350, pps: 3.1 },
  { date: '2026-10-02', dateLabel: '10.02', fullDate: '2026년 10월 02일 (금)', pv: 1280, uv: 810, detailViews: 410, pps: 3.2 },
  { date: '2026-10-03', dateLabel: '10.03', fullDate: '2026년 10월 03일 (토)', pv: 1650, uv: 1020, detailViews: 540, pps: 3.5, isWeekend: true },
  { date: '2026-10-04', dateLabel: '10.04', fullDate: '2026년 10월 04일 (일)', pv: 1580, uv: 990, detailViews: 510, pps: 3.4, isWeekend: true },
  { date: '2026-10-05', dateLabel: '10.05', fullDate: '2026년 10월 05일 (월)', pv: 1090, uv: 680, detailViews: 340, pps: 3.0 },
  { date: '2026-10-06', dateLabel: '10.06', fullDate: '2026년 10월 06일 (화)', pv: 1150, uv: 720, detailViews: 370, pps: 3.1 },
  { date: '2026-10-07', dateLabel: '10.07', fullDate: '2026년 10월 07일 (수)', pv: 1190, uv: 740, detailViews: 380, pps: 3.1 },
  { date: '2026-10-08', dateLabel: '10.08', fullDate: '2026년 10월 08일 (목)', pv: 1210, uv: 755, detailViews: 390, pps: 3.1 },
  { date: '2026-10-09', dateLabel: '10.09', fullDate: '2026년 10월 09일 (금)', pv: 1340, uv: 840, detailViews: 430, pps: 3.2 },
  { date: '2026-10-10', dateLabel: '10.10', fullDate: '2026년 10월 10일 (토)', pv: 1720, uv: 1050, detailViews: 570, pps: 3.5, isWeekend: true },
  { date: '2026-10-11', dateLabel: '10.11', fullDate: '2026년 10월 11일 (일)', pv: 1680, uv: 1030, detailViews: 550, pps: 3.4, isWeekend: true },
  { date: '2026-10-12', dateLabel: '10.12', fullDate: '2026년 10월 12일 (월)', pv: 1130, uv: 705, detailViews: 360, pps: 3.0 },
  { date: '2026-10-13', dateLabel: '10.13', fullDate: '2026년 10월 13일 (화)', pv: 1180, uv: 730, detailViews: 380, pps: 3.1 },
  { date: '2026-10-14', dateLabel: '10.14', fullDate: '2026년 10월 14일 (수)', pv: 1220, uv: 760, detailViews: 390, pps: 3.1 },
  { date: '2026-10-15', dateLabel: '10.15', fullDate: '2026년 10월 15일 (목)', pv: 1240, uv: 775, detailViews: 400, pps: 3.1 },
  { date: '2026-10-16', dateLabel: '10.16', fullDate: '2026년 10월 16일 (금)', pv: 1390, uv: 870, detailViews: 450, pps: 3.2 },
  { date: '2026-10-17', dateLabel: '10.17', fullDate: '2026년 10월 17일 (토)', pv: 1780, uv: 1090, detailViews: 590, pps: 3.6, isWeekend: true },
  { date: '2026-10-18', dateLabel: '10.18', fullDate: '2026년 10월 18일 (일)', pv: 1710, uv: 1045, detailViews: 565, pps: 3.5, isWeekend: true },
  { date: '2026-10-19', dateLabel: '10.19', fullDate: '2026년 10월 19일 (월)', pv: 1150, uv: 720, detailViews: 370, pps: 3.0 },
  { date: '2026-10-20', dateLabel: '10.20', fullDate: '2026년 10월 20일 (화)', pv: 1205, uv: 750, detailViews: 385, pps: 3.1 },
  { date: '2026-10-21', dateLabel: '10.21', fullDate: '2026년 10월 21일 (수)', pv: 1230, uv: 770, detailViews: 395, pps: 3.1 },
  { date: '2026-10-22', dateLabel: '10.22', fullDate: '2026년 10월 22일 (목)', pv: 1250, uv: 785, detailViews: 405, pps: 3.2 },
  { date: '2026-10-23', dateLabel: '10.23', fullDate: '2026년 10월 23일 (금)', pv: 1350, uv: 850, detailViews: 440, pps: 3.2 },
  { date: '2026-10-24', dateLabel: '10.24', fullDate: '2026년 10월 24일 (토)', pv: 1810, uv: 1110, detailViews: 610, pps: 3.6, isWeekend: true },
  { date: '2026-10-25', dateLabel: '10.25', fullDate: '2026년 10월 25일 (일)', pv: 1690, uv: 1030, detailViews: 560, pps: 3.5, isWeekend: true },
  { date: '2026-10-26', dateLabel: '10.26', fullDate: '2026년 10월 26일 (월)', pv: 1080, uv: 675, detailViews: 345, pps: 3.0 },
  { date: '2026-10-27', dateLabel: '10.27', fullDate: '2026년 10월 27일 (화)', pv: 1245, uv: 780, detailViews: 400, pps: 3.1 },
  { date: '2026-10-28', dateLabel: '10.28', fullDate: '2026년 10월 28일 (수)', pv: 1190, uv: 745, detailViews: 380, pps: 3.1 },
  { date: '2026-10-29', dateLabel: '10.29', fullDate: '2026년 10월 29일 (목)', pv: 1220, uv: 764, detailViews: 390, pps: 3.0 },
  { date: '2026-10-30', dateLabel: '10.30', fullDate: '2026년 10월 30일 (금)', pv: 1410, uv: 880, detailViews: 460, pps: 3.2 },
  { date: '2026-10-31', dateLabel: '10.31', fullDate: '2026년 10월 31일 (토)', pv: 1894, uv: 1152, detailViews: 640, pps: 3.6, isWeekend: true },
  { date: '2026-11-01', dateLabel: '11.01', fullDate: '2026년 11월 01일 (일)', pv: 1742, uv: 1060, detailViews: 580, pps: 3.5, isWeekend: true },
  { date: '2026-11-02', dateLabel: '11.02', fullDate: '2026년 11월 02일 (월)', pv: 1185, uv: 750, detailViews: 382, pps: 3.1 },
  { date: '2026-11-03', dateLabel: '11.03', fullDate: '2026년 11월 03일 (화)', pv: 1317, uv: 814, detailViews: 420, pps: 3.2 },
  { date: '2026-11-04', dateLabel: '11.04', fullDate: '2026년 11월 04일 (수)', pv: 1365, uv: 852, detailViews: 435, pps: 3.3 },
  { date: '2026-11-05', dateLabel: '11.05', fullDate: '2026년 11월 05일 (오늘, 목)', pv: 1428, uv: 892, detailViews: 456, pps: 3.4, isToday: true }
];

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
  const [dailyPVRecords] = useState<DailyPVRecord[]>(INITIAL_DAILY_PV_RECORDS);
  const [chartStartDate, setChartStartDate] = useState('2026-10-30');
  const [chartEndDate, setChartEndDate] = useState('2026-11-05');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Filter records within chartStartDate and chartEndDate
  const filteredDailyRecords = dailyPVRecords.filter((r) => {
    return r.date >= chartStartDate && r.date <= chartEndDate;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const displayRecords = filteredDailyRecords.length > 0 ? filteredDailyRecords : dailyPVRecords.slice(-7);
  const totalFilteredPV = displayRecords.reduce((sum, r) => sum + r.pv, 0) + (displayRecords.some(r => r.isToday) ? livePVBoost : 0);
  const avgFilteredPV = Math.round(totalFilteredPV / displayRecords.length);
  const maxFilteredPV = Math.max(...displayRecords.map(r => r.pv + (r.isToday ? livePVBoost : 0)));
  const todayRecord = dailyPVRecords.find(r => r.isToday) || dailyPVRecords[dailyPVRecords.length - 1];
  const todayPVDisplay = todayRecord.pv + livePVBoost;

  // Member Search & Filter
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<User | null>(null);

  // Club Search & Filter
  const [clubSearch, setClubSearch] = useState('');
  const [clubHostFilter, setClubHostFilter] = useState<'all' | 'admin_host'>('all');
  const [selectedClubForApplicants, setSelectedClubForApplicants] = useState<BookClub | null>(null);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#F0EBE0] text-[#19221C] flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="bg-[#172E22] text-white sticky top-0 z-40 border-b border-[#2D4536] shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-baseline gap-1 shrink-0">
              <span className="font-[Arial,sans-serif] text-xl sm:text-2xl font-bold tracking-tight text-white">
                리도라
              </span>
              <span className="text-[10px] sm:text-xs text-stone-300 font-medium hidden sm:inline">Readora</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#234332] px-2.5 py-1 rounded-full border border-white/10 text-[11px] sm:text-xs truncate">
              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-semibold text-emerald-300 truncate">관리자 포털</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenCreateClub}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-[#DF612D] hover:bg-[#c95221] text-white px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer shadow-sm"
              title="관리자가 직접 호스트로서 새 모임을 등록합니다"
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
                <Users className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">마이페이지</span>
              </button>
            )}

            <button
              onClick={onSwitchToUserView}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-full transition-colors cursor-pointer border border-white/15"
              title="사용자 화면으로 전환"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">사용자 화면</span>
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

        {/* Tab Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex gap-2 sm:gap-4 border-t border-[#234332] overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`py-2.5 sm:py-3.5 px-2.5 sm:px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'clubs'
                ? 'border-[#DF612D] text-white'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>모임 개설 및 관리 ({clubs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`py-2.5 sm:py-3.5 px-2.5 sm:px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'members'
                ? 'border-[#DF612D] text-white'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-4 h-4 text-[#DF612D]" />
            <span>회원 계정 관리 ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2.5 sm:py-3.5 px-2.5 sm:px-3 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'border-[#DF612D] text-white'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>페이지뷰 분석 & 통계</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 w-full space-y-4 sm:space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E0D8C8] shadow-xs">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-stone-500">호스트 운영 모임</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#19221C]">{adminClubsCount}개</div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 sm:mt-1">관리자/호스트 클럽</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E0D8C8] shadow-xs">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-stone-500">전체 독서모임</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#19221C]">{totalClubs}개</div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 sm:mt-1">캘거리 전역 모임</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E0D8C8] shadow-xs">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-stone-500">신청 & 결제 접수</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-50 text-[#DF612D] flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#19221C]">{totalRSVPs}건</div>
            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-medium mt-0.5 sm:mt-1">확정 신청 {activeRSVPs}건</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-[#E0D8C8] shadow-xs">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-stone-500">가입 회원 수</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-[#1E4E79] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#19221C]">{totalMembers}명</div>
            <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 sm:mt-1">이메일 인증 회원</p>
          </div>

          <div 
            onClick={() => setActiveTab('analytics')}
            className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border shadow-xs transition-all cursor-pointer col-span-2 sm:col-span-1 ${
              activeTab === 'analytics'
                ? 'bg-[#172E22] text-white border-[#172E22]'
                : 'bg-white border-[#E0D8C8] hover:border-[#DF612D]/40'
            }`}
            title="클릭 시 페이지뷰 분석 및 트래픽 통계로 이동"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className={`text-[11px] sm:text-xs font-semibold ${activeTab === 'analytics' ? 'text-emerald-300' : 'text-stone-500'}`}>
                당일 페이지뷰 (오늘)
              </span>
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${
                activeTab === 'analytics' ? 'bg-white/10 text-emerald-400' : 'bg-purple-50 text-purple-700'
              }`}>
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${activeTab === 'analytics' ? 'text-white' : 'text-[#19221C]'}`}>
              {todayPVDisplay.toLocaleString()}회
            </div>
            <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${
              activeTab === 'analytics' ? 'text-emerald-300' : 'text-emerald-600'
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
            <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#19221C] flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>호스트 모임 개설 및 신청자 관리</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  관리자가 직접 호스트로서 모임을 개설하고, 모임의 상태(모집중/마감임박/마감) 및 신청자 명단을 관리합니다.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Host Filter Toggle */}
                <div className="flex items-center bg-[#F4F0E5] p-1 rounded-xl border border-stone-200 text-xs">
                  <button
                    onClick={() => setClubHostFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                      clubHostFilter === 'all'
                        ? 'bg-white text-[#19221C] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    전체 모임 ({clubs.length})
                  </button>
                  <button
                    onClick={() => setClubHostFilter('admin_host')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      clubHostFilter === 'admin_host'
                        ? 'bg-white text-[#DF612D] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>내 호스트 모임 ({adminClubsCount})</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clubSearch}
                    onChange={(e) => setClubSearch(e.target.value)}
                    placeholder="도서명, 모임명 검색..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#DF612D] bg-[#FCFAF6]"
                  />
                </div>

                {/* Create Club Button */}
                <button
                  onClick={onOpenCreateClub}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>호스트로서 새 모임 개설</span>
                </button>
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
                      모임 24시간 전 최소 인원(4명) 자동 취소 및 환불 시스템 가동 중
                    </span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                      자동 연동
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    모임 시작 <strong>24시간 전까지 최소 4명</strong>이 모집되지 않은 모임은 자동으로 취소되며, 호스트 및 신청 회원 전원에게 <strong>취소 안내 알림 및 메일이 자동 발송</strong>되고 참가비는 100% 전액 환불됩니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                {onViewAutoCancelLogs && (
                  <button
                    onClick={onViewAutoCancelLogs}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="자동 발송된 취소 안내 메일 및 SMS 내역 확인"
                  >
                    <Bell className="w-3.5 h-3.5 text-stone-500" />
                    <span>취소 알림/메일 내역 ({autoCancelLogsCount}건)</span>
                  </button>
                )}

                {onTriggerAutoCancellationCheck && (
                  <button
                    onClick={onTriggerAutoCancellationCheck}
                    className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                    title="현재 등록된 모임 중 24시간 이내 최소 4명 미달 모임을 즉시 점검하여 자동 취소 처리합니다"
                  >
                    <span>⚡ 24시간 자동 취소 즉시 점검</span>
                  </button>
                )}
              </div>
            </div>

            {/* Clubs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className={`bg-white rounded-3xl border shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                      isCancelled ? 'border-red-200 opacity-80' : 'border-[#E0D8C8] hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Top Club Header - Clicking opens full club details */}
                      <div 
                        onClick={() => onSelectClubDetail(club)}
                        className="p-5 flex gap-4 border-b border-stone-100 cursor-pointer group hover:bg-stone-50/70 transition-colors"
                        title="클릭하여 모임 상세 정보 보기"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={club.coverImage}
                            alt={club.bookTitle}
                            className="w-20 h-28 object-cover rounded-xl shadow-xs group-hover:scale-102 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white drop-shadow-md" />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700">
                              {club.category}
                            </span>

                            {isManagedByAdmin ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                                <Crown className="w-3 h-3 text-amber-600" />
                                관리자 직영 호스트
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-500 font-medium">
                                호스트: {club.hostName}
                              </span>
                            )}

                            {isCancelled && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                취소된 모임
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-base text-[#19221C] truncate group-hover:text-[#DF612D] transition-colors flex items-center gap-1.5">
                            <span>{club.bookTitle}</span>
                            <Eye className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#DF612D] shrink-0" />
                          </h3>
                          <p className="text-xs text-stone-500 mb-2 truncate">
                            {club.title}
                          </p>

                          <div className="text-[11px] text-stone-600 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#DF612D]" />
                              <span>{club.dateTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span className="truncate">{club.venueName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Management Bar (Only 모집중/마감임박/마감/취소 - No seat numbers) */}
                      <div className="p-4 bg-[#FCFAF6] border-b border-stone-100 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-stone-600">모임 상태:</span>
                          <select
                            value={club.status}
                            onChange={(e) => onUpdateClubStatus(club.id, e.target.value as any)}
                            className={`text-xs px-3 py-1.5 rounded-xl border font-bold cursor-pointer transition-colors ${
                              club.status === 'open'
                                ? 'bg-[#E8F2E8] text-[#2D6A4F] border-[#CCE0CD]'
                                : club.status === 'almost_full'
                                ? 'bg-[#FDEEE3] text-[#DF612D] border-[#F2D7C2]'
                                : club.status === 'cancelled'
                                ? 'bg-red-50 text-red-600 border-red-200'
                                : 'bg-stone-100 text-stone-600 border-stone-200'
                            }`}
                          >
                            <option value="open">모집중 (Open)</option>
                            <option value="almost_full">마감임박 (Almost Full)</option>
                            <option value="closed">마감 (Closed)</option>
                            <option value="cancelled">모임 취소 (Cancelled)</option>
                          </select>
                        </div>

                        {onDeleteClub && (
                          <button
                            onClick={() => {
                              if (window.confirm(`'${club.bookTitle}' 모임을 삭제하시겠습니까?`)) {
                                onDeleteClub(club.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="모임 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Minimum 4 people progress & discussion topic disclosure badge */}
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
                        ) : club.currentSeats >= 4 ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            진행 확정 (최소 4명 충족 • 알림 발송 완료)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            최소 4명 모집 중 (충족 시 신청자 자동 알림)
                          </span>
                        )}

                        <span className="text-[11px] font-medium text-stone-500">
                          발제 질문: {club.shareDiscussionTopics !== false ? '✅ 사전 공개됨' : '🔒 당일 현장 공개'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action: View Detail, Edit, Cancel, and View Applicants */}
                    <div className="p-4 bg-white flex flex-wrap items-center justify-between gap-2 border-t border-stone-100">
                      <div className="text-xs text-stone-600">
                        {clubApplicants.length > 0 ? (
                          <span>
                            신청자 <strong className="text-[#DF612D] font-bold">{clubApplicants.length}명</strong> (결제 완료)
                          </span>
                        ) : (
                          <span className="text-stone-400">접수된 신청 내역 없음</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Club Detail View Button */}
                        <button
                          onClick={() => onSelectClubDetail(club)}
                          className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="모임 상세 내용 확인"
                        >
                          <Eye className="w-3.5 h-3.5 text-stone-600" />
                          <span>상세 내용</span>
                        </button>

                        {/* Edit Button */}
                        {onEditClub && (
                          <button
                            onClick={() => onEditClub(club)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#DF612D]/10 hover:bg-[#DF612D]/20 text-[#DF612D] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                            className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="모임 취소"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>취소</span>
                          </button>
                        )}

                        {/* Applicants Button */}
                        <button
                          onClick={() => setSelectedClubForApplicants(club)}
                          className="px-3 py-1.5 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
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
          <div className="bg-white rounded-3xl border border-[#E0D8C8] shadow-sm overflow-hidden">
            {/* Search and Action Bar */}
            <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#19221C]">회원 계정 및 참여 내역</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  회원 이름, 아이디, 연락처, 가입 일자 및 과거 참여한 모임 목록을 실시간으로 확인합니다.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="이름, 아이디, 이메일 검색..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#DF612D] bg-[#FCFAF6]"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F5EE] border-b border-stone-200 text-stone-600 font-semibold">
                    <th className="py-3.5 px-6">회원 정보 (이름/ID)</th>
                    <th className="py-3.5 px-6 text-center">성별</th>
                    <th className="py-3.5 px-6">이메일 & 연락처</th>
                    <th className="py-3.5 px-6">가입 일자</th>
                    <th className="py-3.5 px-6">참여 모임 수</th>
                    <th className="py-3.5 px-6 text-right">상세 참여 내역</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.map((user) => {
                    const userRSVPs = getMemberRSVPs(user);
                    const isAdmin = user.role === 'admin';

                    return (
                      <tr key={user.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-500 font-bold">
                                  {user.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#19221C] flex items-center gap-1.5">
                                <span>{user.name}</span>
                                {isAdmin && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#172E22] text-white">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-stone-500 font-mono">@{user.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            user.gender === '여성'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : user.gender === '남성'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {user.gender || '미입력'}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-stone-700 font-mono text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && user.phone !== '미등록' && (
                            <div className="text-stone-500 text-[11px] font-mono mt-0.5 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="text-stone-700 font-medium flex items-center gap-1 text-[11px]">
                            <CalendarDays className="w-3 h-3 text-stone-400" />
                            <span>{user.createdAt}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            userRSVPs.length > 0 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-stone-100 text-stone-500'
                          }`}>
                            {userRSVPs.length}개 모임 참여
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedMemberForDetail(user)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#DF612D]/10 hover:bg-[#DF612D]/20 text-[#DF612D] font-bold text-xs transition-colors cursor-pointer"
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
            <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#19221C] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>페이지뷰(PV) 분석 및 트래픽 현황</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  당일(오늘), 일간, 월간 누적 및 일평균 페이지뷰와 방문자 행동 흐름을 실시간으로 확인합니다.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center bg-[#F4F0E5] p-1 rounded-xl border border-stone-200 text-xs">
                  <button
                    onClick={() => setAnalyticsPeriod('daily')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      analyticsPeriod === 'daily'
                        ? 'bg-white text-[#19221C] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    일간 통계 (Daily)
                  </button>
                  <button
                    onClick={() => setAnalyticsPeriod('monthly')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                      analyticsPeriod === 'monthly'
                        ? 'bg-white text-[#19221C] shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    월간 통계 (Monthly)
                  </button>
                </div>

                <button
                  onClick={() => setLivePVBoost((prev) => prev + Math.floor(Math.random() * 5 + 3))}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
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
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">당일 페이지뷰 (오늘)</span>
                  <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#19221C]">
                  {todayPVDisplay.toLocaleString()} <span className="text-base font-semibold text-stone-500">회</span>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">오늘 순방문자(UV)</span>
                  <span className="font-bold text-[#19221C]">{(Math.round(todayPVDisplay * 0.62)).toLocaleString()}명</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-stone-500">전일(1,317회) 대비</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +8.4% 상승
                  </span>
                </div>
              </div>

              {/* Metric 2: 선택 기간 총 페이지뷰 */}
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">조회 기간 총 페이지뷰</span>
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-[#2D6A4F] flex items-center justify-center font-bold">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#19221C]">
                  {totalFilteredPV.toLocaleString()} <span className="text-base font-semibold text-stone-500">회</span>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">조회 일수</span>
                  <span className="font-bold text-stone-800">{displayRecords.length}일간 집계</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-stone-500">기간 최고 일간 PV</span>
                  <span className="font-bold text-[#DF612D]">{maxFilteredPV.toLocaleString()}회</span>
                </div>
              </div>

              {/* Metric 3: 조회 기간 일평균 페이지뷰 */}
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">일평균 페이지뷰 (평균 PV)</span>
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#1E4E79] flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#19221C]">
                  {avgFilteredPV.toLocaleString()} <span className="text-base font-semibold text-stone-500">회/일</span>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">주말 일평균 PV</span>
                  <span className="font-bold text-[#DF612D]">
                    {Math.round(
                      (displayRecords.filter((r) => r.isWeekend).reduce((s, r) => s + r.pv, 0) || 1680) /
                        Math.max(displayRecords.filter((r) => r.isWeekend).length, 1)
                    ).toLocaleString()}회/일
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-stone-500">평일 일평균 PV</span>
                  <span className="font-bold text-[#19221C]">
                    {Math.round(
                      (displayRecords.filter((r) => !r.isWeekend).reduce((s, r) => s + r.pv, 0) || 1120) /
                        Math.max(displayRecords.filter((r) => !r.isWeekend).length, 1)
                    ).toLocaleString()}회/일
                  </span>
                </div>
              </div>

              {/* Metric 4: 월간 누적 페이지뷰 */}
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">월간 페이지뷰 (11월 누적)</span>
                  <div className="w-9 h-9 rounded-2xl bg-orange-50 text-[#DF612D] flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#19221C]">
                  {(38420 + livePVBoost).toLocaleString()} <span className="text-base font-semibold text-stone-500">회</span>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">월간 누적 순방문자</span>
                  <span className="font-bold text-[#19221C]">24,190명</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-stone-500">전월 동기 대비</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +15.2% 성장
                  </span>
                </div>
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="bg-[#FAF7F0] p-6 rounded-3xl border border-[#E2D8C3] shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE1D1] pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#19221C] flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#2D6A4F]" />
                    <span>페이지뷰 조회 기간 선택</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    원하는 조회 기간을 선택하면 하단의 선 그래프와 상세 통계 테이블이 실시간으로 집계됩니다.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-stone-500 font-medium mr-1">빠른 선택:</span>
                  {[
                    { label: '최근 7일', start: '2026-10-30', end: '2026-11-05' },
                    { label: '최근 14일', start: '2026-10-23', end: '2026-11-05' },
                    { label: '최근 30일', start: '2026-10-07', end: '2026-11-05' },
                    { label: '11월 전체', start: '2026-11-01', end: '2026-11-05' },
                    { label: '10월 전체', start: '2026-10-01', end: '2026-10-31' },
                  ].map((preset) => {
                    const isActive = chartStartDate === preset.start && chartEndDate === preset.end;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setChartStartDate(preset.start);
                          setChartEndDate(preset.end);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#172E22] text-white shadow-xs'
                            : 'bg-white border border-[#E0D8C8] text-stone-700 hover:bg-[#F3EFE6]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Inputs + Summary Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-44">
                    <label className="block text-[11px] text-stone-500 mb-1">시작일</label>
                    <input
                      type="date"
                      value={chartStartDate}
                      onChange={(e) => setChartStartDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                  <span className="text-stone-400 font-bold self-end pb-2">~</span>
                  <div className="w-full sm:w-44">
                    <label className="block text-[11px] text-stone-500 mb-1">종료일</label>
                    <input
                      type="date"
                      value={chartEndDate}
                      onChange={(e) => setChartEndDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-wrap items-center gap-3 text-xs bg-white px-4 py-2.5 rounded-2xl border border-[#E0D8C8]">
                  <span className="text-stone-500">
                    조회 기간: <strong className="text-stone-800">{displayRecords.length}일간</strong>
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="text-stone-500">
                    기간 합계: <strong className="text-[#19221C]">{totalFilteredPV.toLocaleString()} PV</strong>
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="text-stone-500">
                    일평균: <strong className="text-[#DF612D]">{avgFilteredPV.toLocaleString()} PV/일</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Trend Chart (선 그래프: SVG Line Chart) */}
            <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#19221C] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#DF612D]" />
                    <span>페이지뷰 추이 선 그래프 (Line Chart)</span>
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    선택 기간({chartStartDate} ~ {chartEndDate}) 동안의 일간 페이지뷰 추이를 곡선 그래프로 제공합니다. 데이터 포인트에 마우스를 올리면 상세 정보를 확인할 수 있습니다.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#DF612D] inline-block" /> 일간 PV 추이선
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#172E22]" /> 평일
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#DF612D]" /> 주말
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 ring-2 ring-purple-200" /> 오늘 (당일)
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
                  1200
                );
                const yMax = Math.ceil(rawMax / 500) * 500;

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
                              <stop offset="0%" stopColor="#DF612D" stopOpacity="0.28" />
                              <stop offset="60%" stopColor="#DF612D" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#DF612D" stopOpacity="0.0" />
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
                                  stroke="#E8E2D5"
                                  strokeDasharray="4 4"
                                  strokeWidth="1"
                                />
                                <text
                                  x={padL - 10}
                                  y={y + 4}
                                  textAnchor="end"
                                  fontSize="10"
                                  fontWeight="600"
                                  fill="#8C827A"
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
                              stroke="#DF612D"
                              strokeWidth="3.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}

                          {/* Data points & X-axis dates */}
                          {points.map((pt) => {
                            const isHovered = hoveredPointIndex === pt.index;
                            const dotColor = pt.isToday
                              ? '#9333EA'
                              : pt.isWeekend
                              ? '#DF612D'
                              : '#172E22';

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
                                    stroke="#9333EA"
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
                                  stroke="#FFFFFF"
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
                                  fontWeight={isHovered || pt.isToday ? '800' : '600'}
                                  fill={pt.isToday ? '#7E22CE' : '#19221C'}
                                >
                                  {pt.effectivePV.toLocaleString()}
                                </text>

                                {/* X-axis Date Label */}
                                <text
                                  x={pt.x}
                                  y={padT + plotH + 20}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight={pt.isToday ? '700' : '500'}
                                  fill={
                                    pt.isToday
                                      ? '#7E22CE'
                                      : pt.isWeekend
                                      ? '#C85524'
                                      : '#6B7280'
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
                      <div className="mt-2 p-3 bg-[#FAF7F0] border border-[#E4DCcc] rounded-2xl flex flex-wrap items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#DF612D]" />
                          <span className="font-bold text-[#19221C]">
                            {points[hoveredPointIndex].fullDate}
                          </span>
                          {points[hoveredPointIndex].isToday && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                              오늘 당일
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-stone-700">
                          <span>
                            페이지뷰: <strong className="text-[#DF612D] font-extrabold">{points[hoveredPointIndex].effectivePV.toLocaleString()}회</strong>
                          </span>
                          <span>
                            순방문자: <strong className="text-stone-900 font-bold">{points[hoveredPointIndex].uv.toLocaleString()}명</strong>
                          </span>
                          <span>
                            모임조회: <strong className="text-stone-900 font-bold">{points[hoveredPointIndex].detailViews.toLocaleString()}회</strong>
                          </span>
                          <span>
                            세션당 PV: <strong className="text-stone-900 font-bold">{points[hoveredPointIndex].pps}페이지</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Detailed Table (Daily or Monthly) */}
            <div className="bg-white rounded-3xl border border-[#E0D8C8] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-[#19221C]">
                    {analyticsPeriod === 'daily' ? '일자별 일간 페이지뷰 상세 내역' : '월별 페이지뷰 및 성장 추이'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {analyticsPeriod === 'daily'
                      ? `선택 기간(${chartStartDate} ~ ${chartEndDate}, 총 ${displayRecords.length}일)의 페이지뷰 및 방문자 데이터입니다.`
                      : '최근 5개월간의 월별 총 페이지뷰 및 전월 대비 성장률'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#F4F0E5] font-semibold text-stone-700">
                    {analyticsPeriod === 'daily' ? `${displayRecords.length}일 데이터` : '2026 하반기 집계'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8F5EE] border-b border-stone-200 text-stone-600 font-semibold">
                      <th className="py-3.5 px-6">{analyticsPeriod === 'daily' ? '날짜 / 요일' : '연도 / 월'}</th>
                      <th className="py-3.5 px-6">페이지뷰 (PV)</th>
                      <th className="py-3.5 px-6">순방문자 (UV)</th>
                      <th className="py-3.5 px-6">모임 상세 조회수</th>
                      <th className="py-3.5 px-6">세션당 평균 PV</th>
                      <th className="py-3.5 px-6 text-right">구분</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {analyticsPeriod === 'daily' ? (
                      [...displayRecords]
                        .reverse()
                        .map((row) => {
                          const effectivePV = row.pv + (row.isToday ? livePVBoost : 0);

                          return (
                            <tr
                              key={row.date}
                              className={`hover:bg-stone-50/80 transition-colors ${
                                row.isToday ? 'bg-purple-50/40 font-semibold' : ''
                              }`}
                            >
                              <td className="py-4 px-6 flex items-center gap-2">
                                {row.isToday && (
                                  <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                                )}
                                <span className={row.isToday ? 'text-purple-900 font-bold' : 'text-stone-800'}>
                                  {row.fullDate}
                                </span>
                                {row.isToday && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 font-bold">
                                    오늘
                                  </span>
                                )}
                                {row.isWeekend && !row.isToday && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 font-bold">
                                    주말
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-6 font-bold text-[#19221C]">
                                {effectivePV.toLocaleString()}회
                              </td>
                              <td className="py-4 px-6 text-stone-600">{row.uv.toLocaleString()}명</td>
                              <td className="py-4 px-6 text-stone-600">{row.detailViews.toLocaleString()}회</td>
                              <td className="py-4 px-6 text-stone-600">{row.pps}페이지</td>
                              <td className="py-4 px-6 text-right">
                                {row.isToday ? (
                                  <span className="inline-block text-[11px] px-2.5 py-1 rounded-lg font-bold bg-purple-100 text-purple-700">
                                    당일 실시간
                                  </span>
                                ) : row.isWeekend ? (
                                  <span className="inline-block text-[11px] px-2.5 py-1 rounded-lg font-bold bg-orange-100 text-[#DF612D]">
                                    주말 피크
                                  </span>
                                ) : (
                                  <span className="inline-block text-[11px] px-2.5 py-1 rounded-lg font-semibold bg-stone-100 text-stone-600">
                                    평일
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      [
                        { date: '2026년 11월 (진행중)', pv: 38420 + livePVBoost, uv: 24190, detailViews: 12450, pps: 3.3, growth: '+15.2%', isUp: true },
                        { date: '2026년 10월', pv: 41200, uv: 26450, detailViews: 13180, pps: 3.2, growth: '+15.1%', isUp: true },
                        { date: '2026년 09월', pv: 35800, uv: 22300, detailViews: 11400, pps: 3.1, growth: '+13.7%', isUp: true },
                        { date: '2026년 08월', pv: 31500, uv: 19800, detailViews: 9980, pps: 3.0, growth: '+22.1%', isUp: true },
                        { date: '2026년 07월', pv: 25800, uv: 16200, detailViews: 8120, pps: 2.9, growth: '기준월', isUp: false }
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-4 px-6 font-bold text-[#19221C]">{row.date}</td>
                          <td className="py-4 px-6 font-bold text-[#19221C]">{row.pv.toLocaleString()}회</td>
                          <td className="py-4 px-6 text-stone-600">{row.uv.toLocaleString()}명</td>
                          <td className="py-4 px-6 text-stone-600">{row.detailViews.toLocaleString()}회</td>
                          <td className="py-4 px-6 text-stone-600">{row.pps}페이지</td>
                          <td className="py-4 px-6 text-right">
                            <span className={`inline-flex items-center gap-0.5 font-bold ${row.isUp ? 'text-emerald-600' : 'text-stone-500'}`}>
                              {row.isUp && <TrendingUp className="w-3 h-3" />}
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
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-sm text-[#19221C] flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-[#2D6A4F]" />
                    <span>주요 페이지별 PV 점유율</span>
                  </h3>
                  <span className="text-xs text-stone-500">11월 기준</span>
                </div>

                <div className="space-y-3 text-xs">
                  {[
                    { name: '모임 둘러보기 및 홈 (Explore & Home)', share: 48, pv: 18441, color: 'bg-[#172E22]' },
                    { name: '모임 상세 안내 및 도서 정보 (Club Detail)', share: 32, pv: 12294, color: 'bg-[#DF612D]' },
                    { name: '참가 신청서 작성 및 결제창 (RSVP & Pay)', share: 12, pv: 4610, color: 'bg-emerald-600' },
                    { name: '마이페이지 및 회원 관리 (MyPage & Profile)', share: 8, pv: 3075, color: 'bg-blue-600' }
                  ].map((p, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between font-medium">
                        <span className="text-[#19221C]">{p.name}</span>
                        <span className="font-bold text-stone-800">{p.share}% ({p.pv.toLocaleString()} PV)</span>
                      </div>
                      <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.share}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Peak & Behavior */}
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8C8] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-sm text-[#19221C] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#DF612D]" />
                    <span>시간대별 유입 피크 & 접속 환경</span>
                  </h3>
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    실시간 14명 접속 중
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-[#FAF7F0] rounded-2xl border border-[#EAE3D4]">
                    <div className="font-bold text-[#19221C] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>저녁 독서 골든타임 (19:00 ~ 23:00)</span>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-[11px]">
                      하루 중 전체 페이지뷰의 <strong>45%</strong>가 저녁 7시부터 11시 사이에 발생하며, 이 시간대에 모임 신청 전환율이 가장 높습니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] text-stone-500 block">모바일 접속</span>
                      <strong className="text-sm font-bold text-[#19221C]">68%</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] text-stone-500 block">PC 웹 접속</span>
                      <strong className="text-sm font-bold text-[#19221C]">28%</strong>
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                      <span className="text-[11px] text-stone-500 block">태블릿 접속</span>
                      <strong className="text-sm font-bold text-[#19221C]">4%</strong>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-[#172E22] text-white relative">
              <button
                onClick={() => setSelectedMemberForDetail(null)}
                className="absolute top-5 right-5 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center shrink-0">
                  {selectedMemberForDetail.avatar ? (
                    <img
                      src={selectedMemberForDetail.avatar}
                      alt={selectedMemberForDetail.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold">{selectedMemberForDetail.name.charAt(0)}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">{selectedMemberForDetail.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-mono">
                      @{selectedMemberForDetail.username}
                    </span>
                  </div>
                  <div className="text-xs text-stone-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>성별: <strong className="text-white">{selectedMemberForDetail.gender || '미입력'}</strong></span>
                    <span>이메일: <strong className="font-mono text-white">{selectedMemberForDetail.email}</strong></span>
                    <span>가입일자: <strong className="text-white">{selectedMemberForDetail.createdAt}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Participation History */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-[#19221C] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#DF612D]" />
                  <span>그동안 참여 및 신청한 독서모임 히스토리</span>
                </h4>
                <span className="text-xs font-semibold text-stone-500">
                  총 {getMemberRSVPs(selectedMemberForDetail).length}건
                </span>
              </div>

              {getMemberRSVPs(selectedMemberForDetail).length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                  <p className="text-xs text-stone-500">아직 신청 및 참여한 모임 기록이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getMemberRSVPs(selectedMemberForDetail).map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-[#FCFAF6] hover:border-[#DF612D]/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] font-bold text-[#DF612D] uppercase tracking-wide">
                            신청일시: {r.registeredAt}
                          </span>
                          <h5 className="font-bold text-sm text-[#19221C] mt-0.5">
                            《{r.bookTitle}》 {r.author}
                          </h5>
                          <p className="text-xs text-stone-600 mt-0.5">{r.clubTitle}</p>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {r.status === 'confirmed' ? '참여 확정 (결제 완료)' : '신청 취소됨'}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-stone-200/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>모임 일시: <strong>{r.dateTime}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>장소: {r.venueName}{r.venueAddress ? ` (${r.venueAddress})` : ''}</span>
                        </div>
                        {r.paymentMethod && (
                          <div className="flex items-center gap-2 text-emerald-700">
                            <CreditCard className="w-3 h-3 text-emerald-600" />
                            <span>결제 수단: <strong>{r.paymentMethod}</strong> (CAD ${r.paymentAmountCAD || 15})</span>
                          </div>
                        )}
                        {r.userNotes && (
                          <div className="mt-1.5 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900">
                            <span className="font-semibold">작성한 독서 메모: </span>
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
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedMemberForDetail(null)}
                className="px-5 py-2 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CLUB APPLICANTS ROSTER MODAL (Auto-recorded from payment) */}
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
                className="absolute top-5 right-5 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10"
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
                      신청 상태: {selectedClubForApplicants.status === 'open' ? '모집중' : selectedClubForApplicants.status === 'almost_full' ? '마감임박' : '마감'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{selectedClubForApplicants.bookTitle} 신청자 명단</h3>
                  <p className="text-xs text-stone-300 mt-0.5">{selectedClubForApplicants.title}</p>
                  <p className="text-[11px] text-stone-400 mt-1">
                    {selectedClubForApplicants.dateTime} · {selectedClubForApplicants.venueName}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body: Applicants List */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Notification & Minimum Threshold Banner */}
              <div className="p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#19221C]">진행 알림 시스템:</span>
                    {selectedClubForApplicants.currentSeats >= 4 ? (
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
                    className="px-3.5 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#23533E] text-white text-xs font-bold cursor-pointer shrink-0 transition-colors shadow-xs"
                  >
                    📢 진행 확정 알림 전체 재발송
                  </button>
                )}
              </div>

              {broadcastNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{broadcastNotice}</span>
                </div>
              )}

              {getClubRSVPs(selectedClubForApplicants.id).length === 0 ? (
                <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                  <Users className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-xs text-stone-600 font-semibold">아직 이 모임에 신청한 회원이 없습니다.</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">회원들이 결제를 완료하면 자동으로 여기에 정보가 기록됩니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getClubRSVPs(selectedClubForApplicants.id).map((applicant, idx) => (
                    <div
                      key={applicant.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-[#FCFAF6] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#DF612D]/10 text-[#DF612D] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#19221C]">{applicant.participantName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              applicant.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {applicant.status === 'confirmed' ? '결제 및 신청 승인' : '취소됨'}
                            </span>
                          </div>

                          <div className="text-xs text-stone-500 font-mono mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>📧 {applicant.email}</span>
                            <span>📞 {applicant.phone}</span>
                            <span>📅 신청일: {applicant.registeredAt}</span>
                          </div>

                          <div className="mt-1.5 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
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
                            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            신청 취소 처리
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateRSVPStatus(applicant.id, 'confirmed')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
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
            <div className="p-4 bg-stone-100 border-t border-stone-200 flex justify-end">
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
