import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  ArrowLeft,
  KeyRound,
  Phone,
  Copy,
  Check,
  Crown
} from 'lucide-react';
import { User } from '../types';

export type AuthMode = 'login' | 'signup' | 'find_id' | 'reset_password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  users: User[];
  onRegisterUser: (newUser: User) => void;
  onResetPassword?: (username: string, newPassword: string) => void;
  initialTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  onRegisterUser,
  onResetPassword,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<AuthMode>(initialTab);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupId, setSignupId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupGender, setSignupGender] = useState<'여성' | '남성' | '기타'>('여성');

  // Signup Email verification state
  const [signupVerificationCode, setSignupVerificationCode] = useState('');
  const [signupInputCode, setSignupInputCode] = useState('');
  const [isSignupCodeSent, setIsSignupCodeSent] = useState(false);
  const [isSignupEmailVerified, setIsSignupEmailVerified] = useState(false);
  const [signupVerificationError, setSignupVerificationError] = useState('');
  const [signupCountdown, setSignupCountdown] = useState(180); // 3 minutes
  const [signupError, setSignupError] = useState('');

  // Simulated Incoming Email Banner state
  const [emailAlert, setEmailAlert] = useState<{ title: string; code: string; email: string } | null>(null);

  // Find ID state
  const [findIdEmail, setFindIdEmail] = useState('');
  const [findIdCode, setFindIdCode] = useState('');
  const [findIdInputCode, setFindIdInputCode] = useState('');
  const [isFindIdCodeSent, setIsFindIdCodeSent] = useState(false);
  const [isFindIdVerified, setIsFindIdVerified] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [findIdError, setFindIdError] = useState('');
  const [findIdCountdown, setFindIdCountdown] = useState(180);
  const [copiedId, setCopiedId] = useState(false);

  // Reset Password state
  const [resetPwUsername, setResetPwUsername] = useState('');
  const [resetPwEmail, setResetPwEmail] = useState('');
  const [resetPwCode, setResetPwCode] = useState('');
  const [resetPwInputCode, setResetPwInputCode] = useState('');
  const [isResetPwCodeSent, setIsResetPwCodeSent] = useState(false);
  const [isResetPwVerified, setIsResetPwVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetPwSuccess, setResetPwSuccess] = useState(false);
  const [resetPwError, setResetPwError] = useState('');
  const [resetPwCountdown, setResetPwCountdown] = useState(180);

  useEffect(() => {
    setActiveTab(initialTab);
    setLoginError('');
    setSignupError('');
    setFindIdError('');
    setResetPwError('');
  }, [initialTab, isOpen]);

  // Timer countdown for signup email verification
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSignupCodeSent && !isSignupEmailVerified && signupCountdown > 0) {
      timer = setInterval(() => {
        setSignupCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSignupCodeSent, isSignupEmailVerified, signupCountdown]);

  // Timer countdown for Find ID verification
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFindIdCodeSent && !isFindIdVerified && findIdCountdown > 0) {
      timer = setInterval(() => {
        setFindIdCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isFindIdCodeSent, isFindIdVerified, findIdCountdown]);

  // Timer countdown for Reset Password verification
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResetPwCodeSent && !isResetPwVerified && resetPwCountdown > 0) {
      timer = setInterval(() => {
        setResetPwCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResetPwCodeSent, isResetPwVerified, resetPwCountdown]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Quick fill demo buttons
  const handleFillAdmin = () => {
    setActiveTab('login');
    setLoginId('chapter85330');
    setLoginPassword('cksdn0315!');
    setLoginError('');
  };

  const handleFillHost = () => {
    setActiveTab('login');
    setLoginId('calgary_host');
    setLoginPassword('host1234!');
    setLoginError('');
  };

  const handleFillDemoUser = () => {
    setActiveTab('login');
    setLoginId('calgary_reader');
    setLoginPassword('reader1234!');
    setLoginError('');
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError('아이디와 패스워드를 모두 입력해 주세요.');
      return;
    }

    const targetUser = users.find(
      (u) => u.username.toLowerCase() === loginId.trim().toLowerCase()
    );

    if (!targetUser) {
      setLoginError('존재하지 않는 회원 아이디입니다. 아이디를 확인해 주세요.');
      return;
    }

    if (targetUser.password !== loginPassword) {
      setLoginError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (targetUser.status === 'suspended') {
      setLoginError('관리자에 의해 이용이 정지된 계정입니다. 운영팀에 문의해 주세요.');
      return;
    }

    onLoginSuccess(targetUser);
    onClose();
  };

  // ===================== SIGNUP FLOW =====================
  const handleSendSignupCode = () => {
    setSignupVerificationError('');
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupVerificationError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    const existing = users.find((u) => u.email.toLowerCase() === signupEmail.trim().toLowerCase());
    if (existing) {
      setSignupVerificationError('이미 가입된 이메일 주소입니다.');
      return;
    }

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSignupVerificationCode(generated);
    setIsSignupCodeSent(true);
    setSignupCountdown(180);
    setIsSignupEmailVerified(false);

    setEmailAlert({
      title: '리도라 가입 본인인증 메일',
      code: generated,
      email: signupEmail.trim()
    });
  };

  const handleVerifySignupCode = () => {
    setSignupVerificationError('');
    if (!signupInputCode.trim()) {
      setSignupVerificationError('인증번호 6자리를 입력해 주세요.');
      return;
    }

    if (signupCountdown <= 0) {
      setSignupVerificationError('인증 시간이 만료되었습니다. 인증번호를 다시 발송해 주세요.');
      return;
    }

    if (signupInputCode.trim() === signupVerificationCode) {
      setIsSignupEmailVerified(true);
      setSignupVerificationError('');
    } else {
      setSignupVerificationError('인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupId.trim() || !signupPassword.trim() || !signupName.trim() || !signupEmail.trim() || !signupPhone.trim()) {
      setSignupError('모든 필수 항목(아이디, 비밀번호, 이름, 연락처, 이메일)을 입력해 주세요.');
      return;
    }

    if (signupId.trim().length < 4) {
      setSignupError('아이디는 최소 4자 이상이어야 합니다.');
      return;
    }

    const existingUsername = users.find(
      (u) => u.username.toLowerCase() === signupId.trim().toLowerCase()
    );
    if (existingUsername) {
      setSignupError('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      setSignupError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (!signupPhone.trim() || signupPhone.trim().length < 8) {
      setSignupError('올바른 연락처(휴대폰 번호)를 입력해 주세요. (예: 403-123-4567)');
      return;
    }

    if (!isSignupEmailVerified) {
      setSignupError('이메일 본인인증을 완료해야 가입할 수 있습니다.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: signupId.trim(),
      password: signupPassword,
      name: signupName.trim(),
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      gender: signupGender,
      role: 'user',
      createdAt: new Date().toLocaleDateString('ko-KR'),
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    };

    onRegisterUser(newUser);
    onLoginSuccess(newUser);
    onClose();
  };

  // ===================== FIND ID FLOW =====================
  const handleSendFindIdCode = () => {
    setFindIdError('');
    if (!findIdEmail.trim() || !findIdEmail.includes('@')) {
      setFindIdError('가입 시 등록한 이메일 주소를 정확히 입력해 주세요.');
      return;
    }

    const matched = users.find((u) => u.email.toLowerCase() === findIdEmail.trim().toLowerCase());
    if (!matched) {
      setFindIdError('해당 이메일로 등록된 회원 정보가 존재하지 않습니다.');
      return;
    }

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setFindIdCode(generated);
    setIsFindIdCodeSent(true);
    setFindIdCountdown(180);
    setIsFindIdVerified(false);
    setFoundUser(matched);

    setEmailAlert({
      title: '리도라 아이디 찾기 본인확인 인증번호',
      code: generated,
      email: findIdEmail.trim()
    });
  };

  const handleVerifyFindIdCode = () => {
    setFindIdError('');
    if (!findIdInputCode.trim()) {
      setFindIdError('인증번호 6자리를 입력해 주세요.');
      return;
    }

    if (findIdCountdown <= 0) {
      setFindIdError('인증번호 유효 시간이 만료되었습니다. 다시 발송해 주세요.');
      return;
    }

    if (findIdInputCode.trim() === findIdCode) {
      setIsFindIdVerified(true);
      setFindIdError('');
    } else {
      setFindIdError('인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  const handleCopyId = () => {
    if (foundUser?.username) {
      navigator.clipboard.writeText(foundUser.username);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // ===================== RESET PASSWORD FLOW =====================
  const handleSendResetPwCode = () => {
    setResetPwError('');
    if (!resetPwUsername.trim()) {
      setResetPwError('아이디를 입력해 주세요.');
      return;
    }

    if (!resetPwEmail.trim() || !resetPwEmail.includes('@')) {
      setResetPwError('가입 시 등록한 이메일 주소를 입력해 주세요.');
      return;
    }

    const matched = users.find(
      (u) =>
        u.username.toLowerCase() === resetPwUsername.trim().toLowerCase() &&
        u.email.toLowerCase() === resetPwEmail.trim().toLowerCase()
    );

    if (!matched) {
      setResetPwError('입력하신 아이디와 이메일 정보가 일치하는 회원을 찾을 수 없습니다.');
      return;
    }

    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setResetPwCode(generated);
    setIsResetPwCodeSent(true);
    setResetPwCountdown(180);
    setIsResetPwVerified(false);
    setResetPwSuccess(false);

    setEmailAlert({
      title: '리도라 비밀번호 재설정 본인인증 번호',
      code: generated,
      email: resetPwEmail.trim()
    });
  };

  const handleVerifyResetPwCode = () => {
    setResetPwError('');
    if (!resetPwInputCode.trim()) {
      setResetPwError('인증번호 6자리를 입력해 주세요.');
      return;
    }

    if (resetPwCountdown <= 0) {
      setResetPwError('인증번호 유효 시간이 만료되었습니다. 다시 발송해 주세요.');
      return;
    }

    if (resetPwInputCode.trim() === resetPwCode) {
      setIsResetPwVerified(true);
      setResetPwError('');
    } else {
      setResetPwError('인증번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetPwError('');

    if (!newPassword.trim()) {
      setResetPwError('새 비밀번호를 입력해 주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setResetPwError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setResetPwError('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (onResetPassword) {
      onResetPassword(resetPwUsername.trim(), newPassword);
    }
    setResetPwSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#FCFAF6] w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E7E0D3] overflow-hidden relative max-h-[94dvh] sm:max-h-[92vh] my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#172E22] text-white px-4 sm:px-6 pt-5 pb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="font-[Arial,sans-serif] text-xl sm:text-2xl font-bold tracking-tight text-white">리도라</span>
          </div>
          
          <p className="text-stone-300 text-[11px] sm:text-xs">
            {activeTab === 'login' && '우리가 책으로 만나는 시간, 리도라에 로그인하세요.'}
            {activeTab === 'signup' && '간편한 이메일 인증으로 리도라(Readora) 회원이 되어보세요.'}
            {activeTab === 'find_id' && '가입 시 등록된 이메일 인증을 통해 아이디를 확인합니다.'}
            {activeTab === 'reset_password' && '이메일 인증을 통해 안전하게 새 비밀번호를 설정합니다.'}
          </p>

          {/* Navigation Controls */}
          {activeTab === 'login' || activeTab === 'signup' ? (
            <div className="flex mt-3 sm:mt-4 bg-black/25 p-1 rounded-xl">
              <button
                onClick={() => { setActiveTab('login'); setLoginError(''); }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-[#172E22] shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                로그인 (Login)
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setSignupError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white text-[#172E22] shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                회원가입 (이메일 인증)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-4 bg-black/25 p-1 rounded-xl">
              <button
                onClick={() => {
                  setActiveTab('find_id');
                  setFindIdError('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'find_id'
                    ? 'bg-white text-[#172E22] shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                아이디 찾기
              </button>
              <button
                onClick={() => {
                  setActiveTab('reset_password');
                  setResetPwError('');
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'reset_password'
                    ? 'bg-white text-[#172E22] shadow-sm'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                비밀번호 재설정
              </button>
            </div>
          )}
        </div>

        {/* Simulated Incoming Email Notification Banner */}
        {emailAlert && (
          <div className="bg-[#FFF8E7] border-b border-[#F0DCB3] px-5 py-3 text-xs text-[#7B4D16] flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-[#DF612D] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-[#5A360D] flex items-center justify-between">
                <span>[모의 수신함] {emailAlert.title}</span>
                <button
                  type="button"
                  onClick={() => setEmailAlert(null)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="mt-0.5 text-[11px] text-stone-600">
                수신: <span className="font-mono">{emailAlert.email}</span>
              </p>
              <div className="mt-1.5 inline-flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-[#DF612D]/30 shadow-xs">
                <span className="text-[11px] text-stone-600">인증코드:</span>
                <span className="font-mono font-bold text-sm tracking-widest text-[#DF612D]">
                  {emailAlert.code}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'signup') setSignupInputCode(emailAlert.code);
                    if (activeTab === 'find_id') setFindIdInputCode(emailAlert.code);
                    if (activeTab === 'reset_password') setResetPwInputCode(emailAlert.code);
                  }}
                  className="text-[10px] text-[#DF612D] underline font-medium hover:text-[#b8481a] ml-1"
                >
                  코드 자동 입력
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* ==================== 1. LOGIN VIEW ==================== */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  아이디 (ID)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  비밀번호 (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs sm:text-sm bg-white"
                  />
                </div>
              </div>

              {/* Find ID / Reset PW Links */}
              <div className="flex items-center justify-between text-xs text-stone-500 pt-0.5 px-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('find_id');
                      setFindIdEmail('');
                      setIsFindIdCodeSent(false);
                      setIsFindIdVerified(false);
                      setFoundUser(null);
                      setFindIdError('');
                    }}
                    className="hover:text-[#DF612D] font-medium transition-colors cursor-pointer text-[11px] sm:text-xs"
                  >
                    아이디 찾기
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('reset_password');
                      setResetPwUsername(loginId);
                      setResetPwEmail('');
                      setIsResetPwCodeSent(false);
                      setIsResetPwVerified(false);
                      setResetPwSuccess(false);
                      setResetPwError('');
                    }}
                    className="hover:text-[#DF612D] font-medium transition-colors cursor-pointer text-[11px] sm:text-xs"
                  >
                    비밀번호 재설정
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setSignupError('');
                  }}
                  className="text-[#DF612D] font-semibold hover:underline cursor-pointer text-xs"
                >
                  회원가입
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#DF612D] hover:bg-[#c95221] active:scale-[0.98] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
              >
                로그인하기
              </button>

              {/* Quick Fill Demo Helper */}
              <div className="pt-3.5 border-t border-stone-200">
                <p className="text-[11px] font-semibold text-stone-500 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#DF612D]" />
                  빠른 테스트용 계정 즉시 입력
                </p>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleFillAdmin}
                    className="p-1.5 sm:p-2.5 rounded-xl bg-[#172E22]/5 hover:bg-[#172E22]/10 border border-[#172E22]/15 text-left text-xs transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-[#172E22] flex items-center gap-1 text-[10px] sm:text-xs">
                      <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2D6A4F] shrink-0" />
                      <span>관리자</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-stone-500 font-mono mt-0.5 truncate">
                      chapter85330
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillHost}
                    className="p-1.5 sm:p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left text-xs transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-amber-800 flex items-center gap-1 text-[10px] sm:text-xs">
                      <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                      <span>호스트</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-stone-500 font-mono mt-0.5 truncate">
                      calgary_host
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillDemoUser}
                    className="p-1.5 sm:p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-left text-xs transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-[#DF612D] flex items-center gap-1 text-[10px] sm:text-xs">
                      <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span>일반회원</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-stone-500 font-mono mt-0.5 truncate">
                      calgary_reader
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ==================== 2. SIGNUP VIEW ==================== */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* ID */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  아이디 (ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signupId}
                  onChange={(e) => setSignupId(e.target.value)}
                  placeholder="영문, 숫자 4자 이상"
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="6자 이상"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupPasswordConfirm}
                    onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                    placeholder="동일하게 입력"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                  />
                </div>
              </div>

              {/* Name & Phone (Phone is MANDATORY) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    연락처 <span className="text-red-500">* 필수</span>
                  </label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="403-123-4567"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  성별 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['여성', '남성', '기타'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSignupGender(g)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        signupGender === g
                          ? 'bg-[#172E22] text-white border-[#172E22] shadow-xs'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email with Verification */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  이메일 (본인인증 필수) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setIsSignupEmailVerified(false);
                      setIsSignupCodeSent(false);
                    }}
                    placeholder="calgary@example.com"
                    disabled={isSignupEmailVerified}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white disabled:bg-stone-100 disabled:text-stone-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendSignupCode}
                    disabled={isSignupEmailVerified}
                    className="px-3 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-medium shrink-0 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {isSignupCodeSent ? '재발송' : '인증번호 발송'}
                  </button>
                </div>
              </div>

              {/* Code Verification Box */}
              {isSignupCodeSent && !isSignupEmailVerified && (
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-semibold text-stone-700">이메일 인증번호 6자리</span>
                    <span className="text-red-500 font-mono flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      {formatTime(signupCountdown)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={signupInputCode}
                      onChange={(e) => setSignupInputCode(e.target.value)}
                      placeholder="6자리 숫자"
                      className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-center font-mono font-bold tracking-widest text-sm bg-white focus:outline-none focus:border-[#DF612D]"
                    />
                    <button
                      type="button"
                      onClick={handleVerifySignupCode}
                      className="px-4 py-2 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      확인
                    </button>
                  </div>
                  {signupVerificationError && (
                    <p className="text-[11px] text-red-600 font-medium">{signupVerificationError}</p>
                  )}
                </div>
              )}

              {isSignupEmailVerified && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>이메일 본인인증이 완료되었습니다.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!isSignupEmailVerified}
                className="w-full py-3 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isSignupEmailVerified ? '회원가입 완료 및 시작하기' : '이메일 인증을 완료해주세요'}
              </button>
            </form>
          )}

          {/* ==================== 3. FIND ID VIEW ==================== */}
          {activeTab === 'find_id' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>로그인 화면으로</span>
                </button>
                <span className="text-xs font-bold text-[#172E22]">아이디 찾기</span>
              </div>

              {findIdError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{findIdError}</span>
                </div>
              )}

              {!isFindIdVerified ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      가입 시 등록한 이메일 주소
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="email"
                          value={findIdEmail}
                          onChange={(e) => {
                            setFindIdEmail(e.target.value);
                            setIsFindIdCodeSent(false);
                          }}
                          placeholder="가입한 이메일을 입력하세요"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendFindIdCode}
                        className="px-3 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-medium shrink-0 transition-colors cursor-pointer"
                      >
                        {isFindIdCodeSent ? '인증번호 재발송' : '인증번호 발송'}
                      </button>
                    </div>
                  </div>

                  {/* Verification Input Box */}
                  {isFindIdCodeSent && (
                    <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-600">
                        <span className="font-semibold text-stone-700">이메일 인증번호 6자리</span>
                        <span className="text-red-500 font-mono flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {formatTime(findIdCountdown)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={findIdInputCode}
                          onChange={(e) => setFindIdInputCode(e.target.value)}
                          placeholder="6자리 숫자"
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-center font-mono font-bold tracking-widest text-sm bg-white focus:outline-none focus:border-[#DF612D]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyFindIdCode}
                          className="px-4 py-2 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          인증 확인
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                    💡 가입 시 인증하셨던 이메일 주소로 본인확인용 6자리 인증번호가 발송됩니다. 인증이 완료되면 회원님의 아이디를 확인하실 수 있습니다.
                  </p>
                </div>
              ) : (
                /* Found User Result */
                <div className="space-y-4 pt-1">
                  <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-sm text-emerald-950">본인인증이 완료되었습니다</h4>
                    <p className="text-xs text-emerald-800">
                      회원님의 계정 정보는 다음과 같습니다.
                    </p>

                    <div className="my-3 p-3.5 bg-white rounded-xl border border-emerald-200 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500">회원 아이디:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-base text-[#172E22]">
                            {foundUser?.username}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyId}
                            className="p-1 rounded-md hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                            title="아이디 복사"
                          >
                            {copiedId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                        <span className="text-stone-500">이름:</span>
                        <span className="font-medium text-stone-800">{foundUser?.name}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500">가입 일자:</span>
                        <span className="font-medium text-stone-800">{foundUser?.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (foundUser) setLoginId(foundUser.username);
                        setActiveTab('login');
                      }}
                      className="w-full py-3 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      이 아이디로 로그인하기
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (foundUser) {
                          setResetPwUsername(foundUser.username);
                          setResetPwEmail(foundUser.email);
                        }
                        setActiveTab('reset_password');
                        setIsResetPwCodeSent(false);
                        setIsResetPwVerified(false);
                        setResetPwSuccess(false);
                      }}
                      className="w-full py-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
                    >
                      비밀번호도 재설정하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 4. RESET PASSWORD VIEW ==================== */}
          {activeTab === 'reset_password' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>로그인 화면으로</span>
                </button>
                <span className="text-xs font-bold text-[#172E22]">비밀번호 재설정</span>
              </div>

              {resetPwError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resetPwError}</span>
                </div>
              )}

              {/* Step 1 & 2: Verify ID & Email */}
              {!isResetPwVerified ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      아이디 (ID)
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={resetPwUsername}
                        onChange={(e) => setResetPwUsername(e.target.value)}
                        placeholder="가입한 아이디 입력"
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      가입 이메일 주소
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="email"
                          value={resetPwEmail}
                          onChange={(e) => {
                            setResetPwEmail(e.target.value);
                            setIsResetPwCodeSent(false);
                          }}
                          placeholder="calgary@example.com"
                          className="w-full pl-10 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendResetPwCode}
                        className="px-3 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-medium shrink-0 transition-colors cursor-pointer"
                      >
                        {isResetPwCodeSent ? '인증번호 재발송' : '인증번호 발송'}
                      </button>
                    </div>
                  </div>

                  {/* Verification Input Box */}
                  {isResetPwCodeSent && (
                    <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between text-xs text-stone-600">
                        <span className="font-semibold text-stone-700">이메일 인증번호 6자리</span>
                        <span className="text-red-500 font-mono flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {formatTime(resetPwCountdown)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={resetPwInputCode}
                          onChange={(e) => setResetPwInputCode(e.target.value)}
                          placeholder="6자리 숫자"
                          className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-center font-mono font-bold tracking-widest text-sm bg-white focus:outline-none focus:border-[#DF612D]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyResetPwCode}
                          className="px-4 py-2 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          인증 확인
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200">
                    💡 회원 본인 확인을 위해 아이디와 가입된 이메일을 모두 입력 후 인증번호를 발급받으세요.
                  </p>
                </div>
              ) : !resetPwSuccess ? (
                /* Step 3: Enter New Password */
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>본인인증 완료 (@{resetPwUsername}). 새 비밀번호를 설정하세요.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      새 비밀번호 (New Password) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="최소 6자 이상"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      새 비밀번호 확인 (Confirm) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="password"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="새 비밀번호를 한 번 더 입력하세요"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    새 비밀번호로 재설정 완료
                  </button>
                </form>
              ) : (
                /* Step 4: Success Message */
                <div className="space-y-4 pt-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#19221C]">
                      비밀번호가 안전하게 변경되었습니다!
                    </h4>
                    <p className="text-xs text-stone-600 mt-1">
                      새로 설정하신 비밀번호로 즉시 로그인하여 서비스를 이용하실 수 있습니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginId(resetPwUsername);
                      setLoginPassword(newPassword);
                      setActiveTab('login');
                    }}
                    className="w-full py-3 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    로그인하러 가기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
