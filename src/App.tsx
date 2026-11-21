import { useState, useEffect } from 'react';
import { BookClub, RSVPRecord, User } from './types';
import { INITIAL_BOOK_CLUBS } from './data/initialClubs';
import { INITIAL_RSVPS } from './data/initialUsers';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ClubExplorer } from './components/ClubExplorer';
import { WhyReadoraSection } from './components/WhyReadoraSection';
import { AboutSection } from './components/AboutSection';
import { ClubMomentsSection } from './components/ClubMomentsSection';
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
import { trackRealPageView } from './utils/analytics';
import { supabase } from './lib/supabase';
import {
  fetchAdminMembersOnServer,
  fetchOwnSupabaseProfile,
  logoutSupabaseSession,
  restoreSupabaseSessionUser,
  verifyAdminAccessOnServer,
} from './lib/supabaseAuth';

const STORAGE_KEY_CLUBS = 'readora_prod_clubs_v1';
const STORAGE_KEY_RSVPS = 'readora_prod_rsvps_v1';

// One-time purge of legacy test storage keys
if (typeof window !== 'undefined') {
  const LEGACY_STORAGE_KEYS = [
    'chapter_calgary_clubs_v3',
    'chapter_calgary_rsvps_v3',
    'chapter_calgary_users_v3',
    'chapter_calgary_session_user_v3',
    'chapter_calgary_clubs_v2',
    'chapter_calgary_rsvps_v2',
    'chapter_calgary_users_v2',
    'chapter_calgary_session_user_v2',
    'chapter_calgary_clubs_v1',
    'chapter_calgary_rsvps_v1',
    'chapter_calgary_users_v1',
    'chapter_calgary_session_user_v1'
  ];
  LEGACY_STORAGE_KEYS.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore
    }
  });
}

export default function App() {
  // Current authenticated Supabase session user (never restored from localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);

  // Admin view toggle & server-verified authorization state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminVerifiedOnServer, setIsAdminVerifiedOnServer] = useState<boolean>(false);
  const [adminMembers, setAdminMembers] = useState<User[]>([]);

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
        return JSON.parse(saved);
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

  // Sync clubs and RSVPs to localStorage (never mutate/delete legacy user/session keys)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLUBS, JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RSVPS, JSON.stringify(rsvps));
  }, [rsvps]);

  // Run 24-hour auto-cancellation check for clubs failing 4-person minimum
  const handleRunAutoCancellationCheck = (isManualTrigger = false) => {
    const knownUsers = currentUser?.role === 'admin' && isAdminVerifiedOnServer ? adminMembers : [];
    const { updatedClubs, updatedRsvps, newLogs } = checkAndExecuteAutoCancellations(clubs, rsvps, knownUsers);
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
        const { updatedClubs: simClubs, updatedRsvps: simRsvps, log } = simulateAutoCancelClub(eligibleClub, clubs, rsvps, knownUsers);
        setClubs(simClubs);
        setRsvps(simRsvps);
        setAutoCancelLogs((prev) => [log, ...prev]);
        showToast(`⚡ [24시간 미달 자동 취소 시뮬레이션 완료] 《${eligibleClub.bookTitle}》 모임이 자동 취소되었습니다. 호스트(${eligibleClub.hostName}) 및 신청자(${log.applicantCount}명) 전원에게 취소 메일이 발송되었습니다.`);
      } else {
        showToast('현재 등록된 모든 모임이 최소 인원(4명) 이상 충족되었거나 정상 진행 중입니다.');
      }
    }
  };

  // Restore Supabase session on mount & listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const restored = await restoreSupabaseSessionUser();
        if (!isMounted) return;

        if (restored.suspended) {
          setCurrentUser(null);
          setIsAdminMode(false);
          setIsAdminVerifiedOnServer(false);
          setAdminMembers([]);
          setIsHostMode(false);
          showToast('관리자에 의해 이용이 정지된 계정입니다. 운영팀에 문의해 주세요.');
        } else if (restored.user) {
          setCurrentUser(restored.user);
        } else {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthInitializing(false);
        }
      }
    };

    initAuth();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setCurrentUser(null);
        setIsAdminMode(false);
        setIsAdminVerifiedOnServer(false);
        setAdminMembers([]);
        setIsHostMode(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const userId = session.user.id;
        const emailFallback = session.user.email ?? undefined;
        // Defer Supabase query out of onAuthStateChange callback tick
        setTimeout(async () => {
          const profileRes = await fetchOwnSupabaseProfile(userId, emailFallback);
          if (!isMounted) return;

          if (profileRes.suspended) {
            await logoutSupabaseSession();
            setCurrentUser(null);
            setIsAdminMode(false);
            setIsAdminVerifiedOnServer(false);
            setAdminMembers([]);
            setIsHostMode(false);
            showToast('관리자에 의해 이용이 정지된 계정입니다. 운영팀에 문의해 주세요.');
            return;
          }

          if (profileRes.user) {
            setCurrentUser(profileRes.user);
            if (profileRes.user.role !== 'admin') {
              setIsAdminMode(false);
              setIsAdminVerifiedOnServer(false);
              setAdminMembers([]);
            }
          }
        }, 0);
      }
    });

    const handleStorageChange = (event: StorageEvent) => {
      if (!isMounted || event.storageArea !== window.localStorage) return;

      // Ignore localStorage auth clears if this tab runs an isolated sessionStorage-only session
      try {
        if (window.sessionStorage.getItem('readora_auth_persist_mode') === 'session') {
          return;
        }
      } catch {
        // Ignore storage errors
      }

      const key = event.key;
      const isAuthCleared =
        key === null ||
        (key === 'readora_auth_persist_mode' && event.newValue === null) ||
        (key.startsWith('sb-') && key.includes('-auth-token') && event.newValue === null);

      if (isAuthCleared) {
        setCurrentUser(null);
        setIsAdminMode(false);
        setIsAdminVerifiedOnServer(false);
        setAdminMembers([]);
        setIsHostMode(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Initial check and analytics track on mount
  useEffect(() => {
    trackRealPageView();
    handleRunAutoCancellationCheck(false);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Server-verified admin entry helper
  const handleEnterAdminDashboard = async (userOverride?: User): Promise<boolean> => {
    const activeUser = userOverride ?? currentUser;
    if (!activeUser || activeUser.role !== 'admin') {
      setIsAdminMode(false);
      setIsAdminVerifiedOnServer(false);
      showToast('관리자 권한이 없는 계정입니다.');
      return false;
    }

    const verifyRes = await verifyAdminAccessOnServer();
    if (!verifyRes.authorized) {
      setIsAdminMode(false);
      setIsAdminVerifiedOnServer(false);
      setAdminMembers([]);
      showToast(verifyRes.message || '서버에서 관리자 권한을 확인할 수 없습니다.');
      return false;
    }

    setIsAdminVerifiedOnServer(true);
    setIsAdminMode(true);
    setIsHostMode(false);

    const membersRes = await fetchAdminMembersOnServer();
    if (membersRes.success) {
      setAdminMembers(membersRes.members);
    } else if (membersRes.message) {
      showToast(membersRes.message);
    }

    return true;
  };

  // Auth Handlers
  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      const ok = await handleEnterAdminDashboard(user);
      if (ok) {
        showToast(`👑 총괄 관리자(${user.name})님 환영합니다! 관리자 대시보드로 이동합니다.`);
      }
    } else if (user.role === 'host') {
      setIsHostMode(true);
      setIsAdminMode(false);
      setIsAdminVerifiedOnServer(false);
      setAdminMembers([]);
      showToast(`👑 ${user.name}님 환영합니다! 호스트 모임 관리 센터로 이동합니다.`);
    } else {
      setIsAdminMode(false);
      setIsAdminVerifiedOnServer(false);
      setAdminMembers([]);
      setIsHostMode(false);
      showToast(`🎉 ${user.name}님 환영합니다! 리도라(Readora) 독서모임에 참여해보세요.`);
    }
  };

  const handleRequestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const handleLogout = async () => {
    await logoutSupabaseSession();
    setCurrentUser(null);
    setIsAdminMode(false);
    setIsAdminVerifiedOnServer(false);
    setAdminMembers([]);
    setIsHostMode(false);
    showToast('안전하게 로그아웃 되었습니다.');
  };

  const handleRegisterUser = (newUser: User) => {
    setCurrentUser(newUser);
  };

  const handleResetPassword = (_username: string, _newPw: string) => {
    showToast('🔒 비밀번호 변경은 로그인 후 마이페이지 > 비밀번호 및 보안 관리에서 안전하게 진행해 주세요.');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setAdminMembers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
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

  // VIEW 1: Admin Dashboard (requires server-verified admin role)
  if (currentUser?.role === 'admin' && isAdminMode && isAdminVerifiedOnServer) {
    return (
      <>
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#191919] text-[#FBF9E9] px-5 py-3.5 rounded-xl shadow-lg border border-[#FFE57E]/40 flex items-center gap-3">
            <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
          </div>
        )}

        <AdminDashboard
          currentUser={currentUser}
          onLogout={handleRequestLogout}
          onSwitchToUserView={() => setIsAdminMode(false)}
          users={adminMembers}
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
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#191919] text-[#FBF9E9] px-5 py-3.5 rounded-xl shadow-lg border border-[#FFE57E]/40 flex items-center gap-3">
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
    <div className="min-h-screen bg-[#FBF9E9] text-[#191919] flex flex-col font-sans selection:bg-[#FFE57E] selection:text-[#191919]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#191919] text-[#FBF9E9] px-5 py-3.5 rounded-xl shadow-lg border border-[#FFE57E]/40 flex items-center gap-3">
          <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
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
        onOpenAdmin={() => {
          void handleEnterAdminDashboard();
        }}
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
        onScrollToGuide={() => {
          document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        joinedCount={userRSVPs.filter((r) => r.status === 'confirmed').length}
      />

      {/* Section 1: Hero */}
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

      {/* Section 2: Brand Story (Directly Below Hero) */}
      <AboutSection />

      {/* Section 3: Next Club Explorer */}
      <ClubExplorer
        clubs={clubs}
        onSelectClub={(club) => {
          if (!currentUser) {
            setAuthModalTab('login');
            setIsAuthModalOpen(true);
            showToast('🔒 독서모임 상세 정보 확인 및 모임 신청은 로그인 후 이용하실 수 있습니다.');
            return;
          }
          trackRealPageView(true);
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

      {/* Section 4: Why Readora */}
      <WhyReadoraSection />

      {/* Section 5: Club Moments (returns null until real records exist) */}
      <ClubMomentsSection />

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
        users={[]}
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
