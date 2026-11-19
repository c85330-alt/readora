import { User } from '../types';
import {
  clearAuthSessionStorage,
  createEphemeralSupabaseClient,
  getSupabaseClient,
  isSupabaseConfigured,
  setAuthPersistenceMode,
  supabaseConfigError,
} from './supabase';

export const AUTH_OTP_EXPIRY_SECONDS = 600; // 10 minutes (matches Supabase OTP Expiration = 600s)
export const AUTH_OTP_RESEND_COOLDOWN_SECONDS = 60;

export interface RecoverySessionTokens {
  access_token: string;
  refresh_token: string;
}

export interface SendAuthOtpResult {
  success: boolean;
  cooldownSeconds?: number;
  expirySeconds?: number;
  message?: string;
}

export interface VerifyFindIdOtpResult {
  success: boolean;
  username?: string;
  name?: string;
  createdAt?: string;
  message?: string;
}

export interface VerifyResetPasswordOtpResult {
  success: boolean;
  recoverySession?: RecoverySessionTokens;
  message?: string;
}

export interface UsernameLoginResult {
  success: boolean;
  user?: User;
  message?: string;
}

export interface RestoreSessionResult {
  user: User | null;
  suspended?: boolean;
}

export interface AdminVerifyResult {
  authorized: boolean;
  message?: string;
}

export interface AdminMembersResult {
  success: boolean;
  members: User[];
  message?: string;
}

function normalizeRole(role: unknown): 'admin' | 'host' | 'user' {
  if (role === 'admin' || role === 'host') return role;
  return 'user';
}

function normalizeStatus(status: unknown): 'active' | 'suspended' {
  if (status === 'suspended') return 'suspended';
  return 'active';
}

function formatCreatedAt(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('ko-KR');
    }
    return value;
  }
  return new Date().toLocaleDateString('ko-KR');
}

export function mapProfileToUser(
  profile: Record<string, unknown>,
  emailFallback?: string
): User {
  const username = typeof profile.username === 'string' ? profile.username : '';
  const rawName = typeof profile.name === 'string' ? profile.name.trim() : '';
  const rawEmail = typeof profile.email === 'string' ? profile.email.trim() : '';

  return {
    id: String(profile.id ?? ''),
    username,
    name: rawName || username || '리도라 회원',
    email: rawEmail || emailFallback || '',
    phone: typeof profile.phone === 'string' ? profile.phone : '',
    gender:
      typeof profile.gender === 'string' && profile.gender.trim()
        ? profile.gender
        : '기타',
    role: normalizeRole(profile.role),
    status: normalizeStatus(profile.status),
    createdAt: formatCreatedAt(profile.created_at),
  };
}

export async function fetchOwnSupabaseProfile(
  userId: string,
  emailFallback?: string
): Promise<{ user: User | null; suspended?: boolean; errorMessage?: string }> {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      errorMessage: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return {
        user: null,
        errorMessage: '회원 프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }

    const mapped = mapProfileToUser(data as Record<string, unknown>, emailFallback);
    if (mapped.status === 'suspended') {
      return {
        user: null,
        suspended: true,
        errorMessage: '관리자에 의해 이용이 정지된 계정입니다. 운영팀에 문의해 주세요.',
      };
    }

    return { user: mapped };
  } catch {
    return {
      user: null,
      errorMessage: '회원 프로필 조회 중 오류가 발생했습니다.',
    };
  }
}

export async function loginWithUsername(
  username: string,
  password: string,
  rememberMe: boolean = false
): Promise<UsernameLoginResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  const cleanUsername = username.trim();
  if (!cleanUsername || !password) {
    return {
      success: false,
      message: '아이디와 비밀번호를 모두 입력해 주세요.',
    };
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: cleanUsername,
        password,
      }),
    });

    let payload: {
      success?: boolean;
      message?: string;
      session?: { access_token?: string; refresh_token?: string };
    } = {};

    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = {};
    }

    if (!response.ok || !payload.success || !payload.session?.access_token || !payload.session?.refresh_token) {
      return {
        success: false,
        message:
          payload.message ||
          (response.status === 404
            ? '로그인 API 경로를 찾을 수 없습니다. 서버 설정을 확인해 주세요.'
            : '아이디 또는 비밀번호가 일치하지 않습니다.'),
      };
    }

    // Apply chosen session storage BEFORE setSession so tokens persist according to rememberMe
    setAuthPersistenceMode(rememberMe ? 'local' : 'session');

    const client = getSupabaseClient();
    const { data: sessionData, error: sessionError } = await client.auth.setSession({
      access_token: payload.session.access_token,
      refresh_token: payload.session.refresh_token,
    });

    if (sessionError || !sessionData.user) {
      return {
        success: false,
        message: '로그인 세션을 저장하지 못했습니다. 다시 시도해 주세요.',
      };
    }

    const profileRes = await fetchOwnSupabaseProfile(
      sessionData.user.id,
      sessionData.user.email ?? undefined
    );

    if (!profileRes.user) {
      await client.auth.signOut();
      return {
        success: false,
        message:
          profileRes.errorMessage ||
          '회원 프로필 정보를 확인할 수 없습니다. 운영팀에 문의해 주세요.',
      };
    }

    return {
      success: true,
      user: profileRes.user,
    };
  } catch {
    return {
      success: false,
      message: '서버와 통신하는 중 오류가 발생했습니다. 네트워크 연결을 확인 후 다시 시도해 주세요.',
    };
  }
}

export async function restoreSupabaseSessionUser(): Promise<RestoreSessionResult> {
  if (!isSupabaseConfigured) {
    return { user: null };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getSession();

    if (error || !data.session?.user) {
      return { user: null };
    }

    const profileRes = await fetchOwnSupabaseProfile(
      data.session.user.id,
      data.session.user.email ?? undefined
    );

    if (profileRes.suspended) {
      await client.auth.signOut();
      return { user: null, suspended: true };
    }

    return { user: profileRes.user };
  } catch {
    return { user: null };
  }
}

export async function logoutSupabaseSession(): Promise<void> {
  try {
    if (isSupabaseConfigured) {
      const client = getSupabaseClient();
      await client.auth.signOut();
    }
  } catch {
    // Ignore signOut errors on client cleanup
  } finally {
    clearAuthSessionStorage();
  }
}

export async function verifyAdminAccessOnServer(): Promise<AdminVerifyResult> {
  if (!isSupabaseConfigured) {
    return { authorized: false, message: 'Supabase 설정이 필요합니다.' };
  }

  try {
    const client = getSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      return { authorized: false, message: '관리자 인증 세션이 없습니다.' };
    }

    const response = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let payload: { authorized?: boolean; message?: string } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = {};
    }

    return {
      authorized: response.ok && Boolean(payload.authorized),
      message: payload.message,
    };
  } catch {
    return {
      authorized: false,
      message: '관리자 권한 검증 서버 요청에 실패했습니다.',
    };
  }
}

export async function fetchAdminMembersOnServer(): Promise<AdminMembersResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      members: [],
      message: 'Supabase 설정이 필요합니다.',
    };
  }

  try {
    const client = getSupabaseClient();
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData.session?.access_token;

    if (!token) {
      return {
        success: false,
        members: [],
        message: '관리자 인증 세션이 필요합니다.',
      };
    }

    const response = await fetch('/api/admin/members', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let payload: { success?: boolean; members?: User[]; message?: string } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = {};
    }

    if (!response.ok || !payload.success || !Array.isArray(payload.members)) {
      return {
        success: false,
        members: [],
        message: payload.message || '회원 목록을 불러오지 못했습니다.',
      };
    }

    return {
      success: true,
      members: payload.members,
    };
  } catch {
    return {
      success: false,
      members: [],
      message: '회원 목록 조회 요청 중 오류가 발생했습니다.',
    };
  }
}

export async function updateOwnSupabaseProfile(
  userId: string,
  payload: { name: string; phone: string },
  emailFallback?: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('profiles')
      .update({
        name: payload.name.trim(),
        phone: payload.phone.trim(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error || !data) {
      return {
        success: false,
        message: '프로필 정보를 저장하는 중 오류가 발생했습니다.',
      };
    }

    return {
      success: true,
      user: mapProfileToUser(data as Record<string, unknown>, emailFallback),
    };
  } catch {
    return {
      success: false,
      message: '프로필 저장 중 오류가 발생했습니다.',
    };
  }
}

export async function changeOwnSupabasePassword(params: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; message?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  const cleanEmail = params.email.trim();
  if (!cleanEmail) {
    return {
      success: false,
      message: '현재 계정 이메일 정보를 확인할 수 없습니다. 다시 로그인 후 시도해 주세요.',
    };
  }

  try {
    const client = getSupabaseClient();

    // Verify current password via Supabase Auth before updating
    const { error: verifyError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password: params.currentPassword,
    });

    if (verifyError) {
      return {
        success: false,
        message: '현재 비밀번호가 일치하지 않습니다.',
      };
    }

    const { error: updateError } = await client.auth.updateUser({
      password: params.newPassword,
    });

    if (updateError) {
      const msg = (updateError.message || '').toLowerCase();
      if (msg.includes('different from the old')) {
        return {
          success: false,
          message: '새 비밀번호는 현재 비밀번호와 다르게 설정해 주세요.',
        };
      }
      if (msg.includes('password') || msg.includes('weak')) {
        return {
          success: false,
          message: '새 비밀번호는 8~16자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
        };
      }
      return {
        success: false,
        message: '비밀번호 변경 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      message: '비밀번호 변경 중 오류가 발생했습니다.',
    };
  }
}

export async function sendFindIdOtp(email: string): Promise<SendAuthOtpResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const response = await fetch('/api/auth/find-id/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    let payload: {
      success?: boolean;
      cooldownSeconds?: number;
      expirySeconds?: number;
      retryAfterSeconds?: number;
      message?: string;
    } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = {};
    }

    if (!response.ok || !payload.success) {
      return {
        success: false,
        cooldownSeconds: payload.retryAfterSeconds,
        message: payload.message || '인증번호 발송 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }

    return {
      success: true,
      cooldownSeconds: payload.cooldownSeconds ?? AUTH_OTP_RESEND_COOLDOWN_SECONDS,
      expirySeconds: payload.expirySeconds ?? AUTH_OTP_EXPIRY_SECONDS,
      message: payload.message,
    };
  } catch {
    return {
      success: false,
      message: '서버와 통신하는 중 오류가 발생했습니다. 네트워크 연결을 확인 후 다시 시도해 주세요.',
    };
  }
}

export async function verifyFindIdOtp(
  email: string,
  token: string
): Promise<VerifyFindIdOtpResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const response = await fetch('/api/auth/find-id/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        token: token.trim(),
      }),
    });

    let payload: {
      success?: boolean;
      username?: string;
      name?: string;
      createdAt?: string;
      message?: string;
    } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = {};
    }

    if (!response.ok || !payload.success || !payload.username) {
      return {
        success: false,
        message: payload.message || '인증번호 확인에 실패했습니다. 다시 확인해 주세요.',
      };
    }

    return {
      success: true,
      username: payload.username,
      name: payload.name || '',
      createdAt: payload.createdAt || '',
    };
  } catch {
    return {
      success: false,
      message: '서버와 통신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }
}

export async function sendResetPasswordOtp(email: string): Promise<SendAuthOtpResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const response = await fetch('/api/auth/reset-password/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    let payload: {
      success?: boolean;
      cooldownSeconds?: number;
      expirySeconds?: number;
      retryAfterSeconds?: number;
      message?: string;
    } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = {};
    }

    if (!response.ok || !payload.success) {
      return {
        success: false,
        cooldownSeconds: payload.retryAfterSeconds,
        message: payload.message || '인증번호 발송 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }

    return {
      success: true,
      cooldownSeconds: payload.cooldownSeconds ?? AUTH_OTP_RESEND_COOLDOWN_SECONDS,
      expirySeconds: payload.expirySeconds ?? AUTH_OTP_EXPIRY_SECONDS,
      message: payload.message,
    };
  } catch {
    return {
      success: false,
      message: '서버와 통신하는 중 오류가 발생했습니다. 네트워크 연결을 확인 후 다시 시도해 주세요.',
    };
  }
}

export async function verifyResetPasswordOtp(
  email: string,
  token: string
): Promise<VerifyResetPasswordOtpResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const response = await fetch('/api/auth/reset-password/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        token: token.trim(),
      }),
    });

    let payload: {
      success?: boolean;
      recoverySession?: RecoverySessionTokens;
      message?: string;
    } = {};
    try {
      payload = (await response.json()) as typeof payload;
    } catch {
      payload = {};
    }

    if (
      !response.ok ||
      !payload.success ||
      !payload.recoverySession?.access_token ||
      !payload.recoverySession?.refresh_token
    ) {
      return {
        success: false,
        message: payload.message || '인증번호 확인에 실패했습니다. 다시 확인해 주세요.',
      };
    }

    return {
      success: true,
      recoverySession: payload.recoverySession,
    };
  } catch {
    return {
      success: false,
      message: '서버와 통신하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }
}

export async function completePasswordResetWithRecoverySession(
  recoverySession: RecoverySessionTokens,
  newPassword: string
): Promise<{ success: boolean; message?: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  const ephemeralClient = createEphemeralSupabaseClient();
  let sessionEstablished = false;

  try {
    const { error: setSessionError } = await ephemeralClient.auth.setSession({
      access_token: recoverySession.access_token,
      refresh_token: recoverySession.refresh_token,
    });

    if (setSessionError) {
      return {
        success: false,
        message: '비밀번호 재설정 인증 세션이 만료되었습니다. 이메일 인증을 다시 진행해 주세요.',
      };
    }
    sessionEstablished = true;

    const { error: updateError } = await ephemeralClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      const msg = (updateError.message || '').toLowerCase();
      if (msg.includes('different from the old') || msg.includes('same_password')) {
        return {
          success: false,
          message: '새 비밀번호는 이전 비밀번호와 다르게 설정해 주세요.',
        };
      }
      if (msg.includes('password') || msg.includes('weak')) {
        return {
          success: false,
          message: '비밀번호는 8~16자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
        };
      }
      if (msg.includes('expired') || msg.includes('jwt') || msg.includes('session')) {
        return {
          success: false,
          message: '인증 세션이 만료되었습니다. 인증번호를 다시 발급받아 주세요.',
        };
      }
      return {
        success: false,
        message: '비밀번호 재설정 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }

    return { success: true };
  } catch {
    return {
      success: false,
      message: '비밀번호 재설정 중 오류가 발생했습니다.',
    };
  } finally {
    if (sessionEstablished) {
      try {
        await ephemeralClient.auth.signOut({ scope: 'local' });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

export async function revokeEphemeralRecoverySession(
  recoverySession: RecoverySessionTokens | null
): Promise<void> {
  if (!recoverySession || !isSupabaseConfigured) return;

  try {
    const ephemeralClient = createEphemeralSupabaseClient();
    const { error } = await ephemeralClient.auth.setSession({
      access_token: recoverySession.access_token,
      refresh_token: recoverySession.refresh_token,
    });
    if (!error) {
      await ephemeralClient.auth.signOut({ scope: 'local' });
    }
  } catch {
    // Ignore cleanup errors
  }
}
