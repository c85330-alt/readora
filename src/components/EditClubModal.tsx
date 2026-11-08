import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Calendar, 
  MapPin, 
  DollarSign, 
  HelpCircle, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle 
} from 'lucide-react';
import { BookClub, BookCategory, CalgaryArea } from '../types';
import { MiniDatePicker } from './MiniDatePicker';

interface EditClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: BookClub | null;
  onSaveClub: (updatedClub: BookClub) => void;
}

const CATEGORIES: BookCategory[] = [
  '문학/소설',
  '인문/철학',
  '에세이/이민',
  '경제/자기계발',
  '사회/과학',
  '원서/영문학'
];

const AREAS: CalgaryArea[] = [
  '다운타운 (Downtown)',
  '켄싱턴 (Kensington)',
  '벨트라인 (17th Ave SW)',
  'NW 크로우풋',
  'SW 치눅'
];

export const EditClubModal: React.FC<EditClubModalProps> = ({
  isOpen,
  onClose,
  club,
  onSaveClub
}) => {
  if (!isOpen || !club) return null;

  // Form State
  const [bookTitle, setBookTitle] = useState(club.bookTitle);
  const [author, setAuthor] = useState(club.author);
  const [publisher, setPublisher] = useState(club.publisher || '');
  const [category, setCategory] = useState<BookCategory>(club.category);
  const [title, setTitle] = useState(club.title);
  const [tagline, setTagline] = useState(club.tagline);
  const [description, setDescription] = useState(club.description);
  const [whyThisBook, setWhyThisBook] = useState(club.whyThisBook);
  
  // Schedule & Venue
  const [area, setArea] = useState<CalgaryArea>(club.area);
  const [venueName, setVenueName] = useState(club.venueName);
  const [parkingInfo, setParkingInfo] = useState(club.parkingInfo);
  const [dateTime, setDateTime] = useState(club.dateTime);
  const [duration, setDuration] = useState(club.duration || '90분');
  const [feeCAD, setFeeCAD] = useState(club.feeCAD);
  const [status, setStatus] = useState<'open' | 'almost_full' | 'closed' | 'cancelled'>(club.status);

  // Cover Image
  const [coverImage, setCoverImage] = useState(club.coverImage);
  const [coverFileName, setCoverFileName] = useState('');

  // Discussion Topics
  const [discussionTopics, setDiscussionTopics] = useState<string[]>(
    club.discussionTopics && club.discussionTopics.length > 0
      ? club.discussionTopics
      : ['']
  );
  const [shareDiscussionTopics, setShareDiscussionTopics] = useState<boolean>(
    club.shareDiscussionTopics !== false
  );

  const [formError, setFormError] = useState('');

  // Handle image upload from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 파일 크기는 최대 5MB까지 가능합니다.');
        return;
      }
      setCoverFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Discussion Topic
  const handleAddTopic = () => {
    setDiscussionTopics([...discussionTopics, '']);
  };

  // Update Discussion Topic
  const handleUpdateTopic = (index: number, val: string) => {
    const updated = [...discussionTopics];
    updated[index] = val;
    setDiscussionTopics(updated);
  };

  // Remove Topic
  const handleRemoveTopic = (index: number) => {
    if (discussionTopics.length <= 1) return;
    setDiscussionTopics(discussionTopics.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!bookTitle.trim() || !author.trim() || !title.trim() || !venueName.trim() || !dateTime.trim()) {
      setFormError('도서명, 저자, 모임명, 장소, 일시는 필수 입력 사항입니다.');
      return;
    }

    const filteredTopics = discussionTopics.filter((t) => t.trim().length > 0);

    const updatedClub: BookClub = {
      ...club,
      bookTitle: bookTitle.trim(),
      author: author.trim(),
      publisher: publisher.trim() || undefined,
      category,
      title: title.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      whyThisBook: whyThisBook.trim(),
      coverImage: coverImage.trim() || club.coverImage,
      area,
      venueName: venueName.trim(),
      venueAddress: '',
      parkingInfo: parkingInfo.trim(),
      dateTime: dateTime.trim(),
      duration: duration.trim(),
      feeCAD: Number(feeCAD) || 15,
      status,
      discussionTopics: filteredTopics.length > 0 ? filteredTopics : club.discussionTopics,
      shareDiscussionTopics
    };

    onSaveClub(updatedClub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#FCFAF6] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E7E0D3] overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-[#172E22] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs uppercase tracking-wider text-[#DF612D] bg-[#DF612D]/15 px-2.5 py-0.5 rounded-full border border-[#DF612D]/30">
              Host Management
            </span>
            <span className="text-xs text-stone-300">|</span>
            <span className="text-xs text-stone-300">모임 수정 및 상태 관리</span>
          </div>
          <h3 className="text-xl font-extrabold text-white">{club.bookTitle} 모임 정보 수정</h3>
          <p className="text-xs text-stone-300 mt-1">
            모집 중 일시, 장소, 발제 질문 공개 여부 및 도서 커버 이미지를 업데이트할 수 있습니다.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Recruiting Status */}
          <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#19221C]">
                현재 모임 상태 (모집 관리)
              </label>
              <span className="text-[11px] text-stone-500">
                (잔여 좌석 숫자는 노출되지 않고 상태 배지만 표시됩니다)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus('open')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'open'
                    ? 'bg-[#E8F2E8] text-[#2D6A4F] border-[#2D6A4F] shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                모집중 (Open)
              </button>

              <button
                type="button"
                onClick={() => setStatus('almost_full')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'almost_full'
                    ? 'bg-[#FDEEE3] text-[#DF612D] border-[#DF612D] shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                마감임박 (Almost Full)
              </button>

              <button
                type="button"
                onClick={() => setStatus('closed')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'closed'
                    ? 'bg-stone-700 text-white border-stone-700 shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                마감 (Closed)
              </button>

              <button
                type="button"
                onClick={() => setStatus('cancelled')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  status === 'cancelled'
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
                }`}
              >
                모임 취소
              </button>
            </div>
          </div>

          {/* 2. Book Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#DF612D]" />
              도서 정보
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  도서명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  저자 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BookCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  출판사
                </label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="출판사명 (선택)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                />
              </div>
            </div>

            {/* Cover Image Upload / URL */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                도서 커버 이미지 (원하는 이미지 직접 업로드 가능)
              </label>
              <div className="flex gap-3 items-center">
                <div className="w-14 h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0 shadow-2xs">
                  {coverImage ? (
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#DF612D]" />
                      <span>내 컴퓨터에서 이미지 업로드</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {coverFileName && (
                      <span className="text-[11px] text-stone-500 self-center truncate max-w-[150px]">
                        {coverFileName}
                      </span>
                    )}
                  </div>

                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="또는 이미지 웹 URL 링크 직접 입력"
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Club Story & Description */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#DF612D]" />
              모임 소개 및 선정 이유
            </h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                모임 타이틀 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="매력적인 모임 제목을 입력하세요"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                한 줄 소개 (Tagline)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="모임의 핵심 매력을 한 문장으로"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                모임 상세 소개
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                이 책을 함께 읽고 싶은 이유 (Why This Book)
              </label>
              <textarea
                rows={2}
                value={whyThisBook}
                onChange={(e) => setWhyThisBook(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white leading-relaxed"
              />
            </div>
          </div>

          {/* 4. Schedule & Location */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#DF612D]" />
              일정 및 캘거리 모임 장소
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  모임 일시 <span className="text-red-500">*</span>
                </label>
                <MiniDatePicker
                  value={dateTime}
                  onChange={setDateTime}
                  placeholder="예: 2026.11.21"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  모임 소요 시간
                </label>
                <select
                  value={['90분', '2시간', '2시간 30분', '3시간'].includes(duration) ? duration : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setDuration('90분');
                    } else {
                      setDuration(val);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white cursor-pointer"
                >
                  <option value="90분">90분</option>
                  <option value="2시간">2시간</option>
                  <option value="2시간 30분">2시간 30분</option>
                  <option value="3시간">3시간</option>
                  <option value="custom">직접 입력...</option>
                </select>
                {!['90분', '2시간', '2시간 30분', '3시간'].includes(duration) && (
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="예: 90분 또는 100분"
                    className="w-full mt-1.5 px-3 py-1.5 rounded-xl border border-[#DF612D] text-xs bg-white"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  캘거리 거점 지역
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value as CalgaryArea)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white cursor-pointer"
                >
                  {AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  모임 장소명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="예: Calgary Central Library 3층 토론룸"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                주차 및 대중교통 안내
              </label>
              <input
                type="text"
                value={parkingInfo}
                onChange={(e) => setParkingInfo(e.target.value)}
                placeholder="주차 및 대중교통 안내 (예: C-Train 도보 2분, 도서관 앞 주차)"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                참가비 (CAD $)
              </label>
              <input
                type="number"
                value={feeCAD}
                onChange={(e) => setFeeCAD(Number(e.target.value))}
                min={0}
                className="w-full sm:w-40 px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white font-mono"
              />
            </div>
          </div>

          {/* 5. Discussion Topics & Disclosure Option */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#DF612D]" />
                함께 나눌 발제 질문
              </h4>

              {/* Disclosure Toggle */}
              <button
                type="button"
                onClick={() => setShareDiscussionTopics(!shareDiscussionTopics)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  shareDiscussionTopics
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border-stone-300'
                }`}
              >
                {shareDiscussionTopics ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    <span>발제 질문 사전 공개</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                    <span>사전 비공개 (현장 공개)</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-stone-500">
              {shareDiscussionTopics 
                ? '✅ 모임 상세페이지에 발제 질문이 공개되어 참여자들이 미리 생각을 준비할 수 있습니다.' 
                : '🔒 모임 상세페이지에서 발제 질문이 숨겨지며, 모임 당일 현장에서 공개됩니다.'}
            </p>

            <div className="space-y-2">
              {discussionTopics.map((topic, index) => (
                <div key={index} className="flex gap-2">
                  <span className="w-6 h-8 rounded-lg bg-stone-200 text-stone-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => handleUpdateTopic(index, e.target.value)}
                    placeholder="대화를 이끌어낼 깊이 있는 질문을 입력하세요"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                  />
                  {discussionTopics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(index)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="질문 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddTopic}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#DF612D] hover:underline pt-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>발제 질문 추가하기</span>
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#DF612D] hover:bg-[#c95221] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>수정 내용 저장</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
