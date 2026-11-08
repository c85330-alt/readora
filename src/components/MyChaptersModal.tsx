import React, { useState } from 'react';
import { 
  X, Calendar, MapPin, Clock, BookOpen, MessageSquare, 
  Trash2, CalendarPlus, StickyNote, Check, 
  BellRing, Car, AlertCircle, Sparkles 
} from 'lucide-react';
import { RSVPRecord, BookClub } from '../types';

interface MyChaptersModalProps {
  isOpen: boolean;
  onClose: () => void;
  rsvps: RSVPRecord[];
  allClubs: BookClub[];
  onCancelRSVP: (rsvpId: string, clubId: string) => void;
  onSaveNote: (rsvpId: string, notes: string) => void;
  onExploreClubs: () => void;
}

export const MyChaptersModal: React.FC<MyChaptersModalProps> = ({
  isOpen,
  onClose,
  rsvps,
  allClubs,
  onCancelRSVP,
  onSaveNote,
  onExploreClubs
}) => {
  if (!isOpen) return null;

  const [activeTabId, setActiveTabId] = useState<string>(rsvps[0]?.id || '');
  const [editingNotes, setEditingNotes] = useState<{ [rsvpId: string]: string }>({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  const activeRsvp = rsvps.find((r) => r.id === (activeTabId || rsvps[0]?.id));
  const activeClub = activeRsvp ? allClubs.find((c) => c.id === activeRsvp.clubId) : null;

  const handleNoteChange = (rsvpId: string, text: string) => {
    setEditingNotes((prev) => ({ ...prev, [rsvpId]: text }));
  };

  const handleSaveNote = (rsvpId: string) => {
    const text = editingNotes[rsvpId] !== undefined 
      ? editingNotes[rsvpId] 
      : activeRsvp?.userNotes || '';
    onSaveNote(rsvpId, text);
    setSavedSuccessId(rsvpId);
    setTimeout(() => setSavedSuccessId(null), 2000);
  };

  // Google Calendar Link generator
  const createGoogleCalendarUrl = (rsvp: RSVPRecord) => {
    const title = encodeURIComponent(`[리도라] ${rsvp.bookTitle} 독서모임`);
    const details = encodeURIComponent(
      `리도라(Readora) 독서모임\\n도서: ${rsvp.bookTitle} (${rsvp.author})\\n장소: ${rsvp.venueName} (${rsvp.venueAddress})\\n준비사항 및 발제문은 리도라 웹사이트 '내 모임 관리'에서 확인하세요.`
    );
    const location = encodeURIComponent(`${rsvp.venueName}, ${rsvp.venueAddress}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#F4F0E5] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8DFCE] my-auto sm:my-6 overflow-hidden max-h-[94dvh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-b border-[#EBE3D5] flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#DF612D] text-white flex items-center justify-center text-sm font-bold shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#19221C] truncate">
                내 모임 관리 (My Clubs)
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#637267] truncate">
                신청한 모임의 장소, 시간, 준비 도서, 발제문 및 공지사항을 확인하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-full bg-[#F4F0E5] hover:bg-[#EDE5D6] text-[#4A574E] transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {rsvps.length === 0 ? (
          <div className="p-12 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-[#FCEFE7] text-[#DF612D] flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#19221C] mb-2">
              신청한 독서모임이 아직 없습니다
            </h3>
            <p className="text-sm text-[#66746A] max-w-md mx-auto mb-6">
              캘거리에서 열리는 관심 있는 도서와 주제의 모임을 탐색하고 클릭 한 번으로 참가해보세요.
            </p>
            <button
              onClick={() => {
                onClose();
                onExploreClubs();
              }}
              className="px-6 py-3 rounded-full bg-[#DF612D] hover:bg-[#c95221] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              모임 둘러보러 가기
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar: List of Joined Clubs */}
            <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-[#EBE3D5] p-3 md:p-4 overflow-y-auto flex-shrink-0 space-y-2">
              <div className="text-[11px] font-bold text-[#839185] uppercase tracking-wider px-2 py-1">
                신청 완료된 모임 ({rsvps.length})
              </div>
              {rsvps.map((rsvp) => {
                const isSelected = (activeRsvp?.id === rsvp.id);
                return (
                  <div
                    key={rsvp.id}
                    onClick={() => setActiveTabId(rsvp.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-[#FCEFE7] border-[#DF612D] shadow-xs'
                        : 'bg-[#F4F0E5] border-transparent hover:bg-[#F2EBE0]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DF612D] text-white">
                        D-Day
                      </span>
                      <span className="text-[10px] text-[#69786E] truncate">
                        {rsvp.venueName}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#19221C] truncate mb-0.5">
                      {rsvp.bookTitle}
                    </h4>
                    <p className="text-[11px] text-[#556358] truncate">
                      {rsvp.dateTime}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Main Panel: Detail of Active Club */}
            {activeRsvp && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Top Card: Book & Schedule Banner */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-[#E9E1D2] flex flex-col sm:flex-row gap-4 sm:gap-5 items-start shadow-xs">
                  <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-sm bg-neutral-100 border border-[#EBE3D5]">
                    <img
                      src={activeRsvp.coverImage}
                      alt={activeRsvp.bookTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 w-full overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-[#2D6A4F] bg-[#E8F2E8] px-2.5 py-0.5 rounded-full">
                        참가 확정
                      </span>
                      <span className="text-[11px] text-[#6D7B71]">
                        신청일: {activeRsvp.registeredAt}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#19221C] leading-snug truncate">
                      {activeRsvp.bookTitle} • {activeRsvp.author}
                    </h3>
                    <p className="text-xs text-[#526055] mt-1 mb-3 truncate">
                      {activeRsvp.clubTitle}
                    </p>

                    {/* Quick Action: Add to Calendar */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={createGoogleCalendarUrl(activeRsvp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F0E5] hover:bg-[#EFE8DC] border border-[#DDD4C3] text-xs font-semibold text-[#19221C] transition-colors"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[#DF612D]" />
                        <span>Google 캘린더에 추가</span>
                      </a>

                      <button
                        onClick={() => {
                          if (confirm(`'${activeRsvp.bookTitle}' 모임 신청을 취소하시겠습니까?`)) {
                            onCancelRSVP(activeRsvp.id, activeRsvp.clubId);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-[#C2410C] hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>참가 취소</span>
                      </button>
                    </div>
                    {/* Minimum 4 people confirmation status badge */}
                    <div className="mt-3">
                      {(activeClub?.currentSeats || 1) >= 4 ? (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            <strong>모임 진행 확정 완료:</strong> 최소 인원(4명)이 충족되어 안내 메일 및 SMS가 정상 발송되었습니다.
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            <strong>진행 확정 대기 중:</strong> 최소 인원(4명) 충족 시 확정 알림이 발송됩니다. (미달 취소 시 100% 전액 환불)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Venue & Location Notice */}
                <div className="bg-white rounded-3xl p-5 border border-[#E9E1D2] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#19221C] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#DF612D]" />
                      <span>모임 장소 안내</span>
                    </h4>
                  </div>

                  <div className="bg-[#F4F0E5] p-3.5 rounded-2xl border border-[#ECE4D5] text-xs space-y-1.5">
                    <p className="font-bold text-[#19221C] text-sm">
                      {activeRsvp.venueName}
                    </p>
                    {activeClub?.area && (
                      <p className="text-[#556358]">{activeClub.area}</p>
                    )}
                    {activeClub?.parkingInfo && (
                      <p className="text-[#3A493F] pt-1 border-t border-[#E5DCCD]">
                        🚗 <strong>주차/교통:</strong> {activeClub.parkingInfo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Host Announcement Notice Board */}
                <div className="bg-[#FAF5ED] rounded-3xl p-5 border border-[#F2DECE] space-y-2">
                  <h4 className="text-sm font-bold text-[#19221C] flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-[#DF612D]" />
                    <span>호스트 최신 공지사항</span>
                  </h4>
                  <p className="text-xs text-[#54463A] leading-relaxed">
                    📢 "안녕하세요 {activeRsvp.participantName}님! 모임 당일 10분 전까지 도착하시면 편안하게 음료를 주문하고 인사 나누실 수 있습니다. 카페 테이블 위에 주황색 <strong>'리도라(Readora)'</strong> 아크릴 북마크가 놓여 있으니 편하게 합석해주세요."
                  </p>
                </div>

                {/* Discussion Questions & User Note Pad */}
                <div className="bg-[#EBF3EC] rounded-3xl p-5 border border-[#D1E5D2] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#19221C] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#2D6A4F]" />
                      <span>이번 모임 발제문 & 나의 생각 메모</span>
                    </h4>
                    <span className="text-[11px] font-semibold text-[#2D6A4F] bg-white px-2 py-0.5 rounded-full">
                      {activeClub?.shareDiscussionTopics !== false ? '사전 공개' : '당일 현장 공개'}
                    </span>
                  </div>

                  {activeClub?.shareDiscussionTopics === false ? (
                    <div className="p-4 bg-white/95 rounded-2xl text-xs text-[#3D4C42] border border-[#CCE0CD] space-y-1">
                      <p className="font-bold text-[#19221C]">💡 호스트 당일 공개 모임</p>
                      <p className="text-[#526356] leading-relaxed">
                        호스트의 진행 방식에 따라 본 모임의 발제 질문은 사전 공개되지 않으며, 현장에서 신선한 대화를 위해 모임 당일 현장에서 함께 공개됩니다.
                      </p>
                    </div>
                  ) : activeClub?.discussionTopics && (
                    <div className="space-y-2">
                      {activeClub.discussionTopics.map((topic, i) => (
                        <div key={i} className="bg-white/95 p-3 rounded-2xl text-xs text-[#1F2F24] border border-[#CCE0CD]">
                          <strong>Q{i + 1}.</strong> {topic}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Note Pad */}
                  <div className="bg-white rounded-2xl p-4 border border-[#CCE0CD] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#19221C] flex items-center gap-1.5">
                        <StickyNote className="w-3.5 h-3.5 text-[#2D6A4F]" />
                        <span>나의 생각 & 인상 깊었던 구절 적어두기</span>
                      </label>
                      {savedSuccessId === activeRsvp.id && (
                        <span className="text-[11px] font-semibold text-[#2D6A4F] flex items-center gap-1 animate-fade-in">
                          <Check className="w-3.5 h-3.5" /> 저장되었습니다
                        </span>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={
                        editingNotes[activeRsvp.id] !== undefined
                          ? editingNotes[activeRsvp.id]
                          : activeRsvp.userNotes || ''
                      }
                      onChange={(e) => handleNoteChange(activeRsvp.id, e.target.value)}
                      placeholder="모임에서 나누고 싶은 인상 깊었던 문장, 발제문에 대한 나의 답변이나 생각을 미리 메모해두세요."
                      className="w-full p-3 rounded-xl bg-[#F4F0E5] border border-[#DDD5C5] text-xs text-[#19221C] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/40"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveNote(activeRsvp.id)}
                        className="px-4 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#23533e] text-white text-xs font-semibold cursor-pointer transition-colors"
                      >
                        메모 저장하기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
