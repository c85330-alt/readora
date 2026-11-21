import React, { useState, useRef } from 'react';
import { X, Plus, BookOpen, MapPin, Calendar, Users, DollarSign, Sparkles, Check, Upload, Image as ImageIcon, Eye, EyeOff, Clock, UserCheck, AlertCircle } from 'lucide-react';
import { BookClub, BookCategory, CalgaryArea, User } from '../types';
import { MiniDatePicker } from './MiniDatePicker';
import { parseClubDateTime } from '../utils/autoCancelClubs';

interface CreateClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClub: (newClub: BookClub) => void;
  currentUser?: User | null;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=80'
];

export const CreateClubModal: React.FC<CreateClubModalProps> = ({
  isOpen,
  onClose,
  onCreateClub,
  currentUser
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<BookCategory>('문학/소설');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [customImageName, setCustomImageName] = useState<string>('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [whyThisBook, setWhyThisBook] = useState('');
  
  // Host - Automatically determined from logged in user
  const effectiveHostName = currentUser 
    ? currentUser.role === 'admin' 
      ? `${currentUser.name} (운영팀)`
      : currentUser.role === 'host'
        ? `${currentUser.name} (호스트)`
        : currentUser.name
    : '리도라 운영팀';

  const effectiveHostRole = currentUser?.role === 'admin'
    ? '리도라 총괄 디렉터 & 공식 호스트'
    : currentUser?.role === 'host'
      ? '리도라 공인 독서 호스트'
      : '리도라 독서 호스트';

  const effectiveHostUserId = currentUser?.id || 'user-admin-1';
  
  // Helper to get minimum allowed date string (7 days from today)
  const getMinAllowedDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}.${m}.${day}`;
  };

  // Schedule & Venue
  const [locationType, setLocationType] = useState<'in_person' | 'online'>('in_person');
  const [area, setArea] = useState<CalgaryArea>('다운타운 (Downtown)');
  const [venueName, setVenueName] = useState('Alforno Bakery & Cafe');
  const [dateTime, setDateTime] = useState(getMinAllowedDateStr());
  const [duration, setDuration] = useState('90분');
  const [customDuration, setCustomDuration] = useState('');
  
  // Capacity & Price
  const [maxSeats, setMaxSeats] = useState(7);
  const [feeCAD, setFeeCAD] = useState(15);
  
  // Discussion Topics & Pre-sharing Toggle
  const [shareDiscussionTopics, setShareDiscussionTopics] = useState(true);
  const [topic1, setTopic1] = useState('');
  const [topic2, setTopic2] = useState('');
  const [topic3, setTopic3] = useState('');
  const [formError, setFormError] = useState('');

  // Handle direct file upload for custom book cover
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setFormError('이미지 파일 크기는 최대 8MB까지 가능합니다.');
        return;
      }
      setFormError('');
      setCustomImageName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate minimum 7 days from today
    const parsedDate = parseClubDateTime(dateTime);
    const minAllowed = new Date();
    minAllowed.setHours(0, 0, 0, 0);
    minAllowed.setDate(minAllowed.getDate() + 7);

    if (parsedDate && parsedDate.getTime() < minAllowed.getTime()) {
      setFormError('모임 날짜는 모임 개설일 기준 최소 7일 후부터 설정할 수 있습니다.');
      return;
    }

    const finalDuration = duration === 'custom' ? (customDuration.trim() || '90분') : duration;

    const newClub: BookClub = {
      id: `club-${Date.now()}`,
      title,
      bookTitle,
      author,
      category,
      coverImage,
      tagline: tagline || `${bookTitle}과 함께하는 캘거리 한인 독서모임`,
      description: description || `${bookTitle}을 함께 읽고 서로의 감상과 캘거리에서의 일상을 나눕니다.`,
      whyThisBook: whyThisBook || '캘거리 이웃들과 깊은 공감대를 형성하기 위해 선정했습니다.',
      hostUserId: effectiveHostUserId,
      hostName: effectiveHostName,
      hostRole: effectiveHostRole,
      hostAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      hostBio: '책과 사람을 사랑하는 캘거리 독서 호스트입니다.',
      isOfficialHost: currentUser?.role === 'admin' || effectiveHostName.includes('운영팀'),
      locationType,
      area,
      venueName,
      venueAddress: '',
      parkingInfo: '인근 노상 주차 및 공영 주차장 이용 가능',
      dateTime,
      frequency: '단회차 모임 (1 Session)',
      duration: finalDuration,
      maxSeats: Number(maxSeats),
      currentSeats: 1, // host is participant
      feeCAD: Number(feeCAD),
      status: 'open',
      shareDiscussionTopics,
      discussionTopics: [
        topic1 || '책에서 가장 기억에 남는 문장이나 장면은 무엇인가요?',
        topic2 || '주인공의 선택에 대해 나는 어떻게 생각하나요?',
        topic3 || '이 책이 나의 캘거리 일상에 던져준 질문은?'
      ],
      preparationGuide: '전체 완독 권장. 밑줄 그은 문장 한 구절 공유해주세요.',
      tags: ['신규개설', category, '캘거리모임']
    };

    onCreateClub(newClub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#191919]/65 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#FBF9E9] rounded-2xl shadow-2xl border border-[#191919]/20 my-auto sm:my-6 overflow-hidden max-h-[94dvh] sm:max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#191919] text-[#FBF9E9] border-b border-[#191919] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FFE57E] text-[#191919] flex items-center justify-center shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-[#FBF9E9] truncate">
                새 독서모임 개설하기
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#FBF9E9]/70 truncate">
                운영자 및 인증 호스트를 위한 실시간 모임 등록 시스템입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#FBF9E9]/80 hover:text-[#FBF9E9] transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {formError && (
            <div className="p-3 bg-[#F16B47]/15 border border-[#F16B47]/40 text-[#191919] rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#F16B47] shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Basic Book Info */}
          <div className="bg-[#FFFDF4] rounded-2xl p-4 sm:p-5 border border-[#191919]/15 space-y-4">
            <h3 className="text-xs font-extrabold text-[#191919] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#F16B47]" />
              도서 및 모임 기본 정보
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#191919]/80 mb-1">
                  모임 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 캘거리 겨울을 녹이는 따뜻한 골목길 이야기"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#191919]/80 mb-1">
                    도서명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="예: 불편한 편의점"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#191919]/80 mb-1">
                    저자 *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="예: 김호연"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#191919]/80 mb-1">
                    카테고리 *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BookCategory)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919] cursor-pointer"
                  >
                    <option value="문학/소설">문학 & 소설</option>
                    <option value="인문/철학">인문 & 철학</option>
                    <option value="에세이/이민">에세이 & 이민생활</option>
                    <option value="경제/자기계발">경제 & 자기계발</option>
                    <option value="사회/과학">사회 & 과학</option>
                    <option value="원서/영문학">원서 & 영문학</option>
                  </select>
                </div>

                {/* Automatically Determined Host Info (No manual typing required) */}
                <div>
                  <label className="block font-bold text-[#191919]/80 mb-1">
                    담당 호스트 (로그인 계정 자동 지정)
                  </label>
                  <div className="p-2 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-6 h-6 rounded-md bg-[#FFE57E] text-[#191919] flex items-center justify-center shrink-0">
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold text-[#191919] truncate">
                        {effectiveHostName}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-[#B9D8E6] text-[#191919] px-2 py-0.5 rounded-md shrink-0">
                      자동 연동
                    </span>
                  </div>
                </div>
              </div>

              {/* 도서 선정 이유 */}
              <div>
                <label className="block font-bold text-[#191919]/80 mb-1">
                  도서 선정 이유 *
                </label>
                <textarea
                  required
                  rows={3}
                  value={whyThisBook}
                  onChange={(e) => setWhyThisBook(e.target.value)}
                  placeholder="호스트로서 이 책을 선정한 이유와 모임에서 멤버들과 함께 나누고 싶은 이야기를 작성해주세요."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 text-xs text-[#191919] focus:outline-none focus:border-[#191919] leading-relaxed resize-none"
                />
              </div>

              {/* Cover Image Picker & Custom Image Upload */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block font-bold text-[#191919]/80">
                    도서 커버 이미지 선택 및 직접 업로드 *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191919] hover:bg-[#191919]/85 text-[#FFE57E] text-[11px] font-extrabold cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>원하는 이미지 직접 업로드</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </div>

                {customImageName && (
                  <div className="p-2.5 bg-[#B9D8E6]/35 rounded-lg border border-[#191919]/20 flex items-center justify-between text-xs text-[#191919]">
                    <span className="truncate">업로드된 맞춤 이미지: <strong>{customImageName}</strong></span>
                    <span className="text-[10px] font-extrabold bg-[#FFE57E] text-[#191919] px-2 py-0.5 rounded-md">적용 완료</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-16 h-22 rounded-lg overflow-hidden border-2 border-[#F16B47] flex-shrink-0 relative group bg-[#FBF9E9]">
                    <img src={coverImage} alt="Cover Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#191919]/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[9px] text-[#FFE57E] font-extrabold">현재 적용</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <p className="text-[11px] text-[#191919]/65 mb-1.5">
                      컴퓨터나 모바일에서 원하는 도서 표지 사진을 직접 업로드하거나, 아래 기본 프리셋 중에서 선택할 수 있습니다.
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_COVERS.map((url, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setCoverImage(url);
                            setCustomImageName('');
                          }}
                          className={`w-12 h-16 rounded-lg overflow-hidden border-2 cursor-pointer flex-shrink-0 transition-all ${
                            coverImage === url ? 'border-[#F16B47] scale-105' : 'border-[#191919]/15 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`preset-${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calgary Venue & Schedule */}
          <div className="bg-[#FFFDF4] rounded-2xl p-4 sm:p-5 border border-[#191919]/15 space-y-4">
            <h3 className="text-xs font-extrabold text-[#191919] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#F16B47]" />
              캘거리 모임 장소 및 일정 정보
            </h3>

            <div className="text-xs">
              <label className="block font-bold text-[#191919]/80 mb-1">
                지역 선택 *
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value as CalgaryArea)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919] cursor-pointer"
              >
                <option value="다운타운 (Downtown)">다운타운 (Downtown)</option>
                <option value="벨트라인 (17th Ave SW)">벨트라인 (17th Ave SW)</option>
                <option value="켄싱턴 (Kensington)">켄싱턴 (Kensington)</option>
                <option value="잉글우드 (Inglewood)">잉글우드 (Inglewood)</option>
                <option value="NW 크로우풋 / 브렌트우드">NW 크로우풋 / 브렌트우드</option>
                <option value="SW 치눅">SW 치눅</option>
              </select>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-[#191919]/80 mb-1">
                장소 이름 *
              </label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="예: Alforno Bakery & Cafe (캘거리 카페, 도서관 세미나룸 등)"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-[#191919]/80 mb-1">
                  모임 일시 *
                </label>
                <MiniDatePicker
                  value={dateTime}
                  onChange={(val) => {
                    setDateTime(val);
                    if (formError) setFormError('');
                  }}
                  placeholder="예: 2026.12.12"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#191919]/80 mb-1 flex items-center justify-between">
                  <span>진행 시간 설정 *</span>
                  <Clock className="w-3.5 h-3.5 text-[#F16B47]" />
                </label>
                <select
                  value={['90분', '2시간', '2시간 30분', '3시간'].includes(duration) ? duration : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setDuration('custom');
                      if (!customDuration) setCustomDuration('90분');
                    } else {
                      setDuration(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919] cursor-pointer"
                >
                  <option value="90분">90분</option>
                  <option value="2시간">2시간</option>
                  <option value="2시간 30분">2시간 30분</option>
                  <option value="3시간">3시간</option>
                  <option value="custom">직접 입력...</option>
                </select>
                {duration === 'custom' && (
                  <input
                    type="text"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    placeholder="예: 90분 또는 100분"
                    className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-[#FBF9E9] border border-[#F16B47] text-xs text-[#191919]"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-[#191919]/80 mb-1">
                  최대 정원 (명) *
                </label>
                <input
                  type="number"
                  min={4}
                  max={12}
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919] tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-[#191919]/80 mb-1">
                  참가비 (CAD $) *
                </label>
                <input
                  type="number"
                  min={0}
                  value={feeCAD}
                  onChange={(e) => setFeeCAD(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919] tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Discussion Topics & Pre-sharing Toggle */}
          <div className="bg-[#FFFDF4] rounded-2xl p-4 sm:p-5 border border-[#191919]/15 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#191919] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F16B47]" />
                함께 나눌 발제 질문 설정
              </h3>
            </div>

            {/* Toggle: Share discussion topics in advance or keep secret until session */}
            <div className="bg-[#FBF9E9] p-3.5 rounded-xl border border-[#191919]/15 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {shareDiscussionTopics ? (
                    <Eye className="w-4 h-4 text-[#191919]" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-[#F16B47]" />
                  )}
                  <div>
                    <p className="font-extrabold text-[#191919] text-xs">
                      발제 질문 사전 공개 여부 선택
                    </p>
                    <p className="text-[11px] text-[#191919]/65">
                      {shareDiscussionTopics
                        ? '모임 상세 페이지에 발제 질문을 사전에 공개합니다.'
                        : '모임 상세 페이지에서 발제 질문을 숨기며, 당일 현장에서 함께 공개합니다.'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={shareDiscussionTopics}
                    onChange={(e) => setShareDiscussionTopics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#191919]/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#FFFDF4] after:border-[#191919]/20 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#191919]"></div>
                </label>
              </div>

              <div className={`p-2.5 rounded-lg text-[11px] border ${
                shareDiscussionTopics 
                  ? 'bg-[#B9D8E6]/35 text-[#191919] border-[#191919]/15'
                  : 'bg-[#FFE57E]/35 text-[#191919] border-[#191919]/15'
              }`}>
                {shareDiscussionTopics ? (
                  <span>
                    <strong>사전 공개 설정됨:</strong> 신청자들이 모임 신청 전/후에 상세 페이지에서 발제 질문을 읽고 생각을 정리해 올 수 있습니다.
                  </span>
                ) : (
                  <span>
                    <strong>비공개 설정됨 (상세페이지 숨김):</strong> 모임 상세 페이지에서 발제 질문 목록이 노출되지 않으며, 현장에서 신선한 대화를 위해 당일 공개됩니다.
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-[#191919]/80">
                발제 질문 내용 입력 (최소 2문항 권장)
              </label>
              <input
                type="text"
                value={topic1}
                onChange={(e) => setTopic1(e.target.value)}
                placeholder="발제 질문 1: 책에서 가장 인상 깊었던 인물이나 사건은?"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919]"
              />
              <input
                type="text"
                value={topic2}
                onChange={(e) => setTopic2(e.target.value)}
                placeholder="발제 질문 2: 나의 캘거리 일상과 연결지어 생각해볼 질문은?"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919]"
              />
              <input
                type="text"
                value={topic3}
                onChange={(e) => setTopic3(e.target.value)}
                placeholder="발제 질문 3: 이 책이 나에게 남긴 질문은 무엇인가요?"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FBF9E9] border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs text-[#191919]"
              />
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-[#FFFDF4] hover:bg-[#191919]/5 border border-[#191919]/20 text-xs font-bold text-[#191919] cursor-pointer transition-colors"
            >
              취소
            </button>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>모임 등록 완료하기</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
