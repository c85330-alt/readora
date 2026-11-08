import React, { useState, useEffect } from 'react';
import { BookClub, RSVPRecord, HostApplication, User } from './types';
import { INITIAL_BOOK_CLUBS } from './data/initialClubs';
import { INITIAL_USERS, INITIAL_RSVPS } from './data/initialUsers';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoriesSection } from './components/CategoriesSection';
import { ClubExplorer } from './components/ClubExplorer';
import { ClubDetailModal } from './components/ClubDetailModal';
import { MyChaptersModal } from './components/MyChaptersModal';
import { MyPageModal } from './components/MyPageModal';
import { BecomeHostModal } from './components/BecomeHostModal';
import { CreateClubModal } from './components/CreateClubModal';
import { EditClubModal } from './components/EditClubModal';
import { CancelClubModal } from './components/CancelClubModal';
import { HostDashboard } from './components/HostDashboard';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LogoutConfirmModal } from './components/LogoutConfirmModal';
import { AutoCancellationNoticeModal } from './components/AutoCancellationNoticeModal';
import { 
  AutoCancellationLog, 
  STORAGE_KEY_AUTO_CANCEL_LOGS, 
  checkAndExecuteAutoCancellations, 
  simulateAutoCancelClub 
} from './utils/autoCancelClubs';
import { Crown } from 'lucide-react';

const STORAGE_KEY_CLUBS = 'chapter_calgary_clubs_v3';
const STORAGE_KEY_RSVPS = 'chapter_calgary_rsvps_v3';
const STORAGE_KEY_USERS = 'chapter_calgary_users_v3';
const STORAGE_KEY_CURRENT_USER = 'chapter_calgary_session_user_v3';

export default function App() {
  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (!parsed.some((u) => u.username === 'calgary_host')) {
          const hostUser = INITIAL_USERS.find((u) => u.username === 'calgary_host');
          if (hostUser) return [hostUser, ...parsed];
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  // Current session user - start as null for first-time pre-login view as requested
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  // Admin view toggle (when logged in as admin)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Host view toggle (when logged in as host)
  const [isHostMode, setIsHostMode] = useState<boolean>(false);

  // Auth modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');

  // Load clubs from local storage or fallback to initial data
  const [clubs, setClubs] = useState<BookClub[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLUBS);
      if (saved) {
        const parsed: BookClub[] = JSON.parse(saved);
        return parsed.map((c) => {
          if (c.id === 'club-2' && !c.hostUserId) {
            return { ...c, hostUserId: 'user-host-1', hostName: '정세라 (호스트)' };
          }
          if (c.id === 'club-1' && !c.hostUserId) {
            return { ...c, hostUserId: 'user-admin-1' };
          }
          return c;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOK_CLUBS;
  });

  // Load RSVPs
  const [rsvps, setRsvps] = useState<RSVPRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RSVPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_RSVPS;
  });

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Modals state
  const [selectedClubForModal, setSelectedClubForModal] = useState<BookClub | null>(null);
  const [isMyChaptersOpen, setIsMyChaptersOpen] = useState(false);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [isBecomeHostOpen, setIsBecomeHostOpen] = useState(false);
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<BookClub | null>(null);
  const [cancelingClub, setCancelingClub] = useState<BookClub | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isAutoCancelModalOpen, setIsAutoCancelModalOpen] = useState(false);
  const [autoCancelLogs, setAutoCancelLogs] = useState<AutoCancellationLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTO_CANCEL_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(rsvps));
  }, [rsvps]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  // Run 24-hour auto-cancellation check for clubs failing 4-person minimum
  const handleRunAutoCancellationCheck = (isManualTrigger = false) => {
    const { updatedClubs, updatedRsvps, newLogs } = checkAndExecuteAutoCancellations(clubs, rsvps, users);
    if (newLogs.length > 0) {
      setClubs(updatedClubs);
      setRsvps(updatedRsvps);
      setAutoCancelLogs((prev) => [...newLogs, ...prev]);
      const titles = newLogs.map((l) => `《${l.bookTitle}》`).join(', ');
      showToast(`⚠️ [24시간 미달 자동 취소] ${titles} 모임이 자동 취소되었습니다. 호스트 및 신청자 전원에게 취소 알림/메일이 발송되고 100% 전액 환불되었습니다.`);
    } else if (isManualTrigger) {
      // Find an eligible active club with < 4 seats to simulate
      const eligibleClub = clubs.find((c) => c.status !== 'cancelled' && c.currentSeats < 4);
      if (eligibleClub) {
        const { updatedClubs: simClubs, updatedRsvps: simRsvps, log } = simulateAutoCancelClub(eligibleClub, clubs, rsvps, users);
        setClubs(simClubs);
        setRsvps(simRsvps);
        setAutoCancelLogs((prev) => [log, ...prev]);
        showToast(`⚡ [24시간 미달 자동 취소 시뮬레이션 완료] 《${eligibleClub.bookTitle}》 모임이 자동 취소되었습니다. 호스트(${eligibleClub.hostName}) 및 신청자(${log.applicantCount}명) 전원에게 취소 메일이 발송되었습니다.`);
      } else {
        showToast('현재 등록된 모든 모임이 최소 인원(4명) 이상 충족되었거나 정상 진행 중입니다.');
      }
    }
  };

  // Initial check on mount
  useEffect(() => {
    handleRunAutoCancellationCheck(false);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setIsAdminMode(true);
      setIsHostMode(false);
      showToast(`👑 총괄 관리자(${user.name})님 환영합니다! 관리자 대시보드로 이동합니다.`);
    } else if (user.role === 'host') {
      setIsHostMode(true);
      setIsAdminMode(false);
      showToast(`👑 ${user.name}님 환영합니다! 호스트 모임 관리 센터로 이동합니다.`);
    } else {
      setIsAdminMode(false);
      setIsHostMode(false);
      showToast(`🎉 ${user.name}님 환영합니다! 리도라(Readora) 독서모임에 참여해보세요.`);
    }
  };

  const handleRequestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminMode(false);
    setIsHostMode(false);
    showToast('안전하게 로그아웃 되었습니다.');
  };

  const handleRegisterUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleResetPassword = (username: string, newPw: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.username.toLowerCase() === username.toLowerCase()
          ? { ...u, password: newPw }
          : u
      )
    );
    if (currentUser && currentUser.username.toLowerCase() === username.toLowerCase()) {
      setCurrentUser((prev) => (prev ? { ...prev, password: newPw } : null));
    }
    showToast('🔒 비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해 주세요.');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    showToast('👤 개인정보가 성공적으로 업데이트되었습니다.');
  };

  // Status & Club Management Handlers
  const handleUpdateClubStatus = (clubId: string, newStatus: 'open' | 'almost_full' | 'closed' | 'cancelled') => {
    setClubs((prev) =>
      prev.map((c) => (c.id === clubId ? { ...c, status: newStatus } : c))
    );
    showToast('모임 상태가 변경되었습니다.');
  };

  const handleUpdateRSVPStatus = (rsvpId: string, newStatus: 'confirmed' | 'cancelled') => {
    setRsvps((prev) =>
      prev.map((r) => (r.id === rsvpId ? { ...r, status: newStatus } : r))
    );
    showToast(newStatus === 'confirmed' ? '신청이 승인되었습니다.' : '신청이 취소 처리되었습니다.');
  };

  // Save edited club
  const handleSaveEditedClub = (updatedClub: BookClub) => {
    setClubs((prev) =>
      prev.map((c) => (c.id === updatedClub.id ? updatedClub : c))
    );
    if (selectedClubForModal && selectedClubForModal.id === updatedClub.id) {
      setSelectedClubForModal(updatedClub);
    }
    showToast(`✏️ 《${updatedClub.bookTitle}》 모임 정보가 성공적으로 수정되었습니다.`);
  };

  // Confirm cancel club with 100% full refund guarantee
  const handleConfirmCancelClub = (clubId: string, reason: string) => {
    setClubs((prev) =>
      prev.map((c) =>
        c.id === clubId
          ? { ...c, status: 'cancelled' as const, cancelReason: reason }
          : c
      )
    );

    // Cancel all RSVPs for this club
    setRsvps((prev) =>
      prev.map((r) =>
        r.clubId === clubId
          ? { ...r, status: 'cancelled' as const }
          : r
      )
    );

    const targetClub = clubs.find((c) => c.id === clubId);
    const applicantCount = rsvps.filter((r) => r.clubId === clubId && r.status === 'confirmed').length;

    showToast(`⚠️ 《${targetClub?.bookTitle || '모임'}》이 취소되었습니다. 신청 회원 ${applicantCount}명에게 100% 전액 환불 및 취소 알림이 전송되었습니다.`);
  };

  // Set of registered club IDs for current user
  const userRSVPs = currentUser
    ? rsvps.filter(
        (r) =>
          r.userId === currentUser.id ||
          r.email.toLowerCase() === currentUser.email.toLowerCase() ||
          r.participantName === currentUser.name
      )
    : [];

  const registeredClubIds = new Set(
    userRSVPs.filter((r) => r.status === 'confirmed').map((r) => r.clubId)
  );

  // Handler: RSVP for a club
  const handleRSVP = (data: Omit<RSVPRecord, 'id' | 'registeredAt' | 'status'>) => {
    const newRecord: RSVPRecord = {
      ...data,
      id: `rsvp-${Date.now()}`,
      userId: currentUser?.id,
      registeredAt: new Date().toLocaleDateString('ko-KR'),
      status: 'confirmed'
    };

    setRsvps((prev) => [newRecord, ...prev]);

    // Update club seat count
    let reachedThreshold = false;
    let targetClubTitle = '';

    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === data.clubId) {
          const updatedSeats = c.currentSeats + 1;
          targetClubTitle = c.bookTitle;
          if (updatedSeats === 4 && c.currentSeats < 4) {
            reachedThreshold = true;
          }
          return {
            ...c,
            currentSeats: updatedSeats,
            status: updatedSeats >= c.maxSeats ? 'closed' : updatedSeats >= c.maxSeats - 2 ? 'almost_full' : 'open'
          };
        }
        return c;
      })
    );

    if (reachedThreshold) {
      showToast(`🎉 《${targetClubTitle}》 모임의 최소 인원(4명)이 충족되었습니다! 진행 확정 알림이 모든 신청자에게 자동 발송되었습니다.`);
    } else {
      showToast(`🎉 '${data.bookTitle}' 모임 신청이 완료되었습니다! 최소 인원(4명) 충족 시 확정 알림이 자동 발송됩니다.`);
    }
  };

  // Handler: Cancel RSVP
  const handleCancelRSVP = (rsvpId: string, clubId: string) => {
    setRsvps((prev) =>
      prev.map((r) => (r.id === rsvpId ? { ...r, status: 'cancelled' } : r))
    );

    // Release seat
    setClubs((prev) =>
      prev.map((c) => {
        if (c.id === clubId) {
          const updatedSeats = Math.max(0, c.currentSeats - 1);
          return {
            ...c,
            currentSeats: updatedSeats,
            status: updatedSeats >= c.maxSeats ? 'closed' : updatedSeats >= c.maxSeats - 2 ? 'almost_full' : 'open'
          };
        }
        return c;
      })
    );

    showToast('모임 신청이 취소되었습니다.');
  };

  // Handler: Save notes in My Chapters
  const handleSaveNote = (rsvpId: string, notes: string) => {
    setRsvps((prev) =>
      prev.map((r) => (r.id === rsvpId ? { ...r, userNotes: notes } : r))
    );
    showToast('독서 메모가 안전하게 저장되었습니다.');
  };

  // Handler: Create new club
  const handleCreateClub = (newClub: BookClub) => {
    // If created by current host, set hostUserId
    const clubWithHost = {
      ...newClub,
      hostUserId: currentUser?.id || newClub.hostUserId,
      hostName: currentUser?.role === 'host' ? currentUser.name : newClub.hostName
    };

    setClubs((prev) => [clubWithHost, ...prev]);
    showToast(`📖 새로운 독서모임 《${newClub.bookTitle}》이 실시간으로 등록되었습니다!`);
    
    // Smooth scroll to explore
    setTimeout(() => {
      document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  // Handler: Delete club (Admin/Host)
  const handleDeleteClub = (clubId: string) => {
    setClubs((prev) => prev.filter((c) => c.id !== clubId));
    showToast('독서모임이 안전하게 삭제되었습니다.');
  };

  const scrollToExplore = () => {
    document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // VIEW 1: Admin Dashboard (when admin is logged in and in admin mode)
  if (currentUser?.role === 'admin' && isAdminMode) {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#172E22] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-bounce">
            <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
          </div>
        )}

        <AdminDashboard
          currentUser={currentUser}
          onLogout={handleRequestLogout}
          onSwitchToUserView={() => setIsAdminMode(false)}
          users={users}
          clubs={clubs}
          rsvps={rsvps}
          onUpdateClubStatus={handleUpdateClubStatus}
          onUpdateRSVPStatus={handleUpdateRSVPStatus}
          onOpenCreateClub={() => setIsCreateClubOpen(true)}
          onSelectClubDetail={(club) => setSelectedClubForModal(club)}
          onEditClub={(club) => setEditingClub(club)}
          onRequestCancelClub={(club) => setCancelingClub(club)}
          onDeleteClub={handleDeleteClub}
          onTriggerAutoCancellationCheck={() => handleRunAutoCancellationCheck(true)}
          onViewAutoCancelLogs={() => setIsAutoCancelModalOpen(true)}
          autoCancelLogsCount={autoCancelLogs.length}
          onOpenMyPage={() => setIsMyPageOpen(true)}
        />

        {/* Club Detail Modal inside Admin View (Management Mode: Bottom payment bar hidden) */}
        <ClubDetailModal
          club={selectedClubForModal}
          onClose={() => setSelectedClubForModal(null)}
          onRSVP={handleRSVP}
          isRegistered={selectedClubForModal ? registeredClubIds.has(selectedClubForModal.id) : false}
          onOpenMyChapters={() => setIsMyChaptersOpen(true)}
          currentUser={currentUser}
          onOpenLogin={() => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
          isManagementView={true}
        />

        {/* Auto Cancellation Dispatched Notice Modal */}
        <AutoCancellationNoticeModal
          isOpen={isAutoCancelModalOpen}
          onClose={() => setIsAutoCancelModalOpen(false)}
          logs={autoCancelLogs}
        />

        {/* Edit Club Modal */}
        <EditClubModal
          isOpen={!!editingClub}
          club={editingClub}
          onClose={() => setEditingClub(null)}
          onSaveClub={handleSaveEditedClub}
        />

        {/* Cancel Club Modal */}
        <CancelClubModal
          isOpen={!!cancelingClub}
          club={cancelingClub}
          applicants={cancelingClub ? rsvps.filter((r) => r.clubId === cancelingClub.id && r.status === 'confirmed') : []}
          onClose={() => setCancelingClub(null)}
          onConfirmCancel={handleConfirmCancelClub}
        />

        {/* Create Club Modal */}
        <CreateClubModal
          isOpen={isCreateClubOpen}
          onClose={() => setIsCreateClubOpen(false)}
          onCreateClub={handleCreateClub}
          currentUser={currentUser}
        />

        {/* My Page Modal */}
        <MyPageModal
          isOpen={isMyPageOpen}
          onClose={() => setIsMyPageOpen(false)}
          currentUser={currentUser}
          rsvps={rsvps}
          allClubs={clubs}
          onUpdateUser={handleUpdateUser}
          onCancelRSVP={handleCancelRSVP}
          onSaveNote={handleSaveNote}
          onSelectClubDetail={(club) => setSelectedClubForModal(club)}
          onExploreClubs={() => {
            setIsMyPageOpen(false);
            setIsAdminMode(false);
            scrollToExplore();
          }}
        />

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleLogout}
          userName={currentUser?.name}
        />
      </>
    );
  }

  // VIEW 2: Host Dashboard (when host is logged in and in host mode)
  if (currentUser?.role === 'host' && isHostMode) {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#172E22] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-bounce">
            <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
          </div>
        )}

        <HostDashboard
          currentUser={currentUser}
          clubs={clubs}
          rsvps={rsvps}
          onOpenCreateClub={() => setIsCreateClubOpen(true)}
          onEditClub={(club) => setEditingClub(club)}
          onRequestCancelClub={(club) => setCancelingClub(club)}
          onSelectClubDetail={(club) => setSelectedClubForModal(club)}
          onSwitchToUserView={() => setIsHostMode(false)}
          onLogout={handleRequestLogout}
          onTriggerAutoCancellationCheck={() => handleRunAutoCancellationCheck(true)}
          onViewAutoCancelLogs={() => setIsAutoCancelModalOpen(true)}
          autoCancelLogsCount={autoCancelLogs.length}
          onOpenMyPage={() => setIsMyPageOpen(true)}
        />

        {/* Club Detail Modal inside Host View (Management Mode: Bottom payment bar hidden) */}
        <ClubDetailModal
          club={selectedClubForModal}
          onClose={() => setSelectedClubForModal(null)}
          onRSVP={handleRSVP}
          isRegistered={selectedClubForModal ? registeredClubIds.has(selectedClubForModal.id) : false}
          onOpenMyChapters={() => setIsMyChaptersOpen(true)}
          currentUser={currentUser}
          onOpenLogin={() => {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
          }}
          isManagementView={true}
        />

        {/* Auto Cancellation Dispatched Notice Modal */}
        <AutoCancellationNoticeModal
          isOpen={isAutoCancelModalOpen}
          onClose={() => setIsAutoCancelModalOpen(false)}
          logs={autoCancelLogs}
        />

        {/* Edit Club Modal */}
        <EditClubModal
          isOpen={!!editingClub}
          club={editingClub}
          onClose={() => setEditingClub(null)}
          onSaveClub={handleSaveEditedClub}
        />

        {/* Cancel Club Modal */}
        <CancelClubModal
          isOpen={!!cancelingClub}
          club={cancelingClub}
          applicants={cancelingClub ? rsvps.filter((r) => r.clubId === cancelingClub.id && r.status === 'confirmed') : []}
          onClose={() => setCancelingClub(null)}
          onConfirmCancel={handleConfirmCancelClub}
        />

        {/* Create Club Modal */}
        <CreateClubModal
          isOpen={isCreateClubOpen}
          onClose={() => setIsCreateClubOpen(false)}
          onCreateClub={handleCreateClub}
          currentUser={currentUser}
        />

        {/* My Page Modal */}
        <MyPageModal
          isOpen={isMyPageOpen}
          onClose={() => setIsMyPageOpen(false)}
          currentUser={currentUser}
          rsvps={rsvps}
          allClubs={clubs}
          onUpdateUser={handleUpdateUser}
          onCancelRSVP={handleCancelRSVP}
          onSaveNote={handleSaveNote}
          onSelectClubDetail={(club) => setSelectedClubForModal(club)}
          onExploreClubs={() => {
            setIsMyPageOpen(false);
            setIsHostMode(false);
            scrollToExplore();
          }}
        />

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          isOpen={isLogoutConfirmOpen}
          onClose={() => setIsLogoutConfirmOpen(false)}
          onConfirm={handleLogout}
          userName={currentUser?.name}
        />
      </>
    );
  }

  // Unified Web Application (for guests and authenticated members/hosts/admins)
  return (
    <div className="min-h-screen bg-[#F4F0E5] text-[#19221C] flex flex-col font-sans selection:bg-[#DF612D]/20 selection:text-[#DF612D]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#172E22] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 animate-bounce">
          <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Admin Quick Switch Bar */}
      {currentUser?.role === 'admin' && (
        <div className="bg-[#172E22] text-white text-xs py-2 px-4 flex items-center justify-between sticky top-0 z-50 border-b border-emerald-900 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">총괄 관리자 접속 중:</span>
            <span className="font-mono text-stone-300">{currentUser.name}</span>
          </div>
          <button
            onClick={() => setIsAdminMode(true)}
            className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
          >
            관리자 대시보드로 전환 →
          </button>
        </div>
      )}

      {/* Host Quick Switch Bar */}
      {currentUser?.role === 'host' && (
        <div className="bg-[#B45309] text-white text-xs py-2 px-4 flex items-center justify-between sticky top-0 z-50 border-b border-amber-900 shadow-sm">
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-200" />
            <span className="font-semibold text-amber-100">호스트 계정 접속 중:</span>
            <span className="font-mono text-stone-200">{currentUser.name}</span>
          </div>
          <button
            onClick={() => setIsHostMode(true)}
            className="px-3 py-1 rounded-full bg-white text-amber-900 font-bold text-[11px] hover:bg-amber-50 transition-colors cursor-pointer shadow-xs"
          >
            호스트 모임 관리 센터로 전환 →
          </button>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => {
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
        onOpenSignup={() => {
          setAuthModalTab('signup');
          setIsAuthModalOpen(true);
        }}
        onRequestLogout={handleRequestLogout}
        onOpenAdmin={() => setIsAdminMode(true)}
        onOpenHostDashboard={() => setIsHostMode(true)}
        onOpenMyChapters={() => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('내 모임 관리는 로그인 후 이용하실 수 있습니다.');
            return;
          }
          setIsMyChaptersOpen(true);
        }}
        onOpenMyPage={() => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('마이페이지는 로그인 후 이용하실 수 있습니다.');
            return;
          }
          setIsMyPageOpen(true);
        }}
        onOpenBecomeHost={() => setIsBecomeHostOpen(true)}
        onOpenCreateClub={() => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('모임 개설은 로그인 후 이용하실 수 있습니다.');
            return;
          }
          setIsCreateClubOpen(true);
        }}
        onScrollToExplore={scrollToExplore}
        joinedCount={userRSVPs.filter((r) => r.status === 'confirmed').length}
      />

      {/* Hero Section */}
      <Hero
        currentUser={currentUser}
        onExploreClick={scrollToExplore}
        onOpenLogin={() => {
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
        onOpenSignup={() => {
          setAuthModalTab('signup');
          setIsAuthModalOpen(true);
        }}
        onRequestLogout={handleRequestLogout}
        onBecomeHostClick={() => setIsBecomeHostOpen(true)}
        onOpenHostDashboard={() => setIsHostMode(true)}
      />

      {/* Pick a Program / Book Categories */}
      <CategoriesSection
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          scrollToExplore();
        }}
        onViewAll={() => {
          setSelectedCategory('전체');
          scrollToExplore();
        }}
      />

      {/* Goal 1: Club Explorer & Search */}
      <ClubExplorer
        clubs={clubs}
        onSelectClub={(club) => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('🔒 독서모임 상세 정보 확인 및 모임 신청은 로그인 후 이용하실 수 있습니다.');
            return;
          }
          setSelectedClubForModal(club);
        }}
        onOpenCreateClub={() => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('모임 개설은 로그인 후 이용하실 수 있습니다.');
            return;
          }
          setIsCreateClubOpen(true);
        }}
        registeredClubIds={registeredClubIds}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        currentUser={currentUser}
      />

      {/* FAQ */}
      <FaqSection />

      {/* Footer */}
      <Footer
        onExploreClubs={scrollToExplore}
        onBecomeHost={() => setIsBecomeHostOpen(true)}
        onOpenMyChapters={() => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('내 모임 관리는 로그인 후 이용하실 수 있습니다.');
            return;
          }
          setIsMyChaptersOpen(true);
        }}
        onOpenMyPage={() => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('마이페이지는 로그인 후 이용하실 수 있습니다.');
            return;
          }
          setIsMyPageOpen(true);
        }}
      />

      {/* Modals */}
      {/* 1. Club Detail Modal */}
      <ClubDetailModal
        club={selectedClubForModal}
        onClose={() => setSelectedClubForModal(null)}
        onRSVP={handleRSVP}
        isRegistered={selectedClubForModal ? registeredClubIds.has(selectedClubForModal.id) : false}
        onOpenMyChapters={() => setIsMyChaptersOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => {
          setAuthModalTab('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* 2. My Chapters Modal */}
      <MyChaptersModal
        isOpen={isMyChaptersOpen}
        onClose={() => setIsMyChaptersOpen(false)}
        rsvps={userRSVPs}
        allClubs={clubs}
        onCancelRSVP={handleCancelRSVP}
        onSaveNote={handleSaveNote}
        onExploreClubs={scrollToExplore}
      />

      {/* 3. My Page Modal (개인정보 열람/관리 및 참여/신청 모임 확인) */}
      <MyPageModal
        isOpen={isMyPageOpen}
        onClose={() => setIsMyPageOpen(false)}
        currentUser={currentUser}
        rsvps={rsvps}
        allClubs={clubs}
        onUpdateUser={handleUpdateUser}
        onCancelRSVP={handleCancelRSVP}
        onSaveNote={handleSaveNote}
        onSelectClubDetail={(club) => setSelectedClubForModal(club)}
        onExploreClubs={scrollToExplore}
      />

      {/* 4. Become Host Modal */}
      <BecomeHostModal
        isOpen={isBecomeHostOpen}
        onClose={() => setIsBecomeHostOpen(false)}
        onExploreClubs={scrollToExplore}
        currentUser={currentUser}
      />

      {/* 5. Create Club Modal */}
      <CreateClubModal
        isOpen={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        onCreateClub={handleCreateClub}
        currentUser={currentUser}
      />

      {/* 6. Edit Club Modal */}
      <EditClubModal
        isOpen={!!editingClub}
        club={editingClub}
        onClose={() => setEditingClub(null)}
        onSaveClub={handleSaveEditedClub}
      />

      {/* 7. Cancel Club Modal */}
      <CancelClubModal
        isOpen={!!cancelingClub}
        club={cancelingClub}
        applicants={cancelingClub ? rsvps.filter((r) => r.clubId === cancelingClub.id && r.status === 'confirmed') : []}
        onClose={() => setCancelingClub(null)}
        onConfirmCancel={handleConfirmCancelClub}
      />

      {/* 8. Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        users={users}
        onRegisterUser={handleRegisterUser}
        onResetPassword={handleResetPassword}
        initialTab={authModalTab}
      />

      {/* 9. Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        userName={currentUser?.name}
      />

      {/* 10. Auto Cancellation Dispatched Notice Modal */}
      <AutoCancellationNoticeModal
        isOpen={isAutoCancelModalOpen}
        onClose={() => setIsAutoCancelModalOpen(false)}
        logs={autoCancelLogs}
      />
    </div>
  );
}
