export const BIRTH_YEAR_MIN = 1900;

export interface BirthDateValidationResult {
  valid: boolean;
  formatted?: string;
  message?: string;
}

export function getBirthYearOptions(referenceDate: Date = new Date()): number[] {
  const maxYear = referenceDate.getFullYear();
  const years: number[] = [];
  for (let year = maxYear; year >= BIRTH_YEAR_MIN; year -= 1) {
    years.push(year);
  }
  return years;
}

export function getBirthMonthOptions(): Array<{ value: string; label: string }> {
  return Array.from({ length: 12 }, (_, idx) => {
    const month = idx + 1;
    return {
      value: String(month).padStart(2, '0'),
      label: `${month}월`,
    };
  });
}

export function getBirthDayOptions(): Array<{ value: string; label: string }> {
  return Array.from({ length: 31 }, (_, idx) => {
    const day = idx + 1;
    return {
      value: String(day).padStart(2, '0'),
      label: `${day}일`,
    };
  });
}

export function validateBirthDateParts(
  yearStr: string,
  monthStr: string,
  dayStr: string,
  referenceDate: Date = new Date()
): BirthDateValidationResult {
  const cleanYear = yearStr.trim();
  const cleanMonth = monthStr.trim();
  const cleanDay = dayStr.trim();

  if (!cleanYear || !cleanMonth || !cleanDay) {
    return {
      valid: false,
      message: '생년월일을 입력해 주세요.',
    };
  }

  if (!/^\d{4}$/.test(cleanYear) || !/^\d{1,2}$/.test(cleanMonth) || !/^\d{1,2}$/.test(cleanDay)) {
    return {
      valid: false,
      message: '올바른 생년월일 형식이 아닙니다.',
    };
  }

  const year = Number(cleanYear);
  const month = Number(cleanMonth);
  const day = Number(cleanDay);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return {
      valid: false,
      message: '존재하지 않는 날짜입니다. 생년월일을 다시 확인해 주세요.',
    };
  }

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  if (year < BIRTH_YEAR_MIN) {
    return {
      valid: false,
      message: '생년월일 연도를 다시 확인해 주세요.',
    };
  }

  if (year > today.getFullYear()) {
    return {
      valid: false,
      message: '미래 날짜는 생년월일로 선택할 수 없습니다.',
    };
  }

  const candidate = new Date(year, month - 1, day);
  const isRealCalendarDate =
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day;

  if (!isRealCalendarDate) {
    return {
      valid: false,
      message: '존재하지 않는 날짜입니다. 생년월일을 다시 확인해 주세요.',
    };
  }

  if (candidate.getTime() > today.getTime()) {
    return {
      valid: false,
      message: '미래 날짜는 생년월일로 선택할 수 없습니다.',
    };
  }

  const formatted = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return {
    valid: true,
    formatted,
  };
}

export function validateBirthDateString(
  birthDate: string,
  referenceDate: Date = new Date()
): BirthDateValidationResult {
  const trimmed = birthDate.trim();
  if (!trimmed) {
    return {
      valid: false,
      message: '생년월일을 입력해 주세요.',
    };
  }

  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (!match) {
    return {
      valid: false,
      message: '올바른 생년월일 형식(YYYY-MM-DD)이 아닙니다.',
    };
  }

  return validateBirthDateParts(match[1], match[2], match[3], referenceDate);
}

export function parseBirthDateParts(
  birthDate: string | null | undefined
): { year: string; month: string; day: string } {
  if (!birthDate) {
    return { year: '', month: '', day: '' };
  }
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(birthDate.trim());
  if (!match) {
    return { year: '', month: '', day: '' };
  }
  return {
    year: match[1],
    month: match[2].padStart(2, '0'),
    day: match[3].padStart(2, '0'),
  };
}

export function formatBirthDateKorean(birthDate: string | null | undefined): string {
  const parts = parseBirthDateParts(birthDate);
  if (!parts.year || !parts.month || !parts.day) {
    return '';
  }
  return `${parts.year}년 ${Number(parts.month)}월 ${Number(parts.day)}일`;
}

export function calculateAgeFromBirthDate(
  birthDate: string | null | undefined,
  referenceDate: Date = new Date()
): number | null {
  const parts = parseBirthDateParts(birthDate);
  if (!parts.year || !parts.month || !parts.day) {
    return null;
  }

  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);

  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  let age = referenceDate.getFullYear() - year;
  const currentMonth = referenceDate.getMonth() + 1;
  const currentDay = referenceDate.getDate();
  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}
