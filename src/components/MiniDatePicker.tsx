import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface MiniDatePickerProps {
  value: string; // format: "YYYY.MM.DD"
  onChange: (newDateStr: string) => void;
  placeholder?: string;
  required?: boolean;
  minDaysFromToday?: number; // Minimum days offset from today (default: 7)
}

export const MiniDatePicker: React.FC<MiniDatePickerProps> = ({
  value,
  onChange,
  placeholder = '2026.12.12',
  required = true,
  minDaysFromToday = 7
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate minimum allowed date (start of day)
  const minAllowedDate = new Date();
  minAllowedDate.setHours(0, 0, 0, 0);
  minAllowedDate.setDate(minAllowedDate.getDate() + minDaysFromToday);

  // Parse initial view year and month from value, or default to minAllowedDate
  const parseYearMonth = (val: string) => {
    const parts = val.split('.');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      if (!isNaN(y) && !isNaN(m) && m >= 0 && m <= 11) {
        return { year: y, month: m };
      }
    }
    return { year: minAllowedDate.getFullYear(), month: minAllowedDate.getMonth() };
  };

  const initial = parseYearMonth(value);
  const [viewYear, setViewYear] = useState<number>(initial.year);
  const [viewMonth, setViewMonth] = useState<number>(initial.month); // 0-indexed

  // Sync view year/month when value changes and calendar is reopened
  useEffect(() => {
    if (isOpen) {
      const parsed = parseYearMonth(value);
      setViewYear(parsed.year);
      setViewMonth(parsed.month);
    }
  }, [isOpen, value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewYear((prev) => prev - 1);
      setViewMonth(11);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewYear((prev) => prev + 1);
      setViewMonth(0);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const targetDate = new Date(viewYear, viewMonth, day, 0, 0, 0, 0);
    if (targetDate.getTime() < minAllowedDate.getTime()) {
      return;
    }

    const formattedYear = viewYear;
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formatted = `${formattedYear}.${formattedMonth}.${formattedDay}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Generate calendar days
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  // Parse currently selected day if matching viewYear and viewMonth
  const parsedVal = parseYearMonth(value);
  const selectedDay =
    parsedVal.year === viewYear && parsedVal.month === viewMonth
      ? parseInt(value.split('.')[2], 10)
      : null;

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center cursor-pointer group"
      >
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#F4F0E5] border border-[#DDD4C3] text-xs text-[#19221C] focus:outline-none focus:border-[#DF612D] cursor-pointer"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="absolute right-2.5 p-1 text-[#DF612D] hover:text-[#c95221] cursor-pointer transition-colors"
          title="작은 달력 열기"
          aria-label="달력 열기"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Mini Calendar Popover */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-white rounded-2xl shadow-xl border border-[#E5DCce] p-3 text-xs animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="font-extrabold text-sm text-[#19221C]">
              {viewYear}년 {viewMonth + 1}월
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                title="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                title="다음 달"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 ml-1 transition-colors cursor-pointer"
                title="닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] mb-1.5 text-stone-500">
            {weekdays.map((w, idx) => (
              <span
                key={w}
                className={idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-stone-600'}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Previous month trailing days (disabled) */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const d = prevMonthDays - firstDayOfWeek + i + 1;
              return (
                <span
                  key={`prev-${i}`}
                  className="py-1.5 text-stone-200 select-none text-[11px]"
                >
                  {d}
                </span>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const targetDate = new Date(viewYear, viewMonth, day, 0, 0, 0, 0);
              const isPastOrUnder7Days = targetDate.getTime() < minAllowedDate.getTime();
              const isSelected = selectedDay === day && !isPastOrUnder7Days;
              const dayOfWeek = (firstDayOfWeek + i) % 7;

              if (isPastOrUnder7Days) {
                return (
                  <span
                    key={`day-${day}`}
                    className="py-1.5 text-stone-300 font-normal select-none cursor-not-allowed opacity-50 text-center"
                    title="개설일 기준 최소 7일 후부터 설정 가능합니다"
                  >
                    {day}
                  </span>
                );
              }

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`py-1.5 rounded-xl font-semibold transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#DF612D] text-white shadow-xs font-bold'
                      : 'hover:bg-stone-100 text-[#19221C]'
                  } ${dayOfWeek === 0 && !isSelected ? 'text-red-600' : ''} ${
                    dayOfWeek === 6 && !isSelected ? 'text-blue-600' : ''
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer: Replaced 'Today' button with minimum 7 days notice as requested */}
          <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-[#DF612D] font-bold flex items-center gap-1">
              • 개설일 기준 최소 7일 후부터 설정 가능
            </span>
            <span className="text-stone-400 font-mono text-[10px]">
              {value || '날짜 미선택'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
