import React, { useState } from 'react';
import { 
  X, User, Mail, Phone, Calendar, Clock, MapPin, 
  BookOpen, ShieldCheck, KeyRound, CheckCircle2, 
  AlertCircle, ExternalLink, CalendarPlus, 
  Lock, Save, RefreshCw, Crown, Sparkles, Receipt, Trash2
} from 'lucide-react';
import { User as UserType, RSVPRecord, BookClub } from '../types';

interface MyPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  rsvps: RSVPRecord[];
  allClubs: BookClub[];
  onUpdateUser: (updatedUser: UserType) => void;
  onCancelRSVP: (rsvpId: string, clubId: string) => void;
  onSaveNote: (rsvpId: string, notes: string) => void;
  onSelectClubDetail: (club: BookClub) => void;
  onExploreClubs: () => void;
}

export const MyPageModal: React.FC<MyPageModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  rsvps,
  allClubs,
  onUpdateUser,
  onCancelRSVP,
  onSaveNote,
  onSelectClubDetail,
  onExploreClubs
}) => {
  if (!isOpen || !currentUser) return null;

  // Active Tab: 'clubs' (신청 및 참여 모임) | 'profile' (개인정보)
  const [activeTab, setActiveTab] = useState<'clubs' | 'profile'>('clubs');
  
  // Clubs filter: 'all' | 'confirmed' | 'cancelled'
  const [clubFilter, setClubFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  // Profile Form State
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password Change Form State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Filtered RSVPs for this user
  const userRsvps = rsvps.filter(
    (r) =>
      r.userId === currentUser.id ||
      r.email.toLowerCase() === currentUser.email.toLowerCase() ||
      r.participantName === currentUser.name
  );

  const confirmedRsvps = userRsvps.filter((r) => r.status === 'confirmed');
  const cancelledRsvps = userRsvps.filter((r) => r.status === 'cancelled');

  const displayedRsvps = clubFilter === 'confirmed' 
    ? confirmedRsvps 
    : clubFilter === 'cancelled' 
      ? cancelledRsvps 
      : userRsvps;

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    if (!name.trim()) {
      setProfileError('이름을 입력해주세요.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setProfileError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    if (!phone.trim()) {
      setProfileError('연락처(전화번호)는 필수 입력사항입니다.');
      return;
    }

    const updated: UserType = {
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim()
    };

    onUpdateUser(updated);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  // Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPasswordInput) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (currentUser.password && currentPasswordInput !== currentUser.password) {
      setPasswordError('현재 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const updated: UserType = {
      ...currentUser,
      password: newPasswordInput
    };

    onUpdateUser(updated);
    setPasswordSuccess(true);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setTimeout(() => setPasswordSuccess(false), 3500);
  };

  // Google Calendar Link generator
  const createGoogleCalendarUrl = (rsvp: RSVPRecord) => {
    const title = encodeURIComponent(`[리도라] ${rsvp.bookTitle} 독서모임`);
    const venueText = rsvp.venueAddress ? `${rsvp.venueName} (${rsvp.venueAddress})` : rsvp.venueName;
    const details = encodeURIComponent(
      `리도라(Readora) 독서모임\\n도서: ${rsvp.bookTitle} (${rsvp.author})\\n장소: ${venueText}`
    );
    const location = encodeURIComponent(rsvp.venueAddress ? `${rsvp.venueName}, ${rsvp.venueAddress}` : rsvp.venueName);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-[#F4F0E5] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8DFCE] my-auto sm:my-6 overflow-hidden max-h-[94dvh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#172E22] text-white flex items-center justify-between border-b border-[#2D4536] shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">마이페이지</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 bg-white border-b border-[#E0D8C8] flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`py-3 sm:py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clubs'
                ? 'border-[#DF612D] text-[#DF612D]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>신청 및 참여 모임 ({userRsvps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 sm:py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'border-[#DF612D] text-[#DF612D]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>개인정보</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: CLUBS HISTORY */}
          {activeTab === 'clubs' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#DDD4C3] text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => setClubFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      clubFilter === 'all'
                        ? 'bg-[#172E22] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    전체 ({userRsvps.length})
                  </button>
                  <button
                    onClick={() => setClubFilter('confirmed')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      clubFilter === 'confirmed'
                        ? 'bg-[#2D6A4F] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    진행 예정 ({confirmedRsvps.length})
                  </button>
                  <button
                    onClick={() => setClubFilter('cancelled')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      clubFilter === 'cancelled'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    취소/환불 ({cancelledRsvps.length})
                  </button>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onExploreClubs();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DF612D] hover:underline cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>새로운 모임 찾아보기 &rarr;</span>
                </button>
              </div>

              {/* Clubs List */}
              {displayedRsvps.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[#E0D8C8] my-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FDEEE3] text-[#DF612D] flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-[#19221C] mb-1">
                    {clubFilter === 'cancelled' 
                      ? '취소되거나 환불된 모임 내역이 없습니다.' 
                      : clubFilter === 'confirmed' 
                        ? '현재 참여 예정인 모임이 없습니다.' 
                        : '아직 신청한 독서모임 내역이 없습니다.'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5 leading-relaxed">
                    캘거리 전역에서 열리는 관심 있는 모임을 확인하고 이웃들과 따뜻한 독서 시간을 함께해보세요.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onExploreClubs();
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    캘거리 모임 둘러보기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedRsvps.map((rsvp) => {
                    const originalClub = allClubs.find((c) => c.id === rsvp.clubId);
                    const isCancelled = rsvp.status === 'cancelled' || originalClub?.status === 'cancelled';
                    const isMinThresholdMet = (originalClub?.currentSeats || 0) >= 4;

                    return (
                      <div
                        key={rsvp.id}
                        className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all overflow-hidden ${
                          isCancelled
                            ? 'border-red-200 bg-red-50/20'
                            : 'border-[#E0D8C8] shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b border-stone-100 w-full min-w-0">
                          <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0 flex-1">
                            <img
                              src={rsvp.coverImage}
                              alt={rsvp.bookTitle}
                              className="w-14 sm:w-16 h-20 sm:h-22 object-cover rounded-xl shadow-xs shrink-0 bg-stone-100"
                            />
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                                {isCancelled ? (
                                  <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full shrink-0">
                                    취소됨 • 100% 전액 환불 완료
                                  </span>
                                ) : isMinThresholdMet ? (
                                  <span className="text-[10px] font-bold bg-[#E8F2E8] text-[#2D6A4F] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                    <CheckCircle2 className="w-3 h-3" />
                                    진행 확정 (최소 4명 충족)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    최소 인원(4명) 모집 중
                                  </span>
                                )}
                                <span className="text-[10px] sm:text-[11px] text-stone-400 shrink-0">
                                  {rsvp.registeredAt}
                                </span>
                              </div>

                              <h4 className="text-sm sm:text-base font-bold text-[#19221C] truncate block w-full">
                                {rsvp.bookTitle}
                              </h4>
                              <p className="text-xs text-stone-500 mt-0.5 truncate block w-full">
                                저자: {rsvp.author} {originalClub?.category ? `• ${originalClub.category}` : ''}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-stone-600 mt-1.5 min-w-0 w-full">
                                <span className="flex items-center gap-1 shrink-0">
                                  <Calendar className="w-3.5 h-3.5 text-[#DF612D]" />
                                  <strong>{rsvp.dateTime}</strong>
                                </span>
                                <span className="flex items-center gap-1 min-w-0 truncate max-w-full">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                  <span className="truncate">{rsvp.venueName}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex sm:block items-baseline justify-between sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                            <span className="text-[11px] text-stone-400 block sm:mb-0.5">결제 금액</span>
                            <span className={`text-base font-black ${isCancelled ? 'line-through text-stone-400' : 'text-[#DF612D]'}`}>
                              CAD ${rsvp.paymentAmountCAD || originalClub?.feeCAD || 15}
                            </span>
                            {rsvp.paymentMethod && (
                              <span className="text-[10px] text-stone-500 hidden sm:block mt-0.5">
                                {rsvp.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 flex-wrap">
                          {originalClub && (
                            <button
                              onClick={() => {
                                onClose();
                                onSelectClubDetail(originalClub);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              모임 상세
                            </button>
                          )}

                          {!isCancelled && (
                            <>
                              <a
                                href={createGoogleCalendarUrl(rsvp)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                                <span>캘린더 등록</span>
                              </a>

                              <button
                                onClick={() => {
                                  if (window.confirm(`'${rsvp.bookTitle}' 모임 신청을 취소하시겠습니까? 결제하신 참가비는 전액 자동 환불됩니다.`)) {
                                    onCancelRSVP(rsvp.id, rsvp.clubId);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>신청 취소</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE VIEW & EDIT */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
              {/* Account Summary Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E0D8C8] shadow-xs flex items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#DF612D] to-amber-500 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-sm shrink-0">
                  {name.slice(0, 1) || 'C'}
                </div>
                <div className="space-y-0.5 sm:space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base sm:text-lg font-bold text-[#19221C] truncate">{name}</h4>
                    <span className="text-xs text-stone-400">(@{currentUser.username})</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-500 truncate">
                    가입일: <strong>{currentUser.createdAt || '2026년 11월'}</strong> • 회원 상태: <span className="text-emerald-700 font-bold">정상 (인증완료)</span>
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E0D8C8] shadow-xs space-y-4 text-xs">
                <h4 className="text-sm font-bold text-[#19221C] flex items-center gap-2 border-b border-stone-100 pb-3">
                  <User className="w-4 h-4 text-[#DF612D]" />
                  <span>기본 개인정보 열람 및 수정</span>
                </h4>

                {profileError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                    {profileError}
                  </div>
                )}

                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>개인정보가 성공적으로 변경 및 저장되었습니다!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      아이디 (ID) <span className="text-stone-400 font-normal">(변경 불가)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.username}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-500 cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      이름 (성함) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="성함을 입력하세요"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#DF612D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      가입 이메일 * (모임 확정 및 취소 알림 수신)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#DF612D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      연락처 (전화번호) * <span className="text-red-500">(필수 입력사항)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="예: 403-123-4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#DF612D]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl bg-[#DF612D] hover:bg-[#c95221] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>개인정보 변경사항 저장</span>
                  </button>
                </div>
              </form>

              {/* Password & Security Card inside Personal Info tab */}
              <form onSubmit={handleChangePassword} className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E0D8C8] shadow-xs space-y-4 text-xs">
                <h4 className="text-sm font-bold text-[#19221C] flex items-center gap-2 border-b border-stone-100 pb-3">
                  <KeyRound className="w-4 h-4 text-[#DF612D]" />
                  <span>비밀번호 및 보안 관리</span>
                </h4>

                {passwordError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>비밀번호가 안전하게 변경되었습니다.</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    현재 비밀번호 *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#DF612D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      새 비밀번호 * (최소 6자 이상)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="새로운 비밀번호를 입력하세요"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#DF612D]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      새 비밀번호 확인 *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F5EE] border border-stone-300 text-stone-900 focus:outline-none focus:border-[#DF612D]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-xl bg-[#172E22] hover:bg-[#234332] active:scale-[0.98] text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>비밀번호 변경 완료</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-t border-[#EAE2D2] flex items-center justify-between shrink-0">
          <span className="text-[11px] sm:text-xs text-stone-500 truncate">
            리도라 (Readora) • 북클럽 커뮤니티
          </span>
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer transition-colors shrink-0 ml-2"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
