import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowLeft,
  Copy,
  Check
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
import {
  AUTH_OTP_EXPIRY_SECONDS,
  AUTH_OTP_RESEND_COOLDOWN_SECONDS,
  RecoverySessionTokens,
  completePasswordResetWithRecoverySession,
  loginWithUsername,
  mapProfileToUser,
  revokeEphemeralRecoverySession,
  sendFindIdOtp,
  sendResetPasswordOtp,
  verifyFindIdOtp,
  verifyResetPasswordOtp,
} from '../lib/supabaseAuth';
import {
  formatBirthDateKorean,
  getBirthDayOptions,
  getBirthMonthOptions,
  getBirthYearOptions,
  validateBirthDateParts,
} from '../utils/birthDate';

export type AuthMode = 'login' | 'signup' | 'find_id' | 'reset_password';

interface FoundIdInfo {
  username: string;
  name: string;
  createdAt: string;
  email: string;
}

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
  onResetPassword: _onResetPassword,
  initialTab = 'login'
}) => {
  const [activeTab, setActiveTab] = useState<AuthMode>(initialTab);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
  const [signupBirthYear, setSignupBirthYear] = useState('');
  const [signupBirthMonth, setSignupBirthMonth] = useState('');
  const [signupBirthDay, setSignupBirthDay] = useState('');
  const [signupBirthDateError, setSignupBirthDateError] = useState('');
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

  // Signup OTP dispatch loading state
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Find ID state (Supabase Auth OTP + server verification)
  const [findIdEmail, setFindIdEmail] = useState('');
  const [findIdInputCode, setFindIdInputCode] = useState('');
  const [isFindIdCodeSent, setIsFindIdCodeSent] = useState(false);
  const [isFindIdVerified, setIsFindIdVerified] = useState(false);
  const [isSendingFindIdOtp, setIsSendingFindIdOtp] = useState(false);
  const [isVerifyingFindIdOtp, setIsVerifyingFindIdOtp] = useState(false);
  const [findIdNotice, setFindIdNotice] = useState<{ email: string; message: string } | null>(null);
  const [foundUser, setFoundUser] = useState<FoundIdInfo | null>(null);
  const [findIdError, setFindIdError] = useState('');
  const [findIdOtpExpiresAt, setFindIdOtpExpiresAt] = useState<number | null>(null);
  const [findIdResendAvailableAt, setFindIdResendAvailableAt] = useState<number | null>(null);
  const [findIdCountdown, setFindIdCountdown] = useState(AUTH_OTP_EXPIRY_SECONDS);
  const [findIdResendCooldown, setFindIdResendCooldown] = useState(0);
  const [copiedId, setCopiedId] = useState(false);

  // Reset Password state (Supabase Auth recovery OTP + isolated updateUser)
  const [resetPwEmail, setResetPwEmail] = useState('');
  const [resetPwInputCode, setResetPwInputCode] = useState('');
  const [isResetPwCodeSent, setIsResetPwCodeSent] = useState(false);
  const [isResetPwVerified, setIsResetPwVerified] = useState(false);
  const [isSendingResetPwOtp, setIsSendingResetPwOtp] = useState(false);
  const [isVerifyingResetPwOtp, setIsVerifyingResetPwOtp] = useState(false);
  const [isUpdatingResetPw, setIsUpdatingResetPw] = useState(false);
  const [resetPwNotice, setResetPwNotice] = useState<{ email: string; message: string } | null>(null);
  const [recoverySession, setRecoverySession] = useState<RecoverySessionTokens | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetPwSuccess, setResetPwSuccess] = useState(false);
  const [resetPwError, setResetPwError] = useState('');
  const [resetPwOtpExpiresAt, setResetPwOtpExpiresAt] = useState<number | null>(null);
  const [resetPwResendAvailableAt, setResetPwResendAvailableAt] = useState<number | null>(null);
  const [resetPwCountdown, setResetPwCountdown] = useState(AUTH_OTP_EXPIRY_SECONDS);
  const [resetPwResendCooldown, setResetPwResendCooldown] = useState(0);

  useEffect(() => {
    setActiveTab(initialTab);
    setRememberMe(false);
    setLoginError('');
    setIsLoggingIn(false);
    setSignupError('');
    setSignupBirthDateError('');
    setSignupVerificationError('');
    setFindIdError('');
    setResetPwError('');
  }, [initialTab, isOpen]);

  // Clean up any unused in-memory recovery session if modal closes
  useEffect(() => {
    if (!isOpen && recoverySession) {
      void revokeEphemeralRecoverySession(recoverySession);
      setRecoverySession(null);
      setNewPassword('');
      setNewPasswordConfirm('');
      setIsResetPwVerified(false);
    }
  }, [isOpen, recoverySession]);

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

  // Timer countdown for Find ID OTP verification
  useEffect(() => {
    if (!isFindIdCodeSent || isFindIdVerified || !findIdOtpExpiresAt) return;

    const updateTimers = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((findIdOtpExpiresAt - now) / 1000));
      setFindIdCountdown(remaining);

      if (findIdResendAvailableAt) {
        const resendRemaining = Math.max(0, Math.ceil((findIdResendAvailableAt - now) / 1000));
        setFindIdResendCooldown(resendRemaining);
      } else {
        setFindIdResendCooldown(0);
      }
    };

    updateTimers();
    const timer = setInterval(updateTimers, 500);
    return () => clearInterval(timer);
  }, [isFindIdCodeSent, isFindIdVerified, findIdOtpExpiresAt, findIdResendAvailableAt]);

  // Timer countdown for Reset Password OTP verification
  useEffect(() => {
    if (!isResetPwCodeSent || isResetPwVerified || !resetPwOtpExpiresAt) return;

    const updateTimers = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((resetPwOtpExpiresAt - now) / 1000));
      setResetPwCountdown(remaining);

      if (resetPwResendAvailableAt) {
        const resendRemaining = Math.max(0, Math.ceil((resetPwResendAvailableAt - now) / 1000));
        setResetPwResendCooldown(resendRemaining);
      } else {
        setResetPwResendCooldown(0);
      }
    };

    updateTimers();
    const timer = setInterval(updateTimers, 500);
    return () => clearInterval(timer);
  }, [isResetPwCodeSent, isResetPwVerified, resetPwOtpExpiresAt, resetPwResendAvailableAt]);

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
    setSignupBirthYear('');
    setSignupBirthMonth('');
    setSignupBirthDay('');
    setSignupBirthDateError('');
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
      const result = await loginWithUsername(cleanId, loginPassword, rememberMe);
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
  const birthYearOptions = getBirthYearOptions();
  const birthMonthOptions = getBirthMonthOptions();
  const birthDayOptions = getBirthDayOptions();

  const validateSignupFieldsBeforeOtp = (): string | null => {
    setSignupBirthDateError('');
    const cleanId = signupId.trim();
    const cleanName = signupName.trim();
    const cleanPhone = signupPhone.trim();
    const cleanEmail = signupEmail.trim();
    const birthCheck = validateBirthDateParts(
      signupBirthYear,
      signupBirthMonth,
      signupBirthDay
    );

    if (!cleanId || !signupPassword.trim() || !cleanName || !cleanEmail || !cleanPhone) {
      if (!birthCheck.valid) {
        setSignupBirthDateError(birthCheck.message || '생년월일을 입력해 주세요.');
      }
      return '모든 필수 항목(아이디, 비밀번호, 이름, 연락처, 생년월일, 이메일)을 입력해 주세요.';
    }

    if (!birthCheck.valid || !birthCheck.formatted) {
      const msg = birthCheck.message || '생년월일을 입력해 주세요.';
      setSignupBirthDateError(msg);
      return msg;
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

    const birthCheck = validateBirthDateParts(
      signupBirthYear,
      signupBirthMonth,
      signupBirthDay
    );
    if (!birthCheck.valid || !birthCheck.formatted) {
      const msg = birthCheck.message || '생년월일을 입력해 주세요.';
      setSignupBirthDateError(msg);
      setSignupError(msg);
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
        birthDate: birthCheck.formatted,
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

    const birthCheck = validateBirthDateParts(
      signupBirthYear,
      signupBirthMonth,
      signupBirthDay
    );
    if (!birthCheck.valid || !birthCheck.formatted) {
      const msg = birthCheck.message || '생년월일을 입력해 주세요.';
      setSignupBirthDateError(msg);
      setSignupError(msg);
      setSignupVerificationError(msg);
      return;
    }

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
      const result = await verifySignupOtpAndFetchProfile(
        signupEmail.trim(),
        token,
        birthCheck.formatted
      );
      if (!result.success || !result.profile) {
        setSignupVerificationError(
          result.errorMessage || '인증번호 확인에 실패했습니다. 다시 확인해 주세요.'
        );
        return;
      }

      _onRegisterUser(
        mapProfileToUser(
          result.profile as unknown as Record<string, unknown>,
          signupEmail.trim()
        )
      );
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

    const birthCheck = validateBirthDateParts(
      signupBirthYear,
      signupBirthMonth,
      signupBirthDay
    );
    if (!birthCheck.valid || !birthCheck.formatted) {
      const msg = birthCheck.message || '생년월일을 입력해 주세요.';
      setSignupBirthDateError(msg);
      setSignupError(msg);
      return;
    }

    if (!isSignupCodeSent) {
      setSignupError('먼저 이메일 [인증번호 발송] 버튼을 눌러 6자리 인증번호를 받아 주세요.');
      return;
    }

    await handleVerifySignupCode();
  };

  // ===================== FIND ID FLOW (Supabase Auth OTP + Server Verification) =====================
  const resetFindIdFlowState = () => {
    setFindIdInputCode('');
    setIsFindIdCodeSent(false);
    setIsFindIdVerified(false);
    setFoundUser(null);
    setFindIdError('');
    setFindIdNotice(null);
    setFindIdOtpExpiresAt(null);
    setFindIdResendAvailableAt(null);
    setFindIdCountdown(AUTH_OTP_EXPIRY_SECONDS);
    setFindIdResendCooldown(0);
  };

  const resetPasswordFlowState = (clearEmail: boolean = false) => {
    if (recoverySession) {
      void revokeEphemeralRecoverySession(recoverySession);
      setRecoverySession(null);
    }
    if (clearEmail) {
      setResetPwEmail('');
    }
    setResetPwInputCode('');
    setIsResetPwCodeSent(false);
    setIsResetPwVerified(false);
    setResetPwNotice(null);
    setNewPassword('');
    setNewPasswordConfirm('');
    setResetPwSuccess(false);
    setResetPwError('');
    setResetPwOtpExpiresAt(null);
    setResetPwResendAvailableAt(null);
    setResetPwCountdown(AUTH_OTP_EXPIRY_SECONDS);
    setResetPwResendCooldown(0);
  };

  const switchAuthTab = (targetTab: AuthMode) => {
    if (activeTab === 'reset_password' && targetTab !== 'reset_password' && recoverySession) {
      void revokeEphemeralRecoverySession(recoverySession);
      setRecoverySession(null);
      setIsResetPwVerified(false);
      setNewPassword('');
      setNewPasswordConfirm('');
    }
    setActiveTab(targetTab);
  };

  const handleCloseModal = () => {
    if (recoverySession) {
      void revokeEphemeralRecoverySession(recoverySession);
      setRecoverySession(null);
    }
    setNewPassword('');
    setNewPasswordConfirm('');
    setLoginPassword('');
    onClose();
  };

  const handleSendFindIdCode = async () => {
    setFindIdError('');
    const cleanEmail = findIdEmail.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFindIdError('가입 시 등록한 이메일 주소를 정확히 입력해 주세요.');
      return;
    }

    if (isFindIdCodeSent && findIdResendCooldown > 0) {
      setFindIdError(`보안상 인증번호 재발송은 ${findIdResendCooldown}초 후에 요청할 수 있습니다.`);
      return;
    }

    setIsSendingFindIdOtp(true);
    try {
      const result = await sendFindIdOtp(cleanEmail);
      if (!result.success) {
        if (result.cooldownSeconds && result.cooldownSeconds > 0) {
          setFindIdResendAvailableAt(Date.now() + result.cooldownSeconds * 1000);
          setFindIdResendCooldown(result.cooldownSeconds);
        }
        setFindIdError(result.message || '인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      const now = Date.now();
      const expiry = result.expirySeconds ?? AUTH_OTP_EXPIRY_SECONDS;
      const cooldown = result.cooldownSeconds ?? AUTH_OTP_RESEND_COOLDOWN_SECONDS;

      setIsFindIdCodeSent(true);
      setIsFindIdVerified(false);
      setFoundUser(null);
      setFindIdInputCode('');
      setFindIdOtpExpiresAt(now + expiry * 1000);
      setFindIdResendAvailableAt(now + cooldown * 1000);
      setFindIdCountdown(expiry);
      setFindIdResendCooldown(cooldown);
      setFindIdNotice({
        email: cleanEmail,
        message:
          result.message ||
          '입력하신 이메일이 가입된 계정이라면 6자리 본인확인 인증번호가 발송되었습니다. 메일함(또는 스팸함)을 확인해 주세요.',
      });
    } finally {
      setIsSendingFindIdOtp(false);
    }
  };

  const handleVerifyFindIdCode = async () => {
    setFindIdError('');
    const token = findIdInputCode.trim();
    if (!/^\d{6}$/.test(token)) {
      setFindIdError('이메일로 받은 6자리 숫자 인증번호를 입력해 주세요.');
      return;
    }

    if (findIdCountdown <= 0) {
      setFindIdError('인증번호 유효 시간(10분)이 만료되었습니다. 재발송 버튼을 눌러 주세요.');
      return;
    }

    setIsVerifyingFindIdOtp(true);
    try {
      const result = await verifyFindIdOtp(findIdEmail.trim(), token);
      if (!result.success || !result.username) {
        setFindIdError(result.message || '인증번호가 일치하지 않거나 만료되었습니다. 다시 확인해 주세요.');
        return;
      }

      setFoundUser({
        username: result.username,
        name: result.name || '',
        createdAt: result.createdAt || '',
        email: findIdEmail.trim(),
      });
      setIsFindIdVerified(true);
      setFindIdNotice(null);
      setFindIdError('');
    } finally {
      setIsVerifyingFindIdOtp(false);
    }
  };

  const handleCopyId = () => {
    if (foundUser?.username) {
      navigator.clipboard.writeText(foundUser.username);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // ===================== RESET PASSWORD FLOW (Supabase Auth Recovery OTP) =====================
  const handleSendResetPwCode = async () => {
    setResetPwError('');
    const cleanEmail = resetPwEmail.trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setResetPwError('가입 시 등록한 이메일 주소를 정확히 입력해 주세요.');
      return;
    }

    if (isResetPwCodeSent && resetPwResendCooldown > 0) {
      setResetPwError(`보안상 인증번호 재발송은 ${resetPwResendCooldown}초 후에 요청할 수 있습니다.`);
      return;
    }

    setIsSendingResetPwOtp(true);
    try {
      const result = await sendResetPasswordOtp(cleanEmail);
      if (!result.success) {
        if (result.cooldownSeconds && result.cooldownSeconds > 0) {
          setResetPwResendAvailableAt(Date.now() + result.cooldownSeconds * 1000);
          setResetPwResendCooldown(result.cooldownSeconds);
        }
        setResetPwError(result.message || '인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      const now = Date.now();
      const expiry = result.expirySeconds ?? AUTH_OTP_EXPIRY_SECONDS;
      const cooldown = result.cooldownSeconds ?? AUTH_OTP_RESEND_COOLDOWN_SECONDS;

      if (recoverySession) {
        void revokeEphemeralRecoverySession(recoverySession);
        setRecoverySession(null);
      }

      setIsResetPwCodeSent(true);
      setIsResetPwVerified(false);
      setResetPwSuccess(false);
      setResetPwInputCode('');
      setResetPwOtpExpiresAt(now + expiry * 1000);
      setResetPwResendAvailableAt(now + cooldown * 1000);
      setResetPwCountdown(expiry);
      setResetPwResendCooldown(cooldown);
      setResetPwNotice({
        email: cleanEmail,
        message:
          result.message ||
          '입력하신 이메일이 가입된 계정이라면 비밀번호 재설정 6자리 인증번호가 발송되었습니다. 메일함(또는 스팸함)을 확인해 주세요.',
      });
    } finally {
      setIsSendingResetPwOtp(false);
    }
  };

  const handleVerifyResetPwCode = async () => {
    setResetPwError('');
    const token = resetPwInputCode.trim();
    if (!/^\d{6}$/.test(token)) {
      setResetPwError('이메일로 받은 6자리 숫자 인증번호를 입력해 주세요.');
      return;
    }

    if (resetPwCountdown <= 0) {
      setResetPwError('인증번호 유효 시간(10분)이 만료되었습니다. 재발송 버튼을 눌러 주세요.');
      return;
    }

    setIsVerifyingResetPwOtp(true);
    try {
      const result = await verifyResetPasswordOtp(resetPwEmail.trim(), token);
      if (!result.success || !result.recoverySession) {
        setResetPwError(result.message || '인증번호가 일치하지 않거나 만료되었습니다. 다시 확인해 주세요.');
        return;
      }

      setRecoverySession(result.recoverySession);
      setIsResetPwVerified(true);
      setResetPwNotice(null);
      setResetPwError('');
    } finally {
      setIsVerifyingResetPwOtp(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPwError('');

    if (!isResetPwVerified || !recoverySession) {
      setResetPwError('먼저 이메일 본인인증을 완료해 주세요.');
      return;
    }

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

    setIsUpdatingResetPw(true);
    try {
      const result = await completePasswordResetWithRecoverySession(recoverySession, newPassword);
      if (!result.success) {
        setResetPwError(result.message || '비밀번호 재설정에 실패했습니다. 다시 시도해 주세요.');
        return;
      }

      // Recovery session is terminated inside completePasswordResetWithRecoverySession; clear memory
      setRecoverySession(null);
      setNewPassword('');
      setNewPasswordConfirm('');
      setResetPwSuccess(true);
    } finally {
      setIsUpdatingResetPw(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-[#191919]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-[#FBF9E9] w-full max-w-md rounded-2xl shadow-2xl border border-[#191919]/20 overflow-hidden relative max-h-[94dvh] sm:max-h-[92vh] my-auto flex flex-col min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#191919] text-[#FBF9E9] px-4 sm:px-6 pt-5 pb-4 relative border-b border-[#191919]">
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-[#FBF9E9]/70 hover:text-[#FFE57E] p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#FBF9E9]">리도라</span>
            <span className="font-display-en text-[10px] font-bold uppercase tracking-[0.16em] text-[#FFE57E]">
              READORA
            </span>
          </div>

          <p className="text-[#FBF9E9]/70 text-[11px] sm:text-xs">
            {activeTab === 'login' && '우리가 책으로 만나는 시간, 리도라에 로그인하세요.'}
            {activeTab === 'signup' && '간편한 이메일 인증으로 리도라(Readora) 회원이 되어보세요.'}
            {activeTab === 'find_id' && '가입 시 등록된 이메일 인증을 통해 아이디를 확인합니다.'}
            {activeTab === 'reset_password' && '이메일 인증을 통해 안전하게 새 비밀번호를 설정합니다.'}
          </p>

          {/* Navigation Controls */}
          {activeTab === 'login' || activeTab === 'signup' ? (
            <div className="flex mt-3 sm:mt-4 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => { switchAuthTab('login'); setLoginError(''); }}
                className={`flex-1 py-1.5 sm:py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#FFE57E] text-[#191919]'
                    : 'text-[#FBF9E9]/75 hover:text-[#FBF9E9]'
                }`}
              >
                로그인 (Login)
              </button>
              <button
                onClick={() => { switchAuthTab('signup'); setSignupError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-[#FFE57E] text-[#191919]'
                    : 'text-[#FBF9E9]/75 hover:text-[#FBF9E9]'
                }`}
              >
                회원가입 (이메일 인증)
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-4 bg-white/10 p-1 rounded-lg">
              <button
                onClick={() => {
                  switchAuthTab('find_id');
                  setFindIdError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'find_id'
                    ? 'bg-[#FFE57E] text-[#191919]'
                    : 'text-[#FBF9E9]/75 hover:text-[#FBF9E9]'
                }`}
              >
                아이디 찾기
              </button>
              <button
                onClick={() => {
                  switchAuthTab('reset_password');
                  setResetPwError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'reset_password'
                    ? 'bg-[#FFE57E] text-[#191919]'
                    : 'text-[#FBF9E9]/75 hover:text-[#FBF9E9]'
                }`}
              >
                비밀번호 재설정
              </button>
            </div>
          )}
        </div>

        {/* Signup Email Sent Guidance Banner (No OTP code exposed) */}
        {activeTab === 'signup' && signupNotice && !completedSignupProfile && (
          <div className="border-b px-4 sm:px-5 py-3.5 text-xs bg-[#B9D8E6]/25 border-[#191919]/15 text-[#191919]">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 shrink-0 mt-0.5 text-[#191919]" />
              <div className="flex-1 min-w-0">
                <div className="font-bold flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[#191919]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    인증번호 이메일 발송 완료
                  </span>
                  <button
                    type="button"
                    onClick={() => setSignupNotice(null)}
                    className="text-[#191919]/50 hover:text-[#191919] cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] space-y-0.5 text-[#191919]/75">
                  <p className="break-all">
                    <strong>수신:</strong> <span className="font-mono text-[#191919] break-all">{signupNotice.email}</span>
                  </p>
                  <p className="text-[#191919] font-medium pt-0.5">
                    {signupNotice.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Find ID Email Sent Guidance Banner (No OTP code exposed) */}
        {activeTab === 'find_id' && findIdNotice && !isFindIdVerified && (
          <div className="border-b px-4 sm:px-5 py-3.5 text-xs bg-[#B9D8E6]/25 border-[#191919]/15 text-[#191919]">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 shrink-0 mt-0.5 text-[#191919]" />
              <div className="flex-1 min-w-0">
                <div className="font-bold flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[#191919]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    본인확인 인증번호 요청 완료
                  </span>
                  <button
                    type="button"
                    onClick={() => setFindIdNotice(null)}
                    className="text-[#191919]/50 hover:text-[#191919] cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] space-y-0.5 text-[#191919]/75">
                  <p className="break-all">
                    <strong>수신:</strong> <span className="font-mono text-[#191919] break-all">{findIdNotice.email}</span>
                  </p>
                  <p className="text-[#191919] font-medium pt-0.5">
                    {findIdNotice.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Password Email Sent Guidance Banner (No OTP code exposed) */}
        {activeTab === 'reset_password' && resetPwNotice && !isResetPwVerified && (
          <div className="border-b px-4 sm:px-5 py-3.5 text-xs bg-[#B9D8E6]/25 border-[#191919]/15 text-[#191919]">
            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 shrink-0 mt-0.5 text-[#191919]" />
              <div className="flex-1 min-w-0">
                <div className="font-bold flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[#191919]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    비밀번호 재설정 인증번호 요청 완료
                  </span>
                  <button
                    type="button"
                    onClick={() => setResetPwNotice(null)}
                    className="text-[#191919]/50 hover:text-[#191919] cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-1 text-[11px] space-y-0.5 text-[#191919]/75">
                  <p className="break-all">
                    <strong>수신:</strong> <span className="font-mono text-[#191919] break-all">{resetPwNotice.email}</span>
                  </p>
                  <p className="text-[#191919] font-medium pt-0.5">
                    {resetPwNotice.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1">
          {/* ==================== 1. LOGIN VIEW ==================== */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 sm:space-y-4">
              {loginError && (
                <div className="p-3 bg-[#F16B47]/10 border border-[#F16B47]/35 text-[#B93815] rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F16B47]" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#191919] mb-1.5">
                  아이디 (ID)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#191919]/40" />
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs sm:text-sm bg-[#FFFDF4] text-[#191919]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191919] mb-1.5">
                  비밀번호 (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#191919]/40" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs sm:text-sm bg-[#FFFDF4] text-[#191919]"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox (Default: unchecked) */}
              <div className="flex items-center justify-between px-0.5">
                <label className="inline-flex items-center gap-2 text-xs text-[#191919]/75 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#191919]/30 accent-[#191919] cursor-pointer"
                  />
                  <span className="font-semibold">로그인 상태 유지</span>
                </label>
              </div>

              {/* Find ID / Reset PW Links */}
              <div className="flex items-center justify-between text-xs text-[#191919]/60 pt-0.5 px-0.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFindIdEmail('');
                      resetFindIdFlowState();
                      switchAuthTab('find_id');
                    }}
                    className="hover:text-[#F16B47] font-semibold transition-colors cursor-pointer text-[11px] sm:text-xs"
                  >
                    아이디 찾기
                  </button>
                  <span className="text-[#191919]/25">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      resetPasswordFlowState(true);
                      switchAuthTab('reset_password');
                    }}
                    className="hover:text-[#F16B47] font-semibold transition-colors cursor-pointer text-[11px] sm:text-xs"
                  >
                    비밀번호 재설정
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    switchAuthTab('signup');
                    setSignupError('');
                  }}
                  className="text-[#F16B47] font-bold hover:underline cursor-pointer text-xs"
                >
                  회원가입
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#FFE57E] hover:bg-[#ffd94a] active:scale-[0.99] text-[#191919] border border-[#191919]/20 rounded-lg font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? '로그인 중...' : '로그인하기'}
              </button>
            </form>
          )}

          {/* ==================== 2. SIGNUP VIEW ==================== */}
          {activeTab === 'signup' && (
            completedSignupProfile ? (
              <div className="space-y-4 pt-2 text-center">
                <div className="w-14 h-14 rounded-xl bg-[#FFE57E] text-[#191919] border border-[#191919]/15 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-[#191919]">
                    회원가입 및 이메일 인증이 완료되었습니다!
                  </h4>
                  <p className="text-xs text-[#191919]/65 mt-1">
                    리도라(Readora) 계정이 안전하게 생성되었으며 본인 인증 세션이 유지됩니다.
                  </p>
                </div>

                <div className="p-4 bg-[#FFFDF4] rounded-xl border border-[#191919]/15 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#191919]/60">이름</span>
                    <span className="font-bold text-[#191919]">{completedSignupProfile.name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#191919]/10">
                    <span className="text-[#191919]/60">아이디</span>
                    <span className="font-mono font-bold text-[#191919]">@{completedSignupProfile.username}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#191919]/10">
                    <span className="text-[#191919]/60">생년월일</span>
                    <span className="font-medium text-[#191919]">
                      {formatBirthDateKorean(completedSignupProfile.birth_date) ||
                        completedSignupProfile.birth_date}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#191919]/10">
                    <span className="text-[#191919]/60 shrink-0">인증 이메일</span>
                    <span className="font-mono text-[#191919]/80 break-all text-right">{completedSignupProfile.email || signupEmail.trim()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#191919]/70 leading-relaxed bg-[#FFFDF4] p-3 rounded-xl border border-[#191919]/15 text-left">
                  가입하신 아이디로 자동 로그인되었으며, 새로고침 후에도 로그인 상태가 안전하게 유지됩니다.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    resetSignupFlowState();
                    onClose();
                  }}
                  className="w-full py-3 bg-[#191919] hover:bg-[#333333] text-[#FFE57E] rounded-lg font-bold text-xs transition-colors cursor-pointer"
                >
                  확인 및 닫기
                </button>
              </div>
            ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 bg-[#F16B47]/10 border border-[#F16B47]/35 text-[#B93815] rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F16B47]" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* ID with Duplicate Check */}
              <div>
                <label className="block text-xs font-bold text-[#191919] mb-1">
                  아이디 (ID) <span className="text-[#F16B47]">*</span>
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
                    className="flex-1 min-w-0 px-3 sm:px-3.5 py-2 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50"
                  />
                  <button
                    type="button"
                    onClick={handleCheckIdDuplicate}
                    disabled={isSignupCodeSent || isSignupEmailVerified || idCheckStatus === 'checking'}
                    className="px-3.5 py-2 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-xs font-bold shrink-0 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {idCheckStatus === 'checking' ? '확인 중...' : '중복 확인'}
                  </button>
                </div>
                {idCheckMessage && (
                  <p className={`text-[11px] mt-1 font-semibold ${idCheckStatus === 'available' ? 'text-emerald-700' : idCheckStatus === 'checking' ? 'text-[#191919]/60' : 'text-[#F16B47]'}`}>
                    {idCheckMessage}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    비밀번호 <span className="text-[#F16B47]">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="8~16자 영문/숫자/특수문자"
                    className="w-full px-3 py-2 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    비밀번호 확인 <span className="text-[#F16B47]">*</span>
                  </label>
                  <input
                    type="password"
                    value={signupPasswordConfirm}
                    onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="동일하게 한 번 더 입력"
                    className="w-full px-3 py-2 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50"
                  />
                </div>
              </div>
              <p className="text-[11px] text-[#191919]/60">
                비밀번호는 <strong>8~16자</strong>로 <strong>영문, 숫자, 특수문자</strong>를 반드시 모두 포함해야 합니다.
              </p>

              {/* Name & Phone (Phone is MANDATORY) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    이름 <span className="text-[#F16B47]">*</span>
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="홍길동"
                    className="w-full px-3 py-2 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#191919] mb-1">
                    연락처 <span className="text-[#F16B47]">* 필수</span>
                  </label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    placeholder="403-123-4567"
                    className="w-full px-3 py-2 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50"
                  />
                </div>
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-bold text-[#191919] mb-1">
                  성별 <span className="text-[#F16B47]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['여성', '남성', '기타'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      disabled={isSignupCodeSent || isSignupEmailVerified}
                      onClick={() => setSignupGender(g)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer disabled:opacity-60 ${
                        signupGender === g
                          ? 'bg-[#191919] text-[#FFE57E] border-[#191919]'
                          : 'bg-[#FFFDF4] text-[#191919]/75 border-[#191919]/20 hover:border-[#191919]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Date Selection (Mandatory: Year / Month / Day) */}
              <div>
                <label className="block text-xs font-bold text-[#191919] mb-1">
                  생년월일 <span className="text-[#F16B47]">* 필수</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    aria-label="생년월일 연도"
                    value={signupBirthYear}
                    onChange={(e) => {
                      const nextYear = e.target.value;
                      setSignupBirthYear(nextYear);
                      if (nextYear && signupBirthMonth && signupBirthDay) {
                        const check = validateBirthDateParts(nextYear, signupBirthMonth, signupBirthDay);
                        setSignupBirthDateError(check.valid ? '' : check.message || '');
                      } else {
                        setSignupBirthDateError('');
                      }
                    }}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    className={`w-full px-2 sm:px-3 py-2 rounded-lg border focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50 ${
                      signupBirthDateError ? 'border-[#F16B47]' : 'border-[#191919]/20'
                    }`}
                  >
                    <option value="">연도</option>
                    {birthYearOptions.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}년
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="생년월일 월"
                    value={signupBirthMonth}
                    onChange={(e) => {
                      const nextMonth = e.target.value;
                      setSignupBirthMonth(nextMonth);
                      if (signupBirthYear && nextMonth && signupBirthDay) {
                        const check = validateBirthDateParts(signupBirthYear, nextMonth, signupBirthDay);
                        setSignupBirthDateError(check.valid ? '' : check.message || '');
                      } else {
                        setSignupBirthDateError('');
                      }
                    }}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    className={`w-full px-2 sm:px-3 py-2 rounded-lg border focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50 ${
                      signupBirthDateError ? 'border-[#F16B47]' : 'border-[#191919]/20'
                    }`}
                  >
                    <option value="">월</option>
                    {birthMonthOptions.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="생년월일 일"
                    value={signupBirthDay}
                    onChange={(e) => {
                      const nextDay = e.target.value;
                      setSignupBirthDay(nextDay);
                      if (signupBirthYear && signupBirthMonth && nextDay) {
                        const check = validateBirthDateParts(signupBirthYear, signupBirthMonth, nextDay);
                        setSignupBirthDateError(check.valid ? '' : check.message || '');
                      } else {
                        setSignupBirthDateError('');
                      }
                    }}
                    disabled={isSignupCodeSent || isSignupEmailVerified}
                    className={`w-full px-2 sm:px-3 py-2 rounded-lg border focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50 ${
                      signupBirthDateError ? 'border-[#F16B47]' : 'border-[#191919]/20'
                    }`}
                  >
                    <option value="">일</option>
                    {birthDayOptions.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                {signupBirthDateError && (
                  <p className="text-[11px] mt-1 font-semibold text-[#F16B47]">{signupBirthDateError}</p>
                )}
              </div>

              {/* Email with Verification */}
              <div>
                <label className="block text-xs font-bold text-[#191919] mb-1">
                  이메일 (본인인증 필수) <span className="text-[#F16B47]">*</span>
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
                    className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919] disabled:bg-[#191919]/5 disabled:text-[#191919]/50"
                  />
                  <button
                    type="button"
                    onClick={handleSendSignupCode}
                    disabled={isSignupEmailVerified || isSendingEmail || (isSignupCodeSent && signupResendCooldown > 0)}
                    className="px-3 sm:px-3.5 py-2 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-xs font-bold shrink-0 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
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
                <div className="p-3 bg-[#FFFDF4] rounded-xl border border-[#191919]/20 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#191919]/70">
                    <span className="font-bold text-[#191919]">이메일 인증번호 6자리</span>
                    <span className="text-[#F16B47] font-mono font-bold flex items-center gap-1 text-[11px] tabular-nums">
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
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#191919]/25 text-center font-mono font-bold tracking-widest text-sm bg-white focus:outline-none focus:border-[#191919] tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={handleVerifySignupCode}
                      disabled={isVerifyingSignupOtp}
                      className="px-4 py-2 bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
                    >
                      {isVerifyingSignupOtp ? '확인 중...' : '확인'}
                    </button>
                  </div>
                  {signupVerificationError && (
                    <p className="text-[11px] text-[#F16B47] font-semibold">{signupVerificationError}</p>
                  )}
                </div>
              )}

              {isSignupEmailVerified && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>이메일 본인인증이 완료되었습니다.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!isSignupCodeSent || isVerifyingSignupOtp}
                className="w-full py-3 bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 rounded-lg font-bold text-sm transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
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
              <div className="flex items-center justify-between pb-2 border-b border-[#191919]/15">
                <button
                  type="button"
                  onClick={() => switchAuthTab('login')}
                  className="inline-flex items-center gap-1 text-xs text-[#191919]/65 hover:text-[#191919] font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>로그인 화면으로</span>
                </button>
                <span className="text-xs font-bold text-[#191919]">아이디 찾기</span>
              </div>

              {findIdError && (
                <div className="p-3 bg-[#F16B47]/10 border border-[#F16B47]/35 text-[#B93815] rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F16B47]" />
                  <span>{findIdError}</span>
                </div>
              )}

              {!isFindIdVerified ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1.5">
                      가입 시 등록한 이메일 주소
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#191919]/40" />
                        <input
                          type="email"
                          value={findIdEmail}
                          onChange={(e) => {
                            setFindIdEmail(e.target.value);
                            if (isFindIdCodeSent) {
                              resetFindIdFlowState();
                            }
                          }}
                          placeholder="가입한 이메일을 입력하세요"
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendFindIdCode}
                        disabled={isSendingFindIdOtp || (isFindIdCodeSent && findIdResendCooldown > 0)}
                        className="px-3 sm:px-3.5 py-2 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-xs font-bold shrink-0 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isSendingFindIdOtp
                          ? '발송 중...'
                          : isFindIdCodeSent
                            ? findIdResendCooldown > 0
                              ? `재발송 (${findIdResendCooldown}s)`
                              : '재발송'
                            : '인증번호 발송'}
                      </button>
                    </div>
                  </div>

                  {/* Verification Input Box */}
                  {isFindIdCodeSent && (
                    <div className="p-3 bg-[#FFFDF4] rounded-xl border border-[#191919]/20 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#191919]/70">
                        <span className="font-bold text-[#191919]">이메일 인증번호 6자리</span>
                        <span className="text-[#F16B47] font-mono font-bold flex items-center gap-1 text-[11px] tabular-nums">
                          <Clock className="w-3 h-3" />
                          {formatTime(findIdCountdown)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={findIdInputCode}
                          onChange={(e) => setFindIdInputCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6자리 숫자"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#191919]/25 text-center font-mono font-bold tracking-widest text-sm bg-white focus:outline-none focus:border-[#191919] tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyFindIdCode}
                          disabled={isVerifyingFindIdOtp}
                          className="px-4 py-2 bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
                        >
                          {isVerifyingFindIdOtp ? '확인 중...' : '인증 확인'}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-[#191919]/70 leading-relaxed bg-[#FFFDF4] p-3 rounded-xl border border-[#191919]/15">
                    가입 시 인증하셨던 이메일 주소로 본인확인용 6자리 인증번호가 발송됩니다. 인증이 완료되면 회원님의 아이디를 확인하실 수 있습니다.
                  </p>
                </div>
              ) : (
                /* Found User Result */
                <div className="space-y-4 pt-1">
                  <div className="p-5 bg-[#FFFDF4] border border-[#191919]/15 rounded-xl text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-[#FFE57E] text-[#191919] flex items-center justify-center mx-auto mb-1">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-bold text-sm text-[#191919]">본인인증이 완료되었습니다</h4>
                    <p className="text-xs text-[#191919]/70">
                      회원님의 계정 정보는 다음과 같습니다.
                    </p>

                    <div className="my-3 p-3.5 bg-[#FBF9E9] rounded-xl border border-[#191919]/15 text-left space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-[#191919]/60 shrink-0">회원 아이디:</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-mono font-bold text-base text-[#191919] break-all">
                            {foundUser?.username}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyId}
                            className="p-1 rounded-md hover:bg-white text-[#191919]/60 hover:text-[#191919] transition-colors cursor-pointer"
                            title="아이디 복사"
                          >
                            {copiedId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {foundUser?.name && (
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[#191919]/10">
                          <span className="text-[#191919]/60">이름:</span>
                          <span className="font-semibold text-[#191919]">{foundUser.name}</span>
                        </div>
                      )}

                      {foundUser?.createdAt && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#191919]/60">가입 일자:</span>
                          <span className="font-semibold text-[#191919]">{foundUser.createdAt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (foundUser) setLoginId(foundUser.username);
                        switchAuthTab('login');
                      }}
                      className="w-full py-3 bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 rounded-lg font-bold text-xs transition-colors cursor-pointer"
                    >
                      이 아이디로 로그인하기
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const verifiedEmail = foundUser?.email || findIdEmail.trim();
                        resetPasswordFlowState(false);
                        setResetPwEmail(verifiedEmail);
                        switchAuthTab('reset_password');
                      }}
                      className="w-full py-2.5 bg-[#FFFDF4] hover:bg-[#191919] hover:text-white text-[#191919] border border-[#191919]/20 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
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
              <div className="flex items-center justify-between pb-2 border-b border-[#191919]/15">
                <button
                  type="button"
                  onClick={() => switchAuthTab('login')}
                  className="inline-flex items-center gap-1 text-xs text-[#191919]/65 hover:text-[#191919] font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>로그인 화면으로</span>
                </button>
                <span className="text-xs font-bold text-[#191919]">비밀번호 재설정</span>
              </div>

              {resetPwError && (
                <div className="p-3 bg-[#F16B47]/10 border border-[#F16B47]/35 text-[#B93815] rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F16B47]" />
                  <span>{resetPwError}</span>
                </div>
              )}

              {/* Step 1 & 2: Email & OTP Verification */}
              {!isResetPwVerified ? (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1.5">
                      가입 이메일 주소
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#191919]/40" />
                        <input
                          type="email"
                          value={resetPwEmail}
                          onChange={(e) => {
                            setResetPwEmail(e.target.value);
                            if (isResetPwCodeSent) {
                              resetPasswordFlowState(false);
                            }
                          }}
                          placeholder="calgary@example.com"
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendResetPwCode}
                        disabled={isSendingResetPwOtp || (isResetPwCodeSent && resetPwResendCooldown > 0)}
                        className="px-3 sm:px-3.5 py-2 rounded-lg bg-[#191919] hover:bg-[#333333] text-[#FFE57E] text-xs font-bold shrink-0 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isSendingResetPwOtp
                          ? '발송 중...'
                          : isResetPwCodeSent
                            ? resetPwResendCooldown > 0
                              ? `재발송 (${resetPwResendCooldown}s)`
                              : '재발송'
                            : '인증번호 발송'}
                      </button>
                    </div>
                  </div>

                  {/* Verification Input Box */}
                  {isResetPwCodeSent && (
                    <div className="p-3 bg-[#FFFDF4] rounded-xl border border-[#191919]/20 space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#191919]/70">
                        <span className="font-bold text-[#191919]">이메일 인증번호 6자리</span>
                        <span className="text-[#F16B47] font-mono font-bold flex items-center gap-1 text-[11px] tabular-nums">
                          <Clock className="w-3 h-3" />
                          {formatTime(resetPwCountdown)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={resetPwInputCode}
                          onChange={(e) => setResetPwInputCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="6자리 숫자"
                          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-[#191919]/25 text-center font-mono font-bold tracking-widest text-sm bg-white focus:outline-none focus:border-[#191919] tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyResetPwCode}
                          disabled={isVerifyingResetPwOtp}
                          className="px-4 py-2 bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0 whitespace-nowrap"
                        >
                          {isVerifyingResetPwOtp ? '확인 중...' : '인증 확인'}
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-[#191919]/70 leading-relaxed bg-[#FFFDF4] p-3 rounded-xl border border-[#191919]/15">
                    회원가입 시 등록하신 이메일 주소를 입력하시면 비밀번호 재설정용 6자리 인증번호가 발송됩니다.
                  </p>
                </div>
              ) : !resetPwSuccess ? (
                /* Step 3: Enter New Password */
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="break-all">이메일 본인인증 완료 ({resetPwEmail.trim()}). 새 비밀번호를 설정하세요.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      새 비밀번호 (New Password) <span className="text-[#F16B47]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#191919]/40" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="8~16자 영문/숫자/특수문자"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191919] mb-1">
                      새 비밀번호 확인 (Confirm) <span className="text-[#F16B47]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#191919]/40" />
                      <input
                        type="password"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="새 비밀번호를 한 번 더 입력하세요"
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#191919]/20 focus:outline-none focus:border-[#191919] text-xs bg-[#FFFDF4] text-[#191919]"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-[#191919]/60">
                    비밀번호는 <strong>8~16자</strong>로 <strong>영문, 숫자, 특수문자</strong>를 반드시 모두 포함해야 합니다.
                  </p>

                  <button
                    type="submit"
                    disabled={isUpdatingResetPw}
                    className="w-full py-3 bg-[#FFE57E] hover:bg-[#ffd94a] text-[#191919] border border-[#191919]/20 rounded-lg font-bold text-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUpdatingResetPw ? '비밀번호 변경 중...' : '새 비밀번호로 재설정 완료'}
                  </button>
                </form>
              ) : (
                /* Step 4: Success Message */
                <div className="space-y-4 pt-2 text-center">
                  <div className="w-14 h-14 rounded-xl bg-[#FFE57E] text-[#191919] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-[#191919]">
                      비밀번호가 안전하게 변경되었습니다!
                    </h4>
                    <p className="text-xs text-[#191919]/65 mt-1">
                      임시 복구 세션은 안전하게 종료되었습니다. 새로 설정하신 비밀번호로 로그인해 주세요.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      resetPasswordFlowState(true);
                      setLoginPassword('');
                      switchAuthTab('login');
                    }}
                    className="w-full py-3 bg-[#191919] hover:bg-[#333333] text-[#FFE57E] rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    로그인 화면으로 이동
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
