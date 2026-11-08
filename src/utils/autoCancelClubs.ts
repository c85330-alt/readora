import { BookClub, RSVPRecord, User } from '../types';

export interface DispatchedNotification {
  id: string;
  recipientType: 'host' | 'member';
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  subject: string;
  message: string;
  timestamp: string;
  refundAmountCAD?: number;
}

export interface AutoCancellationLog {
  id: string;
  clubId: string;
  clubTitle: string;
  bookTitle: string;
  hostName: string;
  hostEmail: string;
  dateTime: string;
  cancelledAt: string;
  applicantCount: number;
  feeCAD: number;
  totalRefundCAD: number;
  reason: string;
  dispatchedEmails: DispatchedNotification[];
}

export const STORAGE_KEY_AUTO_CANCEL_LOGS = 'chapter_auto_cancellation_logs';

/**
 * Parses club date-time string:
 * Supports:
 * - "YYYY.MM.DD" (e.g., "2026.11.20")
 * - Korean format "YYYY년 M월 D일 ... (오전|오후) H:mm"
 */
export function parseClubDateTime(dateTimeStr: string): Date | null {
  if (!dateTimeStr) return null;

  // Format 1: YYYY.MM.DD
  const dotMatch = dateTimeStr.trim().match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})$/);
  if (dotMatch) {
    const year = parseInt(dotMatch[1], 10);
    const month = parseInt(dotMatch[2], 10) - 1;
    const day = parseInt(dotMatch[3], 10);
    return new Date(year, month, day, 12, 0);
  }

  // Format 2: YYYY년 M월 D일 ... (오전|오후) H:mm
  const match = dateTimeStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일.*?((?:오전|오후)\s*(\d{1,2}):(\d{2}))?/);
  if (!match) {
    const fallback = new Date(dateTimeStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);

  let hour = 12;
  let minute = 0;

  if (match[4]) {
    const isPM = match[4].includes('오후');
    let h = parseInt(match[5], 10);
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    hour = h;
    minute = parseInt(match[6], 10);
  }

  return new Date(year, month, day, hour, minute);
}

/**
 * Check if the meeting time is within 24 hours from now (or has already arrived)
 */
export function isWithin24HoursOfMeeting(dateTimeStr: string): boolean {
  const meetingDate = parseClubDateTime(dateTimeStr);
  if (!meetingDate) return false;

  const now = new Date();
  const diffMs = meetingDate.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Within 24 hours of meeting start (diffHours <= 24)
  return diffHours <= 24;
}

/**
 * Execute auto-cancellation logic for eligible clubs:
 * Condition: status !== 'cancelled' AND current confirmed applicants < 4 AND is within 24h
 */
export function checkAndExecuteAutoCancellations(
  currentClubs: BookClub[],
  currentRsvps: RSVPRecord[],
  allUsers: User[]
): {
  updatedClubs: BookClub[];
  updatedRsvps: RSVPRecord[];
  newLogs: AutoCancellationLog[];
} {
  const cancelledLogs: AutoCancellationLog[] = [];
  const autoCancelledClubIds = new Set<string>();

  const updatedClubs = currentClubs.map((club) => {
    // Already cancelled
    if (club.status === 'cancelled') return club;

    // Count confirmed RSVPs
    const clubConfirmedRsvps = currentRsvps.filter(
      (r) => r.clubId === club.id && r.status === 'confirmed'
    );
    const applicantCount = clubConfirmedRsvps.length;

    // Minimum 4 people threshold
    if (applicantCount >= 4) {
      return club;
    }

    // Check if within 24 hours of meeting
    const isUnder24h = isWithin24HoursOfMeeting(club.dateTime);

    if (isUnder24h) {
      autoCancelledClubIds.add(club.id);

      // Find host email
      const hostUser = allUsers.find(
        (u) => u.id === club.hostUserId || u.name.includes(club.hostName) || club.hostName.includes(u.name)
      );
      const hostEmail = hostUser?.email || 'readoracontact@gmail.com';

      const nowStr = new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const dispatchedEmails: DispatchedNotification[] = [];

      // 1. Notification to Host
      dispatchedEmails.push({
        id: `noti-host-${club.id}-${Date.now()}`,
        recipientType: 'host',
        recipientName: club.hostName,
        recipientEmail: hostEmail,
        recipientPhone: hostUser?.phone,
        subject: `[리도라] 《${club.bookTitle}》 모임 24시간 전 최소 인원(4명) 미달 자동 취소 안내`,
        message: `안녕하세요 호스트 ${club.hostName}님, 예정되었던 《${club.bookTitle}》 독서모임(일시: ${club.dateTime})이 모임 시작 24시간 전까지 최소 진행 기준인 4명에 미달(현재 ${applicantCount}명 신청)되어 시스템 규정에 따라 자동으로 취소되었습니다.\n\n신청하셨던 ${applicantCount}명의 회원에게 100% 전액 환불 및 모임 취소 안내 메일/SMS가 즉시 자동 발송되었습니다.`,
        timestamp: nowStr
      });

      // 2. Notifications to all applicants
      clubConfirmedRsvps.forEach((r, idx) => {
        dispatchedEmails.push({
          id: `noti-member-${club.id}-${idx}-${Date.now()}`,
          recipientType: 'member',
          recipientName: r.participantName,
          recipientEmail: r.email,
          recipientPhone: r.phone,
          refundAmountCAD: club.feeCAD,
          subject: `[리도라 전액 환불 안내] 《${club.bookTitle}》 모임 자동 취소 및 환불 안내`,
          message: `안녕하세요 ${r.participantName}님, 신청해주신 《${club.bookTitle}》 독서모임(일시: ${club.dateTime})이 모임 시작 24시간 전까지 최소 인원(4명)에 미달되어 안전 규정에 따라 자동으로 취소되었습니다.\n\n결제하신 참가비 CAD $${club.feeCAD}는 등록하신 결제수단으로 100% 전액 자동 환불 처리되었습니다. 불편을 드려 죄송하며, 더욱 풍성한 다른 모임에서 뵙겠습니다.`,
          timestamp: nowStr
        });
      });

      const logRecord: AutoCancellationLog = {
        id: `auto-cancel-${club.id}-${Date.now()}`,
        clubId: club.id,
        clubTitle: club.title,
        bookTitle: club.bookTitle,
        hostName: club.hostName,
        hostEmail: hostEmail,
        dateTime: club.dateTime,
        cancelledAt: nowStr,
        applicantCount,
        feeCAD: club.feeCAD,
        totalRefundCAD: applicantCount * club.feeCAD,
        reason: '모임 시작 24시간 전 최소 인원(4명) 미달로 인한 자동 취소 (100% 전액 환불 및 호스트/신청자 취소 안내 메일 발송 완료)',
        dispatchedEmails
      };

      cancelledLogs.push(logRecord);

      return {
        ...club,
        status: 'cancelled' as const,
        cancelReason: logRecord.reason
      };
    }

    return club;
  });

  // Cancel associated RSVPs
  const updatedRsvps = currentRsvps.map((rsvp) => {
    if (autoCancelledClubIds.has(rsvp.clubId)) {
      return {
        ...rsvp,
        status: 'cancelled' as const
      };
    }
    return rsvp;
  });

  // Persist logs in localStorage
  if (cancelledLogs.length > 0) {
    try {
      const existingLogsStr = localStorage.getItem(STORAGE_KEY_AUTO_CANCEL_LOGS);
      const existingLogs: AutoCancellationLog[] = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      const combinedLogs = [...cancelledLogs, ...existingLogs].slice(0, 50);
      localStorage.setItem(STORAGE_KEY_AUTO_CANCEL_LOGS, JSON.stringify(combinedLogs));
    } catch (e) {
      console.error('Failed to save auto cancellation logs:', e);
    }
  }

  return {
    updatedClubs,
    updatedRsvps,
    newLogs: cancelledLogs
  };
}

/**
 * Force simulate 24-hour auto cancellation on any target club (for immediate verification/testing by host or admin)
 */
export function simulateAutoCancelClub(
  club: BookClub,
  currentClubs: BookClub[],
  currentRsvps: RSVPRecord[],
  allUsers: User[]
): {
  updatedClubs: BookClub[];
  updatedRsvps: RSVPRecord[];
  log: AutoCancellationLog;
} {
  const clubConfirmedRsvps = currentRsvps.filter(
    (r) => r.clubId === club.id && r.status === 'confirmed'
  );
  const applicantCount = clubConfirmedRsvps.length;

  const hostUser = allUsers.find(
    (u) => u.id === club.hostUserId || u.name.includes(club.hostName) || club.hostName.includes(u.name)
  );
  const hostEmail = hostUser?.email || 'readoracontact@gmail.com';

  const nowStr = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const dispatchedEmails: DispatchedNotification[] = [];

  // 1. Host notice
  dispatchedEmails.push({
    id: `noti-host-${club.id}-${Date.now()}`,
    recipientType: 'host',
    recipientName: club.hostName,
    recipientEmail: hostEmail,
    recipientPhone: hostUser?.phone,
    subject: `[리도라] 《${club.bookTitle}》 모임 24시간 전 최소 인원(4명) 미달 자동 취소 안내`,
    message: `안녕하세요 호스트 ${club.hostName}님, 예정되었던 《${club.bookTitle}》 독서모임(일시: ${club.dateTime})이 모임 시작 24시간 전까지 최소 진행 기준인 4명에 미달(현재 ${applicantCount}명 신청)되어 시스템 규정에 따라 자동으로 취소되었습니다.\n\n신청하셨던 ${applicantCount}명의 회원에게 100% 전액 환불 및 모임 취소 안내 메일/SMS가 즉시 자동 발송되었습니다.`,
    timestamp: nowStr
  });

  // 2. Applicant members notice
  clubConfirmedRsvps.forEach((r, idx) => {
    dispatchedEmails.push({
      id: `noti-member-${club.id}-${idx}-${Date.now()}`,
      recipientType: 'member',
      recipientName: r.participantName,
      recipientEmail: r.email,
      recipientPhone: r.phone,
      refundAmountCAD: club.feeCAD,
      subject: `[리도라 전액 환불 안내] 《${club.bookTitle}》 모임 자동 취소 및 환불 안내`,
      message: `안녕하세요 ${r.participantName}님, 신청해주신 《${club.bookTitle}》 독서모임(일시: ${club.dateTime})이 모임 시작 24시간 전까지 최소 인원(4명)에 미달되어 안전 규정에 따라 자동으로 취소되었습니다.\n\n결제하신 참가비 CAD $${club.feeCAD}는 등록하신 결제수단으로 100% 전액 자동 환불 처리되었습니다. 불편을 드려 죄송하며, 더욱 풍성한 다른 모임에서 뵙겠습니다.`,
      timestamp: nowStr
    });
  });

  const logRecord: AutoCancellationLog = {
    id: `auto-cancel-${club.id}-${Date.now()}`,
    clubId: club.id,
    clubTitle: club.title,
    bookTitle: club.bookTitle,
    hostName: club.hostName,
    hostEmail,
    dateTime: club.dateTime,
    cancelledAt: nowStr,
    applicantCount,
    feeCAD: club.feeCAD,
    totalRefundCAD: applicantCount * club.feeCAD,
    reason: '모임 시작 24시간 전 최소 인원(4명) 미달로 인한 자동 취소 (100% 전액 환불 및 호스트/신청자 취소 안내 메일 발송 완료)',
    dispatchedEmails
  };

  const updatedClubs = currentClubs.map((c) =>
    c.id === club.id
      ? {
          ...c,
          status: 'cancelled' as const,
          cancelReason: logRecord.reason
        }
      : c
  );

  const updatedRsvps = currentRsvps.map((r) =>
    r.clubId === club.id
      ? {
          ...r,
          status: 'cancelled' as const
        }
      : r
  );

  // Persist
  try {
    const existingLogsStr = localStorage.getItem(STORAGE_KEY_AUTO_CANCEL_LOGS);
    const existingLogs: AutoCancellationLog[] = existingLogsStr ? JSON.parse(existingLogsStr) : [];
    localStorage.setItem(STORAGE_KEY_AUTO_CANCEL_LOGS, JSON.stringify([logRecord, ...existingLogs]));
  } catch (e) {
    console.error(e);
  }

  return {
    updatedClubs,
    updatedRsvps,
    log: logRecord
  };
}
