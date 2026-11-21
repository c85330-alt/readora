import React, { useState } from 'react';
import { 
  X, AlertTriangle, Mail, Phone, Clock, ShieldCheck, CheckCircle2, 
  Send, DollarSign, UserCheck, RefreshCw, ChevronRight, Inbox
} from 'lucide-react';
import { AutoCancellationLog } from '../utils/autoCancelClubs';

interface AutoCancellationNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AutoCancellationLog[];
}

export const AutoCancellationNoticeModal: React.FC<AutoCancellationNoticeModalProps> = ({
  isOpen,
  onClose,
  logs
}) => {
  const [selectedLogId, setSelectedLogId] = useState<string>(logs[0]?.id || '');

  if (!isOpen) return null;

  const activeLog = logs.find((l) => l.id === selectedLogId) || logs[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#191919]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#FBF9E9] rounded-2xl shadow-2xl border border-[#191919]/20 my-8 overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#191919] text-[#FBF9E9] flex items-center justify-between border-b border-[#191919] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFE57E] text-[#191919] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-extrabold text-[#FBF9E9]">24시간 최소 인원 미달 자동 취소 시스템 알림</h3>
                <span className="text-[11px] font-bold bg-[#F16B47] text-white px-2 py-0.5 rounded-md">
                  자동 발송 완료
                </span>
              </div>
              <p className="text-xs text-[#FBF9E9]/70 mt-0.5">
                모임 시작 24시간 전까지 최소 4명 미달 시 자동 취소되며, 호스트 및 신청자 전원에게 알림 및 메일이 전송됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-2 rounded-lg bg-white/10 hover:bg-[#FFE57E] hover:text-[#191919] text-[#FBF9E9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {logs.length === 0 ? (
            <div className="text-center py-16 bg-[#FFFDF4] rounded-2xl border border-[#191919]/15 p-8">
              <Inbox className="w-12 h-12 text-[#191919]/40 mx-auto mb-3" />
              <h4 className="text-base font-extrabold text-[#191919]">현재 자동 취소된 모임 내역이 없습니다</h4>
              <p className="text-xs text-[#191919]/65 mt-1 max-w-md mx-auto">
                모든 모임이 정상적으로 4인 이상 모집되었거나 아직 24시간 이전 상태입니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: List of Auto-cancelled clubs */}
              <div className="lg:col-span-4 space-y-2">
                <span className="text-xs font-bold text-[#191919]/70 block mb-2 px-1">
                  자동 취소 처리된 모임 ({logs.length}건)
                </span>
                <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {logs.map((log) => {
                    const isSelected = (activeLog?.id === log.id);
                    return (
                      <button
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#191919] text-[#FBF9E9] border-[#191919]'
                            : 'bg-[#FFFDF4] hover:border-[#191919]/40 text-[#191919] border-[#191919]/15'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className={`font-bold ${isSelected ? 'text-[#FFE57E]' : 'text-[#F16B47]'}`}>
                            24시간 미달 자동 취소
                          </span>
                          <span className={`${isSelected ? 'text-[#FBF9E9]/65' : 'text-[#191919]/45'}`}>
                            {log.cancelledAt.split(' ').slice(1, 3).join(' ')}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold truncate mb-1">
                          《{log.bookTitle}》
                        </h5>
                        <div className={`text-[11px] flex items-center justify-between ${isSelected ? 'text-[#FBF9E9]/75' : 'text-[#191919]/60'}`}>
                          <span>호스트: {log.hostName}</span>
                          <span className="tabular-nums">신청 {log.applicantCount}명</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Dispatch Info & Emails */}
              {activeLog && (
                <div className="lg:col-span-8 space-y-4">
                  {/* Summary Card */}
                  <div className="bg-[#FFFDF4] rounded-2xl p-5 border border-[#191919]/15 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#191919]/12 pb-3">
                      <div>
                        <span className="text-[11px] font-bold text-[#B93815] bg-[#F16B47]/15 px-2 py-0.5 rounded-md">
                          자동 취소 확정 및 100% 전액 환불
                        </span>
                        <h4 className="text-base font-extrabold text-[#191919] mt-1">
                          《{activeLog.bookTitle}》
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-[#191919]/50 block">모임 예정 일시</span>
                        <span className="text-xs font-bold text-[#191919]">{activeLog.dateTime}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#FBF9E9] p-2.5 rounded-xl border border-[#191919]/12">
                        <span className="text-[10px] text-[#191919]/55 block">담당 호스트</span>
                        <span className="font-bold text-[#191919] truncate block">{activeLog.hostName}</span>
                      </div>
                      <div className="bg-[#FBF9E9] p-2.5 rounded-xl border border-[#191919]/12">
                        <span className="text-[10px] text-[#191919]/55 block">최종 신청자 수</span>
                        <span className="font-bold text-[#F16B47] tabular-nums">{activeLog.applicantCount}명 (최소 4명 미달)</span>
                      </div>
                      <div className="bg-[#FBF9E9] p-2.5 rounded-xl border border-[#191919]/12">
                        <span className="text-[10px] text-[#191919]/55 block">1인 참가비</span>
                        <span className="font-bold text-[#191919] tabular-nums">CAD ${activeLog.feeCAD}</span>
                      </div>
                      <div className="bg-[#B9D8E6]/35 p-2.5 rounded-xl border border-[#191919]/15">
                        <span className="text-[10px] text-[#191919]/70 block">총 전액 환불액</span>
                        <span className="font-bold text-[#191919] tabular-nums">CAD ${activeLog.totalRefundCAD}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#191919] bg-[#FFE57E]/30 p-3 rounded-xl border border-[#191919]/15 leading-relaxed">
                      <strong>취소 사유:</strong> {activeLog.reason}
                    </div>
                  </div>

                  {/* Dispatched Emails & Notifications */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-[#191919] flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-[#F16B47]" />
                        <span>자동 발송된 취소 안내 메일 및 SMS 내역 ({activeLog.dispatchedEmails.length}건)</span>
                      </h5>
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        전송 상태: 성공
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                      {activeLog.dispatchedEmails.map((email) => {
                        const isHost = email.recipientType === 'host';
                        return (
                          <div
                            key={email.id}
                            className={`p-4 rounded-xl border text-xs space-y-2 ${
                              isHost
                                ? 'bg-[#FFE57E]/25 border-[#191919]/20'
                                : 'bg-[#FFFDF4] border-[#191919]/15'
                            }`}
                          >
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isHost ? 'bg-[#FFE57E] text-[#191919]' : 'bg-[#B9D8E6]/60 text-[#191919]'
                                }`}>
                                  {isHost ? '호스트 수신 메일' : '신청 회원 수신 메일'}
                                </span>
                                <span className="font-bold text-[#191919]">
                                  {email.recipientName} ({email.recipientEmail})
                                </span>
                                {email.recipientPhone && (
                                  <span className="text-[11px] text-[#191919]/55">
                                    • {email.recipientPhone}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#191919]/45">{email.timestamp}</span>
                            </div>

                            <div className="font-bold text-[#191919] text-xs border-b border-[#191919]/10 pb-1.5">
                              {email.subject}
                            </div>

                            <p className="text-[11px] text-[#191919]/75 leading-relaxed whitespace-pre-line bg-[#FBF9E9] p-3 rounded-lg border border-[#191919]/10">
                              {email.message}
                            </p>

                            {!isHost && email.refundAmountCAD && (
                              <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1 pt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                                <span>환불 보증: 참가비 CAD ${email.refundAmountCAD} 전액 자동 환불 완료</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FFFDF4] border-t border-[#191919]/15 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#191919]/60">
            <Clock className="w-3.5 h-3.5 text-[#F16B47]" />
            <span>최소 인원(4명) 자동 점검 주기는 실시간으로 동작합니다.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-xs font-bold cursor-pointer transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
