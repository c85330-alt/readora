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
import {
  SIGNUP_OTP_EXPIRY_SECONDS,
  SIGNUP_RESEND_COOLDOWN_SECONDS,
  SupabaseProfile,
  checkUsernameAvailability,
  resendSignupOtp,
  signUpWithEmailOtp,
  verifySignupOtpAndFetchProfile,
} from '../lib/supabaseSignup';
import { loginWithUsername } from '../lib/supabaseAuth';

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
  onRegisterUser: _onRegisterUser,
  onResetPassword,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<AuthMode>(initialTab);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Signup form state
  const [signupId, setSignupId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupGender, setSignupGender] = useState<'여성' | '남성' | '기타'>('여성');
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate' | 'error'>('idle');
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [checkedUsername, setCheckedUsername] = useState('');

  // Signup Email OTP verification state (Supabase Auth)
  const [signupInputCode, setSignupInputCode] = useState('');
  const [isSignupCodeSent, setIsSignupCodeSent] = useState(false);
  const [isSignupEmailVerified, setIsSignupEmailVerified] = useState(false);
  const [isVerifyingSignupOtp, setIsVerifyingSignupOtp] = useState(false);
  const [signupVerificationError, setSignupVerificationError] = useState('');
  const [signupOtpExpiresAt, setSignupOtpExpiresAt] = useState<number | null>(null);
  const [signupResendAvailableAt, setSignupResendAvailableAt] = useState<number | null>(null);
  const [signupCountdown, setSignupCountdown] = useState(SIGNUP_OTP_EXPIRY_SECONDS); // 10 minutes (600s)
  const [signupResendCooldown, setSignupResendCooldown] = useState(0);
  const [signupError, setSignupError] = useState('');
  const [signupNotice, setSignupNotice] = useState<{ email: string; message: string } | null>(null);
  const [completedSignupProfile, setCompletedSignupProfile] = useState<SupabaseProfile | null>(null);

  // Real Email Verification state (for Find ID / Reset Password)
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailAlert, setEmailAlert] = useState<{
    title: string;
    code: string;
    email: string;
    sentRealEmail: boolean;
    senderEmail: string;
    message?: string;
  } | null>(null);

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
    setIsLoggingIn(false);
    setSignupError('');
    setSignupVerificationError('');
    setFindIdError('');
    setResetPwError('');
  }, [initialTab, isOpen]);

  // Timer countdown for signup email OTP verification (calculated from real sent timestamp)
  useEffect(() => {
    if (!isSignupCodeSent || isSignupEmailVerified || !signupOtpExpiresAt) return;

    const updateTimers = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((signupOtpExpiresAt - now) / 1000));
      setSignupCountdown(remaining);

      if (signupResendAvailableAt) {
        const resendRemaining = Math.max(0, Math.ceil((signupResendAvailableAt - now) / 1000));
        setSignupResendCooldown(resendRemaining);
      } else {
        setSignupResendCooldown(0);
      }
    };

    updateTimers();
    const timer = setInterval(updateTimers, 500);
    return () => clearInterval(timer);
  }, [isSignupCodeSent, isSignupEmailVerified, signupOtpExpiresAt, signupResendAvailableAt]);

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

  const resetSignupFlowState = () => {
    setSignupId('');
    setSignupPassword('');
    setSignupPasswordConfirm('');
    setSignupName('');
    setSignupEmail('');
    setSignupPhone('');
    setSignupGender('여성');
    setIdCheckStatus('idle');
    setIdCheckMessage('');
    setCheckedUsername('');
    setSignupInputCode('');
    setIsSignupCodeSent(false);
    setIsSignupEmailVerified(false);
    setIsVerifyingSignupOtp(false);
    setSignupVerificationError('');
    setSignupOtpExpiresAt(null);
    setSignupResendAvailableAt(null);
    setSignupCountdown(SIGNUP_OTP_EXPIRY_SECONDS);
    setSignupResendCooldown(0);
    setSignupError('');
    setSignupNotice(null);
    setCompletedSignupProfile(null);
  };

  // Check ID duplication via Supabase RPC (never treat RPC error as available)
  const handleCheckIdDuplicate = async () => {
    setSignupError('');
    const trimmed = signupId.trim();
    if (!trimmed) {
      setIdCheckStatus('duplicate');
      setIdCheckMessage('아이디를 입력해 주세요.');
      setCheckedUsername('');
      return;
    }
    if (trimmed.length < 4) {
      setIdCheckStatus('duplicate');
      setIdCheckMessage('아이디는 최소 4자 이상이어야 합니다.');
      setCheckedUsername('');
      return;
    }

    setIdCheckStatus('checking');
    setIdCheckMessage('아이디 중복 여부를 확인하고 있습니다...');
    setCheckedUsername('');

    const rpcResult = await checkUsernameAvailability(trimmed);
    if (!rpcResult.available) {
      setIdCheckStatus(rpcResult.errorMessage?.includes('오류') ? 'error' : 'duplicate');
      setIdCheckMessage(rpcResult.errorMessage || '이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
      setCheckedUsername('');
      return;
    }

    const isTakenLocally = users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase());
    if (isTakenLocally) {
      setIdCheckStatus('duplicate');
      setIdCheckMessage('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
      setCheckedUsername('');
      return;
    }

    setIdCheckStatus('available');
    setIdCheckMessage('사용 가능한 아이디입니다.');
    setCheckedUsername(trimmed);
  };

  // Handle Login Submit (Supabase Auth via server /api/auth/login)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = loginId.trim();
    if (!cleanId || !loginPassword) {
      setLoginError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await loginWithUsername(cleanId, loginPassword);
      if (!result.success || !result.user) {
        setLoginError(result.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
      }

      setLoginPassword('');
      onLoginSuccess(result.user);
      onClose();
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ===================== SIGNUP FLOW (Supabase Auth 6-digit OTP) =====================
  const validateSignupFieldsBeforeOtp = (): string | null => {
    const cleanId = signupId.trim();
    const cleanName = signupName.trim();
    const cleanPhone = signupPhone.trim();
    const cleanEmail = signupEmail.trim();

    if (!cleanId || !signupPassword.trim() || !cleanName || !cleanEmail || !cleanPhone) {
      return '모든 필수 항목(아이디, 비밀번호, 이름, 연락처, 이메일)을 입력해 주세요.';
    }

    if (cleanId.length < 4) {
      return '아이디는 최소 4자 이상이어야 합니다.';
    }

    if (idCheckStatus !== 'available' || checkedUsername.toLowerCase() !== cleanId.toLowerCase()) {
      return '아이디 중복 확인을 완료해 주세요.';
    }

    const pw = signupPassword;
    const hasEnglish = /[a-zA-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);

    if (pw.length < 8 || pw.length > 16 || !hasEnglish || !hasNumber || !hasSpecial) {
      return '비밀번호는 8~16자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.';
    }

    if (signupPassword !== signupPasswordConfirm) {
      return '비밀번호와 비밀번호 확인이 일치하지 않습니다.';
    }

    if (cleanPhone.length < 8) {
      return '올바른 연락처(휴대폰 번호)를 입력해 주세요. (예: 403-123-4567)';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return '올바른 이메일 주소를 입력해 주세요.';
    }

    return null;
  };

  const handleSendSignupCode = async () => {
    setSignupError('');
    setSignupVerificationError('');

    const validationError = validateSignupFieldsBeforeOtp();
    if (validationError) {
      setSignupError(validationError);
      return;
    }

    const cleanEmail = signupEmail.trim();

    // Resend flow when OTP was already requested
    if (isSignupCodeSent) {
      if (signupResendCooldown > 0) {
        setSignupVerificationError(
          `재전송 제한 시간입니다. ${signupResendCooldown}초 후 다시 시도해 주세요.`
        );
        return;
      }

      setIsSendingEmail(true);
      try {
        const result = await resendSignupOtp(cleanEmail);
        if (!result.success) {
          setSignupVerificationError(
            result.errorMessage || '인증번호 재전송에 실패했습니다. 잠시 후 다시 시도해 주세요.'
          );
          return;
        }

        const now = Date.now();
        setSignupOtpExpiresAt(now + SIGNUP_OTP_EXPIRY_SECONDS * 1000);
        setSignupResendAvailableAt(now + SIGNUP_RESEND_COOLDOWN_SECONDS * 1000);
        setSignupCountdown(SIGNUP_OTP_EXPIRY_SECONDS);
        setSignupResendCooldown(SIGNUP_RESEND_COOLDOWN_SECONDS);
        setSignupInputCode('');
        setSignupNotice({
          email: cleanEmail,
          message: '새 6자리 인증번호가 이메일로 재전송되었습니다. 메일함(또는 스팸함)을 확인해 주세요.',
        });
      } finally {
        setIsSendingEmail(false);
      }
      return;
    }

    // Initial signup OTP dispatch via supabase.auth.signUp()
    setIsSendingEmail(true);
    try {
      const result = await signUpWithEmailOtp({
        email: cleanEmail,
        password: signupPassword,
        username: signupId.trim(),
        name: signupName.trim(),
        phone: signupPhone.trim(),
        gender: signupGender,
      });

      if (!result.success) {
        if (result.isUsernameConflict) {
          setIdCheckStatus('duplicate');
          setIdCheckMessage('이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.');
          setCheckedUsername('');
        }
        setSignupError(
          result.errorMessage || '인증번호 발송에 실패했습니다. 입력 정보를 확인 후 다시 시도해 주세요.'
        );
        return;
      }

      const now = Date.now();
      setIsSignupCodeSent(true);
      setIsSignupEmailVerified(false);
      setSignupOtpExpiresAt(now + SIGNUP_OTP_EXPIRY_SECONDS * 1000);
      setSignupResendAvailableAt(now + SIGNUP_RESEND_COOLDOWN_SECONDS * 1000);
      setSignupCountdown(SIGNUP_OTP_EXPIRY_SECONDS);
      setSignupResendCooldown(SIGNUP_RESEND_COOLDOWN_SECONDS);
      setSignupInputCode('');
      setSignupNotice({
        email: cleanEmail,
        message: '입력하신 이메일로 6자리 인증번호가 발송되었습니다. 메일함(또는 스팸함)을 확인해 주세요.',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifySignupCode = async () => {
    setSignupError('');
    setSignupVerificationError('');

    const token = signupInputCode.trim();
    if (!/^\d{6}$/.test(token)) {
      setSignupVerificationError('이메일로 받은 6자리 숫자 인증번호를 입력해 주세요.');
      return;
    }

    if (signupCountdown <= 0) {
      setSignupVerificationError('인증 시간이 만료되었습니다. 재발송 버튼을 눌러 새 인증번호를 받아 주세요.');
      return;
    }

    setIsVerifyingSignupOtp(true);
    try {
      const result = await verifySignupOtpAndFetchProfile(signupEmail.trim(), token);
      if (!result.success || !result.profile) {
        setSignupVerificationError(
          result.errorMessage || '인증번호 확인에 실패했습니다. 다시 확인해 주세요.'
        );
        return;
      }

      setIsSignupEmailVerified(true);
      setCompletedSignupProfile(result.profile);
      setSignupNotice(null);
      setSignupVerificationError('');
    } finally {
      setIsVerifyingSignupOtp(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (completedSignupProfile) {
      return;
    }

    if (!isSignupCodeSent) {
      setSignupError('먼저 이메일 [인증번호 발송] 버튼을 눌러 6자리 인증번호를 받아 주세요.');
      return;
    }

    await handleVerifySignupCode();
  };

  // ===================== FIND ID FLOW =====================
  const handleSendFindIdCode = async () => {
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

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: findIdEmail.trim(), type: 'find_id' })
      });
      const data = await response.json();
      const code = data.code || Math.floor(100000 + Math.random() * 900000).toString();

      setFindIdCode(code);
      setIsFindIdCodeSent(true);
      setFindIdCountdown(180);
      setIsFindIdVerified(false);
      setFoundUser(matched);

      setEmailAlert({
        title: '리도라 아이디 찾기 본인확인 인증번호',
        code,
        email: findIdEmail.trim(),
        sentRealEmail: Boolean(data.sentRealEmail),
        senderEmail: data.senderEmail || 'readoracontact@gmail.com',
        message: data.message
      });
    } catch {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setFindIdCode(fallbackCode);
      setIsFindIdCodeSent(true);
      setFindIdCountdown(180);
      setIsFindIdVerified(false);
      setFoundUser(matched);

      setEmailAlert({
        title: '리도라 아이디 찾기 본인확인 인증번호',
        code: fallbackCode,
        email: findIdEmail.trim(),
        sentRealEmail: false,
        senderEmail: 'readoracontact@gmail.com',
        message: '오프라인/로컬 모드로 인증번호를 제공합니다.'
      });
    } finally {
      setIsSendingEmail(false);
    }
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
  const handleSendResetPwCode = async () => {
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

    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetPwEmail.trim(), type: 'reset_password' })
      });
      const data = await response.json();
      const code = data.code || Math.floor(100000 + Math.random() * 900000).toString();

      setResetPwCode(code);
      setIsResetPwCodeSent(true);
      setResetPwCountdown(180);
      setIsResetPwVerified(false);
      setResetPwSuccess(false);

      setEmailAlert({
        title: '리도라 비밀번호 재설정 본인인증 번호',
        code,
        email: resetPwEmail.trim(),
        sentRealEmail: Boolean(data.sentRealEmail),
        senderEmail: data.senderEmail || 'readoracontact@gmail.com',
        message: data.message
      });
    } catch {
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setResetPwCode(fallbackCode);
      setIsResetPwCodeSent(true);
      setResetPwCountdown(180);
      setIsResetPwVerified(false);
      setResetPwSuccess(false);

      setEmailAlert({
        title: '리도라 비밀번호 재설정 본인인증 번호',
        code: fallbackCode,
        email: resetPwEmail.trim(),
        sentRealEmail: false,
        senderEmail: 'readoracontact@gmail.com',
        message: '오프라인/로컬 모드로 인증번호를 제공합니다.'
      });
    } finally {
      setIsSendingEmail(false);
    }
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

    const hasEnglish = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword);

    if (newPassword.length < 8 || newPassword.length > 16 || !hasEnglish || !hasNumber || !hasSpecial) {
      setResetPwError('비밀번호는 8~16자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.');
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

        {/* Signup Email Sent Guidance Banner (No OTP code exposed) */}
        {activeTab === 'signup' && signupNotice && !completedSignupProfile && (
          <div className="border-b px-5 py-3.5 text-xs bg-[#EBF7EE] border-[#C8E8CD] text-[#1E562D]">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 shrink-0 mt-0.5 text-[#2D6A4F]" />
              <div className="flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[#2D6A4F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    인증번호 이메일 발송 완료
                  </span>
                  <button
                    type="button"
                    onClick={() => setSignupNotice(null)}
                    className="text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] space-y-0.5 text-stone-700">
                  <p>
                    <strong>수신:</strong> <span className="font-mono text-[#19221C]">{signupNotice.email}</span>
                  </p>
                  <p className="text-[#2D6A4F] font-medium pt-0.5">
                    {signupNotice.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Verification Notification Banner (Find ID / Reset Password only) */}
        {activeTab !== 'signup' && emailAlert && (
          <div className={`border-b px-5 py-3.5 text-xs transition-all ${
            emailAlert.sentRealEmail
              ? 'bg-[#EBF7EE] border-[#C8E8CD] text-[#1E562D]'
              : 'bg-[#FFF9EC] border-[#F4DCB0] text-[#7B4D16]'
          }`}>
            <div className="flex items-start gap-2.5">
              <Mail className={`w-4 h-4 shrink-0 mt-0.5 ${
                emailAlert.sentRealEmail ? 'text-[#2D6A4F]' : 'text-[#DF612D]'
              }`} />
              <div className="flex-1">
                <div className="font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {emailAlert.sentRealEmail ? (
                      <span className="inline-flex items-center gap-1 text-[#2D6A4F]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        실제 이메일 발송 완료 ({emailAlert.senderEmail})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#DF612D]">
                        <Sparkles className="w-3.5 h-3.5" />
                        대표 메일({emailAlert.senderEmail}) 본인인증 번호
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEmailAlert(null)}
                    className="text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-1 text-[11px] space-y-0.5 text-stone-700">
                  <p>
                    <strong>발신:</strong> <span className="font-mono text-[#19221C]">{emailAlert.senderEmail}</span>
                    <span className="mx-1 text-stone-300">|</span>
                    <strong>수신:</strong> <span className="font-mono text-[#19221C]">{emailAlert.email}</span>
                  </p>
                  {emailAlert.sentRealEmail ? (
                    <p className="text-[#2D6A4F] font-medium pt-0.5">
                      수신함(또는 스팸함)을 확인하여 6자리 인증번호를 확인해 주세요.
                    </p>
                  ) : (
                    <p className="text-stone-600 text-[10px] leading-relaxed pt-0.5">
                      {emailAlert.message || '구글 16자리 앱 비밀번호 설정 확인 중입니다. 원활한 진행을 위해 화면에 인증번호를 즉시 제공해 드립니다.'}
                    </p>
                  )}
                </div>

                <div className="mt-2 inline-flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shadow-xs">
                  <span className="text-[11px] text-stone-600 font-medium">인증번호:</span>
                  <span className="font-mono font-extrabold text-sm tracking-widest text-[#DF612D]">
                    {emailAlert.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeTab === 'find_id') setFindIdInputCode(emailAlert.code);
                      if (activeTab === 'reset_password') setResetPwInputCode(emailAlert.code);
                    }}
                    className="text-[10px] font-bold text-[#DF612D] bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-md transition-colors ml-1 cursor-pointer"
                  >
                    코드 자동 입력
                  </button>
                </div>
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
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#DF612D] hover:bg-[#c95221] active:scale-[0.98] text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? '로그인 중...' : '로그인하기'}
              </button>
            </form>
          )}

          {/* ==================== 2. SIGNUP VIEW ==================== */}
          {activeTab === 'signup' && (
            completedSignupProfile ? (
              <div className="space-y-4 pt-2 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#19221C]">
                    회원가입 및 이메일 인증이 완료되었습니다!
                  </h4>
                  <p className="text-xs text-stone-600 mt-1">
                    리도라(Readora) 계정이 안전하게 생성되었으며 본인 인증 세션이 유지됩니다.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E7E0D3] text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">이름</span>
                    <span className="font-semibold text-[#19221C]">{completedSignupProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <span className="text-stone-500">아이디</span>
                    <span className="font-mono font-bold text-[#172E22]">@{completedSignupProfile.username}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <span className="text-stone-500">인증 이메일</span>
                    <span className="font-mono text-stone-700">{completedSignupProfile.email || signupEmail.trim()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200 text-left">
                  가입하신 아이디로 자동 로그인되었으며, 새로고침 후에도 로그인 상태가 안전하게 유지됩니다.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    resetSignupFlowState();
                    onClose();
                  }}
                  className="w-full py-3 bg-[#172E22] hover:bg-[#234332] text-white rounded-xl font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  확인 및 닫기
                </button>
              </div>
            ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* ID with Duplicate Check */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  아이디 (ID) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={signupId}
                    onChange={(e) => {
                      setSignupId(e.target.value);
                      setIdCheckStatus('idle');
                      setIdCheckMessage('');
                      setCheckedUsername('');
                    }}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="영문, 숫자 4자 이상"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white disabled:bg-stone-100 disabled:text-stone-500"
                  />
                  <button
                    type="button"
                    onClick={handleCheckIdDuplicate}
                    disabled={isSignupCodeSent || isSignupEmailVerified || idCheckStatus === 'checking'}
                    className="px-3.5 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-semibold shrink-0 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {idCheckStatus === 'checking' ? '확인 중...' : '중복 확인'}
                  </button>
                </div>
                {idCheckMessage && (
                  <p className={`text-[11px] mt-1 font-medium ${idCheckStatus === 'available' ? 'text-emerald-600' : idCheckStatus === 'checking' ? 'text-stone-500' : 'text-red-600'}`}>
                    {idCheckMessage}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="8~16자 영문/숫자/특수문자"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white disabled:bg-stone-100 disabled:text-stone-500"
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
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="동일하게 한 번 더 입력"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white disabled:bg-stone-100 disabled:text-stone-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-stone-500">
                비밀번호는 <strong>8~16자</strong>로 <strong>영문, 숫자, 특수문자</strong>를 반드시 모두 포함해야 합니다.
              </p>

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
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white disabled:bg-stone-100 disabled:text-stone-500"
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
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="403-123-4567"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white disabled:bg-stone-100 disabled:text-stone-500"
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
                      disabled={isSignupCodeSent || isSignupEmailVerified}
                      onClick={() => setSignupGender(g)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-60 ${
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
                      setSignupOtpExpiresAt(null);
                      setSignupResendAvailableAt(null);
                      setSignupCountdown(SIGNUP_OTP_EXPIRY_SECONDS);
                      setSignupResendCooldown(0);
                      setSignupNotice(null);
                    }}
                    placeholder="calgary@example.com"
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#DF612D] text-xs bg-white disabled:bg-stone-100 disabled:text-stone-500"
                  />
                  <button
                    type="button"
                    onClick={handleSendSignupCode}
                    disabled={isSignupEmailVerified || isSendingEmail || (isSignupCodeSent && signupResendCooldown > 0)}
                    className="px-3.5 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-medium shrink-0 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {isSendingEmail
                      ? '발송 중...'
                      : isSignupCodeSent
                        ? signupResendCooldown > 0
                          ? `재발송 (${signupResendCooldown}s)`
                          : '재발송'
                        : '인증번호 발송'}
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
                      inputMode="numeric"
                      maxLength={6}
                      value={signupInputCode}
                      onChange={(e) => setSignupInputCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6자리 숫자"
                      className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-center font-mono font-bold tracking-widest text-sm bg-white focus:outline-none focus:border-[#DF612D]"
                    />
                    <button
                      type="button"
                      onClick={handleVerifySignupCode}
                      disabled={isVerifyingSignupOtp}
                      className="px-4 py-2 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingSignupOtp ? '확인 중...' : '확인'}
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
                disabled={!isSignupCodeSent || isVerifyingSignupOtp}
                className="w-full py-3 bg-[#DF612D] hover:bg-[#c95221] text-white rounded-xl font-semibold text-sm shadow-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                {isVerifyingSignupOtp
                  ? '인증 확인 중...'
                  : isSignupCodeSent
                    ? '인증 확인 및 회원가입 완료'
                    : '이메일 인증번호를 발송해주세요'}
              </button>
            </form>
            )
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
                        disabled={isSendingEmail}
                        className="px-3.5 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-medium shrink-0 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {isSendingEmail ? '발송 중...' : isFindIdCodeSent ? '인증번호 재발송' : '인증번호 발송'}
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
                        disabled={isSendingEmail}
                        className="px-3.5 py-2 rounded-xl bg-[#172E22] hover:bg-[#234332] text-white text-xs font-medium shrink-0 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        {isSendingEmail ? '발송 중...' : isResetPwCodeSent ? '인증번호 재발송' : '인증번호 발송'}
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
