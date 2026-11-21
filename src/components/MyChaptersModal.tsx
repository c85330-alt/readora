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
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#191919]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#FBF9E9] rounded-2xl shadow-2xl border border-[#191919]/20 my-auto sm:my-6 overflow-hidden max-h-[94dvh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 bg-[#191919] text-[#FBF9E9] border-b border-[#191919] flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FFE57E] text-[#191919] flex items-center justify-center text-sm font-bold shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#FBF9E9] truncate">
                내 모임 관리 (My Clubs)
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#FBF9E9]/70 truncate">
                신청한 모임의 장소, 시간, 준비 도서, 발제문 및 공지사항을 확인하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-[#FFE57E] hover:text-[#191919] text-[#FBF9E9] transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {rsvps.length === 0 ? (
          <div className="p-12 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE57E] text-[#191919] border border-[#191919]/15 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-[#191919] mb-2">
              신청한 독서모임이 아직 없습니다
            </h3>
            <p className="text-sm text-[#191919]/65 max-w-md mx-auto mb-6">
              캘거리에서 열리는 관심 있는 도서와 주제의 모임을 탐색하고 클릭 한 번으로 참가해보세요.
            </p>
            <button
              onClick={() => {
                onClose();
                onExploreClubs();
              }}
              className="px-6 py-3 rounded-lg bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              모임 둘러보러 가기
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar: List of Joined Clubs */}
            <div className="w-full md:w-72 bg-[#FFFDF4] border-b md:border-b-0 md:border-r border-[#191919]/15 p-3 md:p-4 overflow-y-auto flex-shrink-0 space-y-2">
              <div className="text-[11px] font-bold text-[#191919]/55 uppercase tracking-wider px-2 py-1">
                신청 완료된 모임 ({rsvps.length})
              </div>
              {rsvps.map((rsvp) => {
                const isSelected = (activeRsvp?.id === rsvp.id);
                return (
                  <div
                    key={rsvp.id}
                    onClick={() => {
                      setActiveTabId(rsvp.id);
                      setConfirmCancelId(null);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border text-left ${
                      isSelected
                        ? 'bg-[#FFE57E]/35 border-[#191919]'
                        : 'bg-[#FBF9E9] border-[#191919]/12 hover:border-[#191919]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#191919] text-[#FFE57E]">
                        D-Day
                      </span>
                      <span className="text-[10px] text-[#191919]/60 truncate">
                        {rsvp.venueName}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#191919] truncate mb-0.5">
                      {rsvp.bookTitle}
                    </h4>
                    <p className="text-[11px] text-[#191919]/65 truncate">
                      {rsvp.dateTime}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Right Main Panel: Detail of Active Club */}
            {activeRsvp && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
                {/* Top Card: Book & Schedule Banner */}
                <div className="bg-[#FFFDF4] rounded-2xl p-4 sm:p-5 border border-[#191919]/15 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                  <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-[#FBF9E9] border border-[#191919]/15">
                    <img
                      src={activeRsvp.coverImage}
                      alt={activeRsvp.bookTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 w-full overflow-hidden">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-bold text-[#191919] bg-[#B9D8E6]/60 px-2.5 py-0.5 rounded-md">
                        참가 확정
                      </span>
                      <span className="text-[11px] text-[#191919]/55">
                        신청일: {activeRsvp.registeredAt}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-[#191919] leading-snug truncate">
                      {activeRsvp.bookTitle} • {activeRsvp.author}
                    </h3>
                    <p className="text-xs text-[#191919]/65 mt-1 mb-3 truncate">
                      {activeRsvp.clubTitle}
                    </p>

                    {/* Quick Action: Add to Calendar & Cancel */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={createGoogleCalendarUrl(activeRsvp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FBF9E9] hover:bg-[#FFE57E]/50 border border-[#191919]/20 text-xs font-bold text-[#191919] transition-colors"
                      >
                        <CalendarPlus className="w-3.5 h-3.5 text-[#F16B47]" />
                        <span>Google 캘린더에 추가</span>
                      </a>

                      {confirmCancelId === activeRsvp.id ? (
                        <div className="inline-flex items-center gap-1.5 bg-[#F16B47]/10 border border-[#F16B47]/35 px-2.5 py-1 rounded-lg">
                          <span className="text-[11px] font-bold text-[#B93815]">정말 취소할까요?</span>
                          <button
                            onClick={() => {
                              onCancelRSVP(activeRsvp.id, activeRsvp.clubId);
                              setConfirmCancelId(null);
                            }}
                            className="px-2 py-0.5 rounded bg-[#F16B47] text-white text-[11px] font-bold cursor-pointer"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="px-2 py-0.5 rounded bg-white border border-[#191919]/20 text-[#191919] text-[11px] font-semibold cursor-pointer"
                          >
                            유지
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelId(activeRsvp.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#F16B47] hover:bg-[#F16B47]/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>참가 취소</span>
                        </button>
                      )}
                    </div>

                    {/* Minimum 4 people confirmation status badge */}
                    <div className="mt-3">
                      {(activeClub?.currentSeats || 1) >= 4 ? (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            <strong>모임 진행 확정 완료:</strong> 최소 인원(4명)이 충족되어 안내 메일 및 SMS가 정상 발송되었습니다.
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-[#FFE57E]/30 rounded-xl border border-[#191919]/15 text-xs text-[#191919] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-[#F16B47] shrink-0" />
                          <span>
                            <strong>진행 확정 대기 중:</strong> 최소 인원(4명) 충족 시 확정 알림이 발송됩니다. (미달 취소 시 100% 전액 환불)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Venue & Location Notice */}
                <div className="bg-[#FFFDF4] rounded-2xl p-5 border border-[#191919]/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#191919] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#F16B47]" />
                      <span>모임 장소 안내</span>
                    </h4>
                  </div>

                  <div className="bg-[#FBF9E9] p-3.5 rounded-xl border border-[#191919]/12 text-xs space-y-1.5">
                    <p className="font-bold text-[#191919] text-sm">
                      {activeRsvp.venueName}
                    </p>
                    {activeClub?.area && (
                      <p className="text-[#191919]/65">{activeClub.area}</p>
                    )}
                    {activeClub?.parkingInfo && (
                      <p className="text-[#191919]/75 pt-1 border-t border-[#191919]/10">
                        🚗 <strong>주차/교통:</strong> {activeClub.parkingInfo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Host Announcement Notice Board */}
                <div className="bg-[#FFE57E]/25 rounded-2xl p-5 border border-[#191919]/15 space-y-2">
                  <h4 className="text-sm font-bold text-[#191919] flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-[#F16B47]" />
                    <span>호스트 최신 공지사항</span>
                  </h4>
                  <p className="text-xs text-[#191919]/80 leading-relaxed">
                    "안녕하세요 {activeRsvp.participantName}님! 모임 당일 10분 전까지 도착하시면 편안하게 음료를 주문하고 인사 나누실 수 있습니다. 카페 테이블 위에 주황색 <strong>'리도라(Readora)'</strong> 아크릴 북마크가 놓여 있으니 편하게 합석해주세요."
                  </p>
                </div>

                {/* Discussion Questions & User Note Pad */}
                <div className="bg-[#B9D8E6]/25 rounded-2xl p-5 border border-[#191919]/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#191919] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#191919]" />
                      <span>이번 모임 발제문 & 나의 생각 메모</span>
                    </h4>
                    <span className="text-[11px] font-bold text-[#191919] bg-[#FFFDF4] border border-[#191919]/15 px-2.5 py-0.5 rounded-md">
                      {activeClub?.shareDiscussionTopics !== false ? '사전 공개' : '당일 현장 공개'}
                    </span>
                  </div>

                  {activeClub?.shareDiscussionTopics === false ? (
                    <div className="p-4 bg-[#FFFDF4] rounded-xl text-xs text-[#191919]/75 border border-[#191919]/15 space-y-1">
                      <p className="font-bold text-[#191919]">호스트 당일 공개 모임</p>
                      <p className="text-[#191919]/70 leading-relaxed">
                        호스트의 진행 방식에 따라 본 모임의 발제 질문은 사전 공개되지 않으며, 현장에서 신선한 대화를 위해 모임 당일 현장에서 함께 공개됩니다.
                      </p>
                    </div>
                  ) : activeClub?.discussionTopics && (
                    <div className="space-y-2">
                      {activeClub.discussionTopics.map((topic, i) => (
                        <div key={i} className="bg-[#FFFDF4] p-3 rounded-xl text-xs text-[#191919] border border-[#191919]/12">
                          <strong>Q{i + 1}.</strong> {topic}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Note Pad */}
                  <div className="bg-[#FFFDF4] rounded-xl p-4 border border-[#191919]/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#191919] flex items-center gap-1.5">
                        <StickyNote className="w-3.5 h-3.5 text-[#191919]" />
                        <span>나의 생각 & 인상 깊었던 구절 적어두기</span>
                      </label>
                      {savedSuccessId === activeRsvp.id && (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
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
                      className="w-full p-3 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-xs text-[#191919] focus:outline-none focus:border-[#191919]"
                    />

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveNote(activeRsvp.id)}
                        className="px-4 py-1.5 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-xs font-bold cursor-pointer transition-colors"
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
