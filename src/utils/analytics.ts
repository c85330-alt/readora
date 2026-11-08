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

const STORAGE_KEY_REAL_PV = 'readora_pv_history_prod_v1';
const SESSION_KEY_UV_RECORDED = 'readora_uv_recorded_today_v1';

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabels(dateStr: string) {
  const parts = dateStr.split('-');
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = daysOfWeek[dateObj.getDay()];
  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

  return {
    dateLabel: `${month}.${day}`,
    fullDate: `${year}년 ${month}월 ${day}일 (${dayOfWeek})`,
    isWeekend
  };
}

export function getRealDailyPVRecords(): DailyPVRecord[] {
  const todayStr = getTodayDateString();
  let records: DailyPVRecord[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REAL_PV);
    if (raw) {
      records = JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }

  // Ensure today's record exists with real starting value
  let todayRec = records.find(r => r.date === todayStr);
  if (!todayRec) {
    const { dateLabel, fullDate, isWeekend } = formatDateLabels(todayStr);
    todayRec = {
      date: todayStr,
      dateLabel,
      fullDate,
      pv: 1,
      uv: 1,
      detailViews: 0,
      pps: 1.0,
      isToday: true,
      isWeekend
    };
    records.push(todayRec);
    try {
      localStorage.setItem(STORAGE_KEY_REAL_PV, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }

  // Mark isToday accurately on all records and sort chronologically
  return records.map(r => ({
    ...r,
    isToday: r.date === todayStr
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export function trackRealPageView(isDetailView: boolean = false): DailyPVRecord[] {
  const todayStr = getTodayDateString();
  let records = getRealDailyPVRecords();

  const uvSessionKey = `${SESSION_KEY_UV_RECORDED}_${todayStr}`;
  const isNewUV = typeof window !== 'undefined' && !sessionStorage.getItem(uvSessionKey);
  if (isNewUV && typeof window !== 'undefined') {
    sessionStorage.setItem(uvSessionKey, 'true');
  }

  records = records.map(r => {
    if (r.date === todayStr) {
      const newPV = r.pv + 1;
      const newUV = isNewUV ? r.uv + 1 : r.uv;
      const newDetails = isDetailView ? r.detailViews + 1 : r.detailViews;
      return {
        ...r,
        pv: newPV,
        uv: newUV,
        detailViews: newDetails,
        pps: Number((newPV / Math.max(1, newUV)).toFixed(1))
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY_REAL_PV, JSON.stringify(records));
  } catch (e) {
    console.error(e);
  }

  return records;
}
