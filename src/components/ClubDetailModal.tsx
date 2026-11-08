import React, { useState } from 'react';
import { 
  X, MapPin, Calendar, Clock, BookOpen, MessageSquare, 
  CheckCircle2, Sparkles, AlertCircle, Lock,
  CreditCard, ShieldCheck, ArrowRight, ArrowLeft, Receipt, Check
} from 'lucide-react';
import { BookClub, RSVPRecord, User } from '../types';

interface ClubDetailModalProps {
  club: BookClub | null;
  onClose: () => void;
  onRSVP: (rsvpData: Omit<RSVPRecord, 'id' | 'registeredAt' | 'status'>) => void;
  isRegistered: boolean;
  onOpenMyChapters: () => void;
  currentUser?: User | null;
  onOpenLogin?: () => void;
  isManagementView?: boolean;
}

export const ClubDetailModal: React.FC<ClubDetailModalProps> = ({
  club,
  onClose,
  onRSVP,
  isRegistered,
  onOpenMyChapters,
  currentUser,
  onOpenLogin,
  isManagementView = false
}) => {
  if (!club) return null;

  // Step 1: Detail View ('detail') -> Step 2: Payment ('checkout') -> Step 3: Success ('success')
  const [currentStep, setCurrentStep] = useState<'detail' | 'checkout' | 'success'>('detail');
  const [paymentMethod, setPaymentMethod] = useState<'interac' | 'card' | 'apple_google'>('interac');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  // Determine Club Status: 'open' | 'almost_full' | 'closed'
  const isFull = club.status === 'closed' || (club.maxSeats - club.currentSeats <= 0 && !isRegistered);
  const isAlmostFull = !isFull && (club.status === 'almost_full' || (club.maxSeats - club.currentSeats <= 2));

  const getStatusBadge = () => {
    if (isRegistered) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2D6A4F] bg-[#E8F2E8] px-3 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          신청 완료
        </span>
      );
    }
    if (isFull) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5" />
          마감
        </span>
      );
    }
    if (isAlmostFull) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#DF612D] bg-[#FDEEE3] px-3 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5" />
          마감임박
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-bold text-[#2D6A4F] bg-[#E8F2E8] px-3 py-1 rounded-full">
        모집중
      </span>
    );
  };

  // If user is not logged in: gate the detail view
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <div 
          className="relative w-full max-w-md bg-[#F4F0E5] rounded-3xl shadow-2xl border border-[#E8DFCE] my-8 overflow-hidden p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full bg-[#FDEEE3] text-[#DF612D] flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#19221C] mb-2">
            로그인이 필요한 서비스입니다
          </h3>
          <p className="text-xs sm:text-sm text-[#556358] leading-relaxed mb-6">
            <strong>{club.bookTitle}</strong> 독서모임의 상세 장소, 토론 발제문, 참가 신청 및 결제는 <strong>로그인 후 이용</strong>하실 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => {
                onClose();
                if (onOpenLogin) onOpenLogin();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              로그인하고 상세 보기
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white hover:bg-[#F5EFE4] text-[#19221C] border border-[#DDD4C3] text-xs sm:text-sm font-semibold cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Payment Confirmation
  const handleConfirmPaymentAndRSVP = () => {
    setIsProcessingPayment(true);
    const newReceiptId = `RCP-${Date.now().toString().slice(-6)}`;
    setReceiptNumber(newReceiptId);

    const methodNameLabel = 
      paymentMethod === 'interac' ? 'Interac e-Transfer' :
      paymentMethod === 'card' ? '신용/체크카드' : 'Apple/Google Pay';

    setTimeout(() => {
      onRSVP({
        userId: currentUser.id,
        clubId: club.id,
        clubTitle: club.title,
        bookTitle: club.bookTitle,
        author: club.author,
        coverImage: club.coverImage,
        dateTime: club.dateTime,
        venueName: club.venueName,
        venueAddress: club.venueAddress,
        locationType: club.locationType,
        participantName: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '403-123-4567',
        paymentMethod: methodNameLabel,
        paymentAmountCAD: club.feeCAD,
        paidAt: new Date().toLocaleDateString('ko-KR') + ' ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      });
      setIsProcessingPayment(false);
      setCurrentStep('success');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#F4F0E5] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8DFCE] my-auto sm:my-8 overflow-hidden max-h-[94dvh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-[#EBE3D5] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DF612D] shrink-0" />
            <span className="text-xs font-bold text-[#67776B] tracking-wider uppercase truncate">
              {currentStep === 'detail' && '리도라 (Readora) • 독서모임 상세'}
              {currentStep === 'checkout' && '리도라 (Readora) • 참가비 결제'}
              {currentStep === 'success' && '리도라 (Readora) • 신청 및 결제 완료'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-full bg-[#F4F0E5] hover:bg-[#EDE5D6] text-[#4A574E] transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* STEP 1: DETAIL VIEW */}
          {currentStep === 'detail' && (
            <>
              {/* Hero Card of the Club */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E9E1D2] flex flex-col sm:flex-row gap-4 sm:gap-6 shadow-xs">
                <div className="w-28 sm:w-36 aspect-[3/4] flex-shrink-0 rounded-2xl overflow-hidden shadow-md bg-neutral-100 border border-[#EBE3D5] mx-auto sm:mx-0">
                  <img
                    src={club.coverImage}
                    alt={club.bookTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF3EA] text-[#B54A18] border border-[#F3E2CF]">
                      {club.category}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#F4F0E5] text-[#556358] border border-[#EAE1D3]">
                      {club.area}
                    </span>
                    {getStatusBadge()}
                  </div>

                  <h2 className="text-lg sm:text-2xl font-extrabold text-[#19221C] leading-snug mb-1.5 sm:mb-2 text-pretty">
                    {club.title}
                  </h2>

                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap text-xs sm:text-sm">
                    <span className="font-bold text-[#DF612D]">
                      {club.bookTitle}
                    </span>
                    <span className="text-stone-300">|</span>
                    <span className="font-medium text-[#19221C]">
                      {club.author} 저
                    </span>
                  </div>

                  {/* Spec: 참가비, 모집 상태, 진행 시간 */}
                  <div className="grid grid-cols-3 gap-2 text-xs pt-3 border-t border-[#F2ECE1]">
                    <div>
                      <span className="text-[#8B988F] block text-[11px]">참가비</span>
                      <span className="font-extrabold text-[#DF612D] text-sm">
                        CAD ${club.feeCAD}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8B988F] block text-[11px]">모집 상태</span>
                      <span className="font-bold text-sm text-[#19221C]">
                        {isRegistered ? '신청 완료' : isFull ? '마감' : isAlmostFull ? '마감임박' : '모집중'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#8B988F] block text-[11px]">진행 시간</span>
                      <span className="font-bold text-[#19221C] text-sm">{club.duration}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Venue Section */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E9E1D2] space-y-3 sm:space-y-4 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-[#19221C] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#DF612D]" />
                  <span>일시 및 장소</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                  <div className="bg-[#F4F0E5] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#EDE5D6] flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#DF612D] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-[#717E75] block font-medium">모임 일시</span>
                      <span className="text-xs sm:text-sm font-bold text-[#19221C] block leading-snug break-words">{club.dateTime}</span>
                    </div>
                  </div>

                  <div className="bg-[#F4F0E5] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#EDE5D6] flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white text-[#2D6A4F] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-[#717E75] block font-medium">모임 장소</span>
                      <span className="text-xs sm:text-sm font-bold text-[#19221C] block leading-snug break-words">{club.venueName}</span>
                      {club.venueAddress && (
                        <p className="text-[11px] sm:text-xs text-[#526056] mt-1 leading-relaxed break-words font-medium">
                          {club.venueAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Selection Reason */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E9E1D2] space-y-2.5 sm:space-y-3 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-[#19221C] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2D6A4F]" />
                  <span>도서 선정 이유</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#455248] leading-relaxed whitespace-pre-line text-pretty">
                  {club.whyThisBook || club.description}
                </p>
              </div>

              {/* Discussion Topics */}
              {club.shareDiscussionTopics !== false && (
                <div className="bg-[#EBF3EC] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#D1E5D2] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#19221C] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#2D6A4F]" />
                      <span>함께 나눌 발제 질문</span>
                    </h3>
                    <span className="text-[11px] font-semibold text-[#2D6A4F] bg-white px-2 py-0.5 rounded-full">
                      총 {club.discussionTopics.length}문항
                    </span>
                  </div>

                  <p className="text-xs text-[#526356] text-pretty">
                    정답이 있는 시험이 아닙니다. 자신의 경험과 솔직한 생각을 편안하게 나누는 질문들입니다.
                  </p>

                  <div className="space-y-2 mt-3">
                    {club.discussionTopics.map((topic, idx) => (
                      <div key={idx} className="bg-white/90 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#D5E6D6] flex items-start gap-2.5 sm:gap-3">
                        <span className="w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-[#202E25] leading-relaxed flex-1 min-w-0 text-pretty">
                          {topic}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Host Profile */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E9E1D2] flex items-center gap-3 sm:gap-4">
                <img
                  src={club.hostAvatar}
                  alt={club.hostName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-[#DF612D]/30 shadow-xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-[#19221C]">{club.hostName}</h4>
                    {club.isOfficialHost ? (
                      <span className="text-[10px] font-bold text-[#DF612D] bg-[#FCEFE7] px-2 py-0.5 rounded-full">
                        리도라 운영팀 직영
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#E8F2E8] px-2 py-0.5 rounded-full">
                        리도라 인증 호스트
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#707E75] mb-0.5">{club.hostRole}</p>
                  <p className="text-[11px] sm:text-xs text-[#455248] text-pretty">{club.hostBio}</p>
                </div>
              </div>

              {/* Minimum 4 Participants & 48h Cancellation / Refund Policy Notice */}
              <div className="bg-[#FAF5ED] rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E9DFCE] space-y-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#2D6A4F] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#19221C] text-balance">
                    모임 진행 확정 기준 및 취소/환불 규정 안내
                  </h4>
                </div>
                <div className="pl-8 sm:pl-9 space-y-1.5 text-xs text-[#526055] leading-relaxed">
                  <div className="bullet-item">
                    <span className="bullet-marker">•</span>
                    <span className="bullet-text">본 모임의 진행 최소 인원은 <strong>4명</strong>입니다.</span>
                  </div>
                  <div className="bullet-item text-[#2D6A4F] font-semibold">
                    <span className="bullet-marker">•</span>
                    <span className="bullet-text"><strong>모임 시작 48시간 전까지</strong>: 취소 시 결제하신 참가비의 <strong>100% 전액 환불 및 취소 가능</strong>합니다.</span>
                  </div>
                  <div className="bullet-item text-[#DC2626] font-semibold">
                    <span className="bullet-marker">•</span>
                    <span className="bullet-text"><strong>모임 시작 48시간 이내</strong>: 원활한 모임 운영 및 공간 예약 특성상 <strong>취소 및 환불이 불가</strong>합니다.</span>
                  </div>
                  <div className="bullet-item text-[#B45309] font-medium">
                    <span className="bullet-marker">•</span>
                    <span className="bullet-text"><strong>모임 시작 24시간 전 최소 인원(4명) 미달 시</strong>: 모임이 자동으로 취소되며 안내 알림 발송과 함께 <strong>100% 전액 자동 환불</strong> 처리됩니다.</span>
                  </div>
                </div>
              </div>

              {/* Bottom Application Action */}
              {isManagementView ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E0D8C8] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs text-stone-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-semibold text-stone-800 text-[11px] sm:text-xs">호스트 및 관리자 확인 전용 화면</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-700 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    상세보기 닫기
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-[#DF612D]/20 shadow-sm">
                  {isRegistered ? (
                    <div className="text-center py-2 space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#E8F2E8] text-[#2D6A4F] flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[#19221C]">
                        이미 신청이 완료된 모임입니다
                      </h4>
                      <p className="text-xs text-[#526055]">
                        신청하신 모임의 장소 및 상세 일정은 <strong>내 모임 관리</strong>에서 확인하실 수 있습니다.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenMyChapters();
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        내 모임 관리로 이동하기
                      </button>
                    </div>
                  ) : isFull ? (
                    <div className="text-center py-3">
                      <AlertCircle className="w-8 h-8 text-[#8B988F] mx-auto mb-2" />
                      <h4 className="text-sm sm:text-base font-bold text-[#19221C] mb-1">
                        현재 모집이 마감된 모임입니다
                      </h4>
                      <p className="text-xs text-[#6B7970] mb-3">
                        취소표가 발생하거나 새로운 차수가 열리면 알림을 받으실 수 있습니다.
                      </p>
                      <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#F4F0E5] border border-[#DDD4C3] text-xs font-semibold cursor-pointer"
                      >
                        다른 모임 둘러보기
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#19221C]">
                          신청 회원: {currentUser?.name || '회원'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#F2ECE1]">
                        <div className="flex items-baseline justify-between sm:block text-right">
                          <span className="text-[11px] text-[#8C9890] sm:block">참가비</span>
                          <span className="text-xl font-black text-[#DF612D]">
                            CAD ${club.feeCAD}
                          </span>
                        </div>

                        <button
                          onClick={() => setCurrentStep('checkout')}
                          className="w-full sm:w-auto justify-center px-7 py-3.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] active:scale-[0.98] text-white text-sm font-semibold shadow-md transition-all cursor-pointer flex items-center gap-2 group"
                        >
                          <span>신청 및 결제하기</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT / PAYMENT STEP */}
          {currentStep === 'checkout' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Back to detail button */}
              <button
                onClick={() => setCurrentStep('detail')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526055] hover:text-[#19221C] cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>모임 상세 정보로 돌아가기</span>
              </button>

              {/* Order Summary Box */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E9E1D2] space-y-3 sm:space-y-4 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-[#19221C] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#DF612D]" />
                  <span>결제 및 신청 내역 확인</span>
                </h3>

                <div className="bg-[#F4F0E5] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#EDE5D6] space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#68766D] shrink-0">신청 모임</span>
                    <strong className="text-[#19221C] text-right truncate">{club.title}</strong>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#68766D] shrink-0">도서명</span>
                    <strong className="text-[#DF612D] text-right truncate">{club.bookTitle}</strong>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[#68766D] shrink-0">일시 및 장소</span>
                    <span className="text-[#19221C] text-right text-[11px] sm:text-xs break-words leading-snug">{club.dateTime} · {club.venueName}{club.venueAddress ? ` (${club.venueAddress})` : ''}</span>
                  </div>
                  <div className="flex justify-between gap-2 pt-2 border-t border-[#E2D8C6]">
                    <span className="text-[#68766D] shrink-0">신청자 정보</span>
                    <strong className="text-[#19221C] text-right text-[11px] sm:text-xs truncate">{currentUser.name} ({currentUser.email})</strong>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center text-sm">
                  <span className="font-semibold text-[#556358]">최종 결제 금액 (CAD)</span>
                  <span className="text-xl sm:text-2xl font-black text-[#DF612D]">
                    ${club.feeCAD}.00
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#E9E1D2] space-y-3 sm:space-y-4 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-[#19221C] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#2D6A4F]" />
                  <span>결제 수단 선택</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Option 1: Interac e-Transfer */}
                  <div
                    onClick={() => setPaymentMethod('interac')}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'interac'
                        ? 'border-[#DF612D] bg-[#FDEEE3]/40 shadow-xs'
                        : 'border-[#EAE2D3] bg-[#FCFAF6] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs font-bold text-[#19221C]">Interac e-Transfer</span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">🇨🇦 캐나다</span>
                    </div>
                    <p className="text-[11px] text-[#637267] leading-relaxed">
                      모바일 뱅킹 즉시 송금<br />수수료 없음
                    </p>
                  </div>

                  {/* Option 2: Credit Card */}
                  <div
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#DF612D] bg-[#FDEEE3]/40 shadow-xs'
                        : 'border-[#EAE2D3] bg-[#FCFAF6] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs font-bold text-[#19221C]">신용 / 체크카드</span>
                      <span className="text-[10px] text-stone-500">Visa / MC</span>
                    </div>
                    <p className="text-[11px] text-[#637267] leading-relaxed">
                      국내/해외 카드 간편결제<br />보안 결제
                    </p>
                  </div>

                  {/* Option 3: Apple / Google Pay */}
                  <div
                    onClick={() => setPaymentMethod('apple_google')}
                    className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'apple_google'
                        ? 'border-[#DF612D] bg-[#FDEEE3]/40 shadow-xs'
                        : 'border-[#EAE2D3] bg-[#FCFAF6] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-xs font-bold text-[#19221C]">Apple / Google Pay</span>
                      <span className="text-[10px] text-stone-500">원클릭</span>
                    </div>
                    <p className="text-[11px] text-[#637267] leading-relaxed">
                      기기 인증 간편결제<br />1초 승인
                    </p>
                  </div>
                </div>

                {/* Method Specific Details */}
                {paymentMethod === 'interac' && (
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F0E5] border border-[#E8DFCE] text-xs space-y-1.5">
                    <div className="font-bold text-[#19221C] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                      <span>Interac e-Transfer 자동 확인 안내</span>
                    </div>
                    <p className="text-[#556358] leading-relaxed text-[11px] sm:text-xs">
                      대표 입금 계좌: <strong className="font-mono text-[#DF612D]">readoracontact@gmail.com</strong> (예금주: 리도라 Readora)<br />
                      아래 [결제 승인]을 누르면 신청이 즉시 등록되며, 호스트 및 운영팀 계정으로 신청자 정보가 자동 기록됩니다.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F0E5] border border-[#E8DFCE] text-xs space-y-2">
                    <div className="font-bold text-[#19221C] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                      <span>신용카드 결제 시뮬레이션 (256-bit Encrypted)</span>
                    </div>
                    <div>
                      <input
                        type="text"
                        readOnly
                        value="•••• •••• •••• 4242  (캐나다 로컬 카드 연동)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DDD4C3] text-xs text-stone-700 font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'apple_google' && (
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F0E5] border border-[#E8DFCE] text-xs space-y-1.5">
                    <div className="font-bold text-[#19221C] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#2D6A4F]" />
                      <span>디지털 월렛 1초 결제</span>
                    </div>
                    <p className="text-[#556358] leading-relaxed text-[11px] sm:text-xs">
                      등록된 모바일 카드로 즉시 승인되며 별도의 카드 번호 입력 없이 간편하게 처리됩니다.
                    </p>
                  </div>
                )}

                {/* Final Action Button */}
                <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <button
                    onClick={() => setCurrentStep('detail')}
                    className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-full bg-white border border-[#DDD4C3] text-xs font-semibold text-[#19221C] cursor-pointer text-center"
                  >
                    이전으로
                  </button>

                  <button
                    onClick={handleConfirmPaymentAndRSVP}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto justify-center px-8 py-3.5 rounded-full bg-[#DF612D] hover:bg-[#c95221] active:scale-[0.98] text-white text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        결제 승인 처리 중...
                      </span>
                    ) : (
                      <>
                        <span>CAD ${club.feeCAD} • 결제 승인 및 신청 확정</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT & RSVP SUCCESS RECEIPT */}
          {currentStep === 'success' && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center border border-[#E9E1D2] space-y-4 sm:space-y-5 shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E8F2E8] text-[#2D6A4F] flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>

              <div>
                <h3 className="text-lg sm:text-2xl font-black text-[#19221C] mb-1">
                  결제 및 모임 신청이 완료되었습니다! 🎉
                </h3>
                <p className="text-xs sm:text-sm text-[#526055]">
                  호스트 및 관리자에게 신청자 정보가 자동으로 안전하게 등록되었습니다.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-[#F4F0E5] rounded-xl sm:rounded-2xl p-4 sm:p-5 max-w-md mx-auto text-left border border-[#EDE5D6] space-y-2 text-xs">
                <div className="flex justify-between text-stone-500 pb-2 border-b border-[#E3D9C7]">
                  <span>영수증 번호</span>
                  <span className="font-mono font-bold text-[#19221C]">{receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68766D]">신청 모임</span>
                  <strong className="text-[#19221C] truncate max-w-[200px]">{club.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68766D]">도서명</span>
                  <strong className="text-[#DF612D] truncate max-w-[200px]">{club.bookTitle}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68766D]">일시</span>
                  <span className="text-[#19221C]">{club.dateTime}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[#68766D] shrink-0">장소</span>
                  <span className="text-[#19221C] text-right text-xs break-words leading-snug">{club.venueName}{club.venueAddress ? ` (${club.venueAddress})` : ''}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#E3D9C7] text-sm">
                  <span className="font-bold text-[#19221C]">결제 금액 (CAD)</span>
                  <span className="font-black text-[#DF612D]">${club.feeCAD}.00 (결제 완료)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenMyChapters();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#DF612D] hover:bg-[#c95221] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer text-center"
                >
                  내 모임 관리에서 확인하기
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-full bg-white hover:bg-[#F5EFE4] text-[#19221C] border border-[#DDD4C3] text-xs sm:text-sm font-semibold cursor-pointer text-center"
                >
                  완료 / 닫기
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
