import React, { useEffect, useState } from 'react';
import { 
  X, User, Mail, Phone, Calendar, Clock, MapPin, 
  BookOpen, ShieldCheck, KeyRound, CheckCircle2, 
  AlertCircle, ExternalLink, CalendarPlus, 
  Lock, Save, RefreshCw, Crown, Sparkles, Receipt, Trash2
} from 'lucide-react';
import { User as UserType, RSVPRecord, BookClub } from '../types';
import { changeOwnSupabasePassword, updateOwnSupabaseProfile } from '../lib/supabaseAuth';
import {
  formatBirthDateKorean,
  getBirthDayOptions,
  getBirthMonthOptions,
  getBirthYearOptions,
  parseBirthDateParts,
  validateBirthDateParts,
} from '../utils/birthDate';

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
  // Active Tab: 'clubs' (신청 및 참여 모임) | 'profile' (개인정보)
  const [activeTab, setActiveTab] = useState<'clubs' | 'profile'>('clubs');
  
  // Clubs filter: 'all' | 'confirmed' | 'cancelled'
  const [clubFilter, setClubFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthDateError, setBirthDateError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [confirmCancelRsvpId, setConfirmCancelRsvpId] = useState<string | null>(null);

  // Password Change Form State
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
      const parsedBirth = parseBirthDateParts(currentUser.birthDate);
      setBirthYear(parsedBirth.year);
      setBirthMonth(parsedBirth.month);
      setBirthDay(parsedBirth.day);
      setBirthDateError('');
      setProfileError('');
      setProfileSaveSuccess(false);
      setPasswordError('');
      setPasswordSuccess(false);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const email = currentUser.email;

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

  const hasRegisteredBirthDate = Boolean(
    currentUser.birthDate && parseBirthDateParts(currentUser.birthDate).year
  );
  const birthYearOptions = getBirthYearOptions();
  const birthMonthOptions = getBirthMonthOptions();
  const birthDayOptions = getBirthDayOptions();

  // Save Profile Changes to Supabase profiles
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setBirthDateError('');
    setProfileSaveSuccess(false);

    if (!name.trim()) {
      setProfileError('이름을 입력해주세요.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setProfileError('올바른 연락처(전화번호)를 입력해주세요.');
      return;
    }

    let birthDateToSave: string | undefined;
    if (!hasRegisteredBirthDate) {
      const hasAnyBirthSelection = Boolean(birthYear || birthMonth || birthDay);
      const hasChangedNameOrPhone =
        name.trim() !== currentUser.name || phone.trim() !== (currentUser.phone || '');

      if (hasAnyBirthSelection || !hasChangedNameOrPhone) {
        const birthCheck = validateBirthDateParts(birthYear, birthMonth, birthDay);
        if (!birthCheck.valid || !birthCheck.formatted) {
          const msg = birthCheck.message || '생년월일을 입력해 주세요.';
          setBirthDateError(msg);
          setProfileError(msg);
          return;
        }
        birthDateToSave = birthCheck.formatted;
      }
    }

    setIsSavingProfile(true);
    try {
      const result = await updateOwnSupabaseProfile(
        currentUser.id,
        {
          name: name.trim(),
          phone: phone.trim(),
          ...(birthDateToSave ? { birthDate: birthDateToSave } : {}),
        },
        currentUser.email
      );

      if (!result.success || !result.user) {
        setProfileError(result.message || '개인정보 저장 중 오류가 발생했습니다.');
        return;
      }

      onUpdateUser(result.user);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password via Supabase Auth (re-authenticates current password, never stores plaintext password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPasswordInput) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }

    const hasEnglish = /[a-zA-Z]/.test(newPasswordInput);
    const hasNumber = /[0-9]/.test(newPasswordInput);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPasswordInput);

    if (
      newPasswordInput.length < 8 ||
      newPasswordInput.length > 16 ||
      !hasEnglish ||
      !hasNumber ||
      !hasSpecial
    ) {
      setPasswordError('새 비밀번호는 8~16자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changeOwnSupabasePassword({
        email: currentUser.email,
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      });

      if (!result.success) {
        setPasswordError(result.message || '비밀번호 변경에 실패했습니다.');
        return;
      }

      setPasswordSuccess(true);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => setPasswordSuccess(false), 3500);
    } finally {
      setIsChangingPassword(false);
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#191919]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#FBF9E9] rounded-2xl shadow-2xl border border-[#191919]/20 my-auto sm:my-6 overflow-hidden max-h-[94dvh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#191919] text-[#FBF9E9] flex items-center justify-between border-b border-[#191919] shrink-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-extrabold text-[#FBF9E9] tracking-tight">마이페이지</h3>
            <span className="font-display-en text-[10px] font-bold uppercase tracking-[0.14em] text-[#FFE57E]">
              MY PAGE
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-[#FFE57E] hover:text-[#191919] text-[#FBF9E9] transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 sm:px-6 bg-[#FFFDF4] border-b border-[#191919]/15 flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('clubs')}
            className={`py-3 sm:py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clubs'
                ? 'border-[#191919] text-[#191919]'
                : 'border-transparent text-[#191919]/50 hover:text-[#191919]'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeTab === 'clubs' ? 'text-[#F16B47]' : ''}`} />
            <span>신청 및 참여 모임 ({userRsvps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 sm:py-3.5 px-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'border-[#191919] text-[#191919]'
                : 'border-transparent text-[#191919]/50 hover:text-[#191919]'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#F16B47]' : ''}`} />
            <span>개인정보</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {/* TAB 1: CLUBS HISTORY */}
          {activeTab === 'clubs' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Filter Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1 bg-[#FFFDF4] p-1 rounded-xl border border-[#191919]/15 text-xs overflow-x-auto no-scrollbar w-full sm:w-auto">
                  <button
                    onClick={() => setClubFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      clubFilter === 'all'
                        ? 'bg-[#191919] text-[#FFE57E]'
                        : 'text-[#191919]/65 hover:text-[#191919]'
                    }`}
                  >
                    전체 ({userRsvps.length})
                  </button>
                  <button
                    onClick={() => setClubFilter('confirmed')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      clubFilter === 'confirmed'
                        ? 'bg-[#FFE57E] text-[#191919]'
                        : 'text-[#191919]/65 hover:text-[#191919]'
                    }`}
                  >
                    진행 예정 ({confirmedRsvps.length})
                  </button>
                  <button
                    onClick={() => setClubFilter('cancelled')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      clubFilter === 'cancelled'
                        ? 'bg-[#F16B47] text-white'
                        : 'text-[#191919]/65 hover:text-[#191919]'
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F16B47] hover:underline cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>새로운 모임 찾아보기 &rarr;</span>
                </button>
              </div>

              {/* Clubs List */}
              {displayedRsvps.length === 0 ? (
                <div className="bg-[#FFFDF4] rounded-2xl p-12 text-center border border-[#191919]/15 my-4">
                  <div className="w-14 h-14 rounded-xl bg-[#FFE57E] text-[#191919] border border-[#191919]/15 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-extrabold text-[#191919] mb-1">
                    {clubFilter === 'cancelled'
                      ? '취소되거나 환불된 모임 내역이 없습니다.'
                      : clubFilter === 'confirmed'
                        ? '현재 참여 예정인 모임이 없습니다.'
                        : '아직 신청한 독서모임 내역이 없습니다.'}
                  </h4>
                  <p className="text-xs text-[#191919]/65 max-w-sm mx-auto mb-5 leading-relaxed">
                    캘거리 전역에서 열리는 관심 있는 모임을 확인하고 이웃들과 따뜻한 독서 시간을 함께해보세요.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onExploreClubs();
                    }}
                    className="px-5 py-2.5 rounded-lg bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 text-xs font-bold transition-colors cursor-pointer"
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
                        className={`bg-[#FFFDF4] rounded-2xl p-4 sm:p-5 border transition-all overflow-hidden ${
                          isCancelled
                            ? 'border-[#F16B47]/40 bg-[#F16B47]/5'
                            : 'border-[#191919]/15'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b border-[#191919]/10 w-full min-w-0">
                          <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0 flex-1">
                            <img
                              src={rsvp.coverImage}
                              alt={rsvp.bookTitle}
                              referrerPolicy="no-referrer"
                              className="w-14 sm:w-16 h-20 sm:h-22 object-cover rounded-lg border border-[#191919]/15 shrink-0 bg-[#FBF9E9]"
                            />
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                                {isCancelled ? (
                                  <span className="text-[10px] font-bold bg-[#F16B47]/15 text-[#B93815] px-2 py-0.5 rounded-md shrink-0">
                                    취소됨 • 100% 전액 환불 완료
                                  </span>
                                ) : isMinThresholdMet ? (
                                  <span className="text-[10px] font-bold bg-[#B9D8E6]/60 text-[#191919] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    <CheckCircle2 className="w-3 h-3" />
                                    진행 확정 (최소 4명 충족)
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold bg-[#FFE57E] text-[#191919] px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    최소 인원(4명) 모집 중
                                  </span>
                                )}
                                <span className="text-[10px] sm:text-[11px] text-[#191919]/45 shrink-0">
                                  {rsvp.registeredAt}
                                </span>
                              </div>

                              <h4 className="text-sm sm:text-base font-extrabold text-[#191919] truncate block w-full">
                                {rsvp.bookTitle}
                              </h4>
                              <p className="text-xs text-[#191919]/60 mt-0.5 truncate block w-full">
                                저자: {rsvp.author} {originalClub?.category ? `• ${originalClub.category}` : ''}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-[#191919]/75 mt-1.5 min-w-0 w-full">
                                <span className="flex items-center gap-1 shrink-0">
                                  <Calendar className="w-3.5 h-3.5 text-[#F16B47]" />
                                  <strong>{rsvp.dateTime}</strong>
                                </span>
                                <span className="flex items-center gap-1 min-w-0 truncate max-w-full">
                                  <MapPin className="w-3.5 h-3.5 text-[#191919]/45 shrink-0" />
                                  <span className="truncate">{rsvp.venueName}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex sm:block items-baseline justify-between sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#191919]/10">
                            <span className="text-[11px] text-[#191919]/55 block sm:mb-0.5">결제 금액</span>
                            <span className={`text-base font-black tabular-nums ${isCancelled ? 'line-through text-[#191919]/40' : 'text-[#F16B47]'}`}>
                              CAD ${rsvp.paymentAmountCAD || originalClub?.feeCAD || 15}
                            </span>
                            {rsvp.paymentMethod && (
                              <span className="text-[10px] text-[#191919]/55 hidden sm:block mt-0.5">
                                {rsvp.paymentMethod}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions Bar */}
                        <div className="pt-3 flex items-center justify-end gap-2 flex-wrap">
                          {originalClub && (
                            <button
                              onClick={() => {
                                onClose();
                                onSelectClubDetail(originalClub);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#FBF9E9] hover:bg-[#FFE57E]/50 border border-[#191919]/15 text-[#191919] text-xs font-bold transition-colors cursor-pointer"
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
                                className="px-3 py-1.5 rounded-lg bg-[#B9D8E6]/40 hover:bg-[#B9D8E6]/70 border border-[#191919]/15 text-[#191919] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CalendarPlus className="w-3.5 h-3.5" />
                                <span>캘린더 등록</span>
                              </a>

                              {confirmCancelRsvpId === rsvp.id ? (
                                <div className="inline-flex flex-wrap items-center gap-1.5 bg-[#F16B47]/10 border border-[#F16B47]/35 px-2.5 py-1 rounded-lg max-w-full">
                                  <span className="text-[11px] font-bold text-[#B93815]">전액 환불 후 취소할까요?</span>
                                  <button
                                    onClick={() => {
                                      onCancelRSVP(rsvp.id, rsvp.clubId);
                                      setConfirmCancelRsvpId(null);
                                    }}
                                    className="px-2 py-0.5 rounded bg-[#F16B47] text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    취소 확정
                                  </button>
                                  <button
                                    onClick={() => setConfirmCancelRsvpId(null)}
                                    className="px-2 py-0.5 rounded bg-white border border-[#191919]/20 text-[#191919] text-[11px] font-semibold cursor-pointer"
                                  >
                                    유지
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmCancelRsvpId(rsvp.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#F16B47]/10 hover:bg-[#F16B47]/20 text-[#B93815] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>신청 취소</span>
                                </button>
                              )}
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
            <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5">
              {/* Account Summary Card */}
              <div className="bg-[#FFFDF4] rounded-2xl p-4 sm:p-6 border border-[#191919]/15 flex items-center gap-4 sm:gap-5">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#FFE57E] border border-[#191919]/20 text-[#191919] flex items-center justify-center font-black text-xl sm:text-2xl shrink-0">
                  {name.slice(0, 1) || 'C'}
                </div>
                <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base sm:text-lg font-extrabold text-[#191919] break-words">{name}</h4>
                    <span className="text-xs text-[#191919]/55 font-mono break-all">(@{currentUser.username})</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#191919]/65 leading-relaxed">
                    가입일: <strong>{currentUser.createdAt || '2026년 11월'}</strong> • 회원 상태: <span className="text-emerald-700 font-bold">정상 (인증완료)</span>
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveProfile} className="bg-[#FFFDF4] rounded-2xl p-4 sm:p-6 border border-[#191919]/15 space-y-4 text-xs">
                <h4 className="text-sm font-extrabold text-[#191919] flex items-center gap-2 border-b border-[#191919]/12 pb-3">
                  <User className="w-4 h-4 text-[#F16B47]" />
                  <span>기본 개인정보 열람 및 수정</span>
                </h4>

                {profileError && (
                  <div className="p-3 bg-[#F16B47]/10 text-[#B93815] rounded-xl border border-[#F16B47]/35 font-medium">
                    {profileError}
                  </div>
                )}

                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>개인정보가 성공적으로 변경 및 저장되었습니다!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#191919] mb-1">
                      아이디 (ID) <span className="text-[#191919]/45 font-normal">(변경 불가)</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.username}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#191919]/5 border border-[#191919]/15 text-[#191919]/55 cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#191919] mb-1">
                      이름 (성함) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="성함을 입력하세요"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-[#191919] focus:outline-none focus:border-[#191919]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#191919] mb-1">
                      가입 이메일 <span className="text-[#191919]/45 font-normal">(변경 시 재인증 필요)</span>
                    </label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#191919]/5 border border-[#191919]/15 text-[#191919]/55 cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#191919] mb-1">
                      연락처 (전화번호) * <span className="text-[#F16B47]">(필수 입력사항)</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="예: 403-123-4567"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-[#191919] focus:outline-none focus:border-[#191919]"
                    />
                  </div>
                </div>

                {/* Birth Date (Read-only if registered, selectable for legacy NULL profiles) */}
                <div>
                  <label className="block font-bold text-[#191919] mb-1">
                    생년월일{' '}
                    {hasRegisteredBirthDate ? (
                      <span className="text-[#191919]/45 font-normal">(등록 완료 • 변경 불가)</span>
                    ) : (
                      <span className="text-[#F16B47] font-bold">(추가 등록 필요)</span>
                    )}
                  </label>
                  {hasRegisteredBirthDate ? (
                    <input
                      type="text"
                      disabled
                      value={
                        formatBirthDateKorean(currentUser.birthDate) ||
                        currentUser.birthDate ||
                        ''
                      }
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#191919]/5 border border-[#191919]/15 text-[#191919]/65 cursor-not-allowed"
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          aria-label="마이페이지 생년월일 연도"
                          value={birthYear}
                          onChange={(e) => {
                            const nextYear = e.target.value;
                            setBirthYear(nextYear);
                            if (nextYear && birthMonth && birthDay) {
                              const check = validateBirthDateParts(nextYear, birthMonth, birthDay);
                              setBirthDateError(check.valid ? '' : check.message || '');
                            } else {
                              setBirthDateError('');
                            }
                          }}
                          className={`w-full px-2 sm:px-3 py-2.5 rounded-lg bg-[#FBF9E9] border text-[#191919] focus:outline-none focus:border-[#191919] ${
                            birthDateError ? 'border-[#F16B47]' : 'border-[#191919]/20'
                          }`}
                        >
                          <option value="">연도</option>
                          {birthYearOptions.map((y) => (
                            <option key={y} value={String(y)}>
                              {y}년
                            </option>
                          ))}
                        </select>

                        <select
                          aria-label="마이페이지 생년월일 월"
                          value={birthMonth}
                          onChange={(e) => {
                            const nextMonth = e.target.value;
                            setBirthMonth(nextMonth);
                            if (birthYear && nextMonth && birthDay) {
                              const check = validateBirthDateParts(birthYear, nextMonth, birthDay);
                              setBirthDateError(check.valid ? '' : check.message || '');
                            } else {
                              setBirthDateError('');
                            }
                          }}
                          className={`w-full px-2 sm:px-3 py-2.5 rounded-lg bg-[#FBF9E9] border text-[#191919] focus:outline-none focus:border-[#191919] ${
                            birthDateError ? 'border-[#F16B47]' : 'border-[#191919]/20'
                          }`}
                        >
                          <option value="">월</option>
                          {birthMonthOptions.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>

                        <select
                          aria-label="마이페이지 생년월일 일"
                          value={birthDay}
                          onChange={(e) => {
                            const nextDay = e.target.value;
                            setBirthDay(nextDay);
                            if (birthYear && birthMonth && nextDay) {
                              const check = validateBirthDateParts(birthYear, birthMonth, nextDay);
                              setBirthDateError(check.valid ? '' : check.message || '');
                            } else {
                              setBirthDateError('');
                            }
                          }}
                          className={`w-full px-2 sm:px-3 py-2.5 rounded-lg bg-[#FBF9E9] border text-[#191919] focus:outline-none focus:border-[#191919] ${
                            birthDateError ? 'border-[#F16B47]' : 'border-[#191919]/20'
                          }`}
                        >
                          <option value="">일</option>
                          {birthDayOptions.map((d) => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {birthDateError ? (
                        <p className="text-[11px] text-[#F16B47] font-semibold">{birthDateError}</p>
                      ) : (
                        <p className="text-[11px] text-[#191919] bg-[#FFE57E]/30 border border-[#191919]/15 rounded-lg px-3 py-2">
                          기존 회원의 생년월일이 등록되어 있지 않습니다. 연도·월·일을 선택 후 아래 저장 버튼을 눌러 추가 등록해 주세요.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-lg bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingProfile ? '저장 중...' : '개인정보 변경사항 저장'}</span>
                  </button>
                </div>
              </form>

              {/* Password & Security Card inside Personal Info tab */}
              <form onSubmit={handleChangePassword} className="bg-[#FFFDF4] rounded-2xl p-4 sm:p-6 border border-[#191919]/15 space-y-4 text-xs">
                <h4 className="text-sm font-extrabold text-[#191919] flex items-center gap-2 border-b border-[#191919]/12 pb-3">
                  <KeyRound className="w-4 h-4 text-[#F16B47]" />
                  <span>비밀번호 및 보안 관리</span>
                </h4>

                {passwordError && (
                  <div className="p-3 bg-[#F16B47]/10 text-[#B93815] rounded-xl border border-[#F16B47]/35 font-medium">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>비밀번호가 안전하게 변경되었습니다.</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#191919] mb-1">
                    현재 비밀번호 *
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-[#191919] focus:outline-none focus:border-[#191919]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#191919] mb-1">
                      새 비밀번호 * (8~16자 영문/숫자/특수문자)
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="새로운 비밀번호를 입력하세요"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-[#191919] focus:outline-none focus:border-[#191919]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#191919] mb-1">
                      새 비밀번호 확인 *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-[#191919] focus:outline-none focus:border-[#191919]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="w-full sm:w-auto justify-center px-6 py-2.5 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5 text-[#FFE57E]" />
                    <span>{isChangingPassword ? '변경 중...' : '비밀번호 변경 완료'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#FFFDF4] border-t border-[#191919]/15 flex items-center justify-between shrink-0">
          <span className="text-[11px] sm:text-xs text-[#191919]/55 truncate">
            리도라 (Readora) • 북클럽 커뮤니티
          </span>
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-2 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FBF9E9] text-xs font-bold cursor-pointer transition-colors shrink-0 ml-2"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
