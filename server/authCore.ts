import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthCoreResponse {
  status: number;
  body: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface AdminUserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string | null;
  role: 'admin' | 'host' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
}

const MAX_LOGIN_BODY_BYTES = 4096;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS_PER_IP = 20;
const MAX_ATTEMPTS_PER_USERNAME = 10;

const OTP_SEND_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_VERIFY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_SEND_PER_IP = 15;
const MAX_OTP_SEND_PER_EMAIL = 5;
const MAX_OTP_VERIFY_PER_IP = 25;
const MAX_OTP_VERIFY_PER_EMAIL = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_EXPIRY_SECONDS = 600;
const OTP_COOLDOWN_COOKIE_NAME = 'readora_otp_cd';

// Best-effort in-memory rate limit store.
// Note: In serverless environments (Netlify Functions), memory is per warm instance and
// is complemented by signed HttpOnly cooldown cookies and Supabase Auth's global rate limiting.
const attemptStore = new Map<string, number[]>();

function isRateLimited(
  key: string,
  maxAttempts: number,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recent = (attemptStore.get(key) ?? []).filter((ts) => ts > windowStart);

  if (recent.length >= maxAttempts) {
    attemptStore.set(key, recent);
    return true;
  }

  recent.push(now);
  attemptStore.set(key, recent);

  // Opportunistic cleanup so map stays bounded
  if (attemptStore.size > 2000) {
    for (const [k, list] of attemptStore.entries()) {
      const alive = list.filter((ts) => ts > now - OTP_SEND_WINDOW_MS);
      if (alive.length === 0) {
        attemptStore.delete(k);
      }
    }
  }

  return false;
}

function getServerSupabaseConfig(): {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
} | null {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!url || !anonKey || !serviceRoleKey) {
    return null;
  }

  return { url, anonKey, serviceRoleKey };
}

function getServerAnonConfig(): {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
} | null {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim() || undefined;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey, serviceRoleKey };
}

function createServerAnonClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function createServerAdminClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function escapeIlikePattern(input: string): string {
  return input.replace(/[\\%_]/g, (ch) => `\\${ch}`);
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

export function extractClientIp(headers: Record<string, string | string[] | undefined>): string {
  const getHeader = (name: string): string => {
    const val = headers[name] ?? headers[name.toLowerCase()];
    if (Array.isArray(val)) return val[0] ?? '';
    return typeof val === 'string' ? val : '';
  };

  const nfIp = getHeader('x-nf-client-connection-ip').trim();
  if (nfIp) return nfIp;

  const forwarded = getHeader('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  return 'unknown';
}

export async function handleUsernameLogin(params: {
  rawBody: string;
  clientIp: string;
}): Promise<AuthCoreResponse> {
  const { rawBody, clientIp } = params;

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_LOGIN_BODY_BYTES) {
    return {
      status: 413,
      body: { success: false, message: '요청 데이터 크기가 허용 범위를 초과했습니다.' },
    };
  }

  let parsed: { username?: unknown; password?: unknown };
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as { username?: unknown; password?: unknown }) : {};
  } catch {
    return {
      status: 400,
      body: { success: false, message: '잘못된 요청 형식입니다.' },
    };
  }

  if (typeof parsed.username !== 'string' || typeof parsed.password !== 'string') {
    return {
      status: 400,
      body: { success: false, message: '아이디와 비밀번호를 모두 입력해 주세요.' },
    };
  }

  const cleanUsername = parsed.username.trim();
  const password = parsed.password;

  if (!cleanUsername || !password) {
    return {
      status: 400,
      body: { success: false, message: '아이디와 비밀번호를 모두 입력해 주세요.' },
    };
  }

  if (cleanUsername.length > 64 || password.length > 128) {
    return {
      status: 400,
      body: { success: false, message: '입력 길이가 올바르지 않습니다.' },
    };
  }

  // Apply best-effort rate limiting per IP and per username
  if (
    isRateLimited(`ip:${clientIp}`, MAX_ATTEMPTS_PER_IP) ||
    isRateLimited(`user:${cleanUsername.toLowerCase()}`, MAX_ATTEMPTS_PER_USERNAME)
  ) {
    return {
      status: 429,
      body: {
        success: false,
        message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }

  const config = getServerSupabaseConfig();
  if (!config) {
    return {
      status: 503,
      body: {
        success: false,
        code: 'SERVER_CONFIG_MISSING',
        message: '서버 인증 환경변수(SUPABASE_SERVICE_ROLE_KEY 등)가 설정되지 않았습니다.',
      },
    };
  }

  const supabaseAdmin = createServerAdminClient(config.url, config.serviceRoleKey);
  const supabaseAnon = createServerAnonClient(config.url, config.anonKey);

  try {
    // Minimal server-only lookup: find profile by exact username (wildcard-escaped)
    const escapedPattern = escapeIlikePattern(cleanUsername);
    const { data: candidates, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .ilike('username', escapedPattern)
      .limit(5);

    if (profileError) {
      return {
        status: 500,
        body: { success: false, message: '로그인 처리 중 일시적인 오류가 발생했습니다.' },
      };
    }

    const matchedProfile = Array.isArray(candidates)
      ? candidates.find(
          (row) =>
            typeof row.username === 'string' &&
            row.username.toLowerCase() === cleanUsername.toLowerCase()
        )
      : undefined;

    if (!matchedProfile) {
      // Do not distinguish nonexistent username from wrong password
      return {
        status: 401,
        body: { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' },
      };
    }

    let targetEmail =
      typeof matchedProfile.email === 'string' && matchedProfile.email.trim()
        ? matchedProfile.email.trim()
        : '';

    if (!targetEmail && matchedProfile.id) {
      const { data: authUserRes, error: authUserErr } = await supabaseAdmin.auth.admin.getUserById(
        String(matchedProfile.id)
      );
      if (!authUserErr && authUserRes?.user?.email) {
        targetEmail = authUserRes.user.email.trim();
      }
    }

    if (!targetEmail) {
      return {
        status: 401,
        body: { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' },
      };
    }

    // Delegate password verification exclusively to Supabase Auth
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: targetEmail,
      password,
    });

    if (authError || !authData.session || !authData.user) {
      const msg = (authError?.message || '').toLowerCase();
      if (msg.includes('email not confirmed')) {
        return {
          status: 403,
          body: {
            success: false,
            message: '이메일 인증이 아직 완료되지 않았습니다. 메일함의 인증번호 확인을 완료해 주세요.',
          },
        };
      }
      if (msg.includes('rate limit') || msg.includes('too many') || authError?.status === 429) {
        return {
          status: 429,
          body: {
            success: false,
            message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
          },
        };
      }

      return {
        status: 401,
        body: { success: false, message: '아이디 또는 비밀번호가 일치하지 않습니다.' },
      };
    }

    // Check suspended status only AFTER password verification succeeds
    if (normalizeStatus(matchedProfile.status) === 'suspended') {
      return {
        status: 403,
        body: {
          success: false,
          message: '관리자에 의해 이용이 정지된 계정입니다. 운영팀에 문의해 주세요.',
        },
      };
    }

    // Return only required session tokens (no other user's email, no password)
    return {
      status: 200,
      body: {
        success: true,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
        },
      },
    };
  } catch {
    return {
      status: 500,
      body: { success: false, message: '로그인 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
    };
  }
}

async function authenticateAdminRequest(authHeader: string | undefined): Promise<
  | { ok: true; adminClient: SupabaseClient; userId: string }
  | { ok: false; response: AuthCoreResponse }
> {
  const config = getServerSupabaseConfig();
  if (!config) {
    return {
      ok: false,
      response: {
        status: 503,
        body: {
          success: false,
          code: 'SERVER_CONFIG_MISSING',
          message: '서버 인증 환경변수가 설정되지 않았습니다.',
        },
      },
    };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      ok: false,
      response: {
        status: 401,
        body: { success: false, message: '인증 토큰이 필요합니다.' },
      },
    };
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return {
      ok: false,
      response: {
        status: 401,
        body: { success: false, message: '유효하지 않은 인증 토큰입니다.' },
      },
    };
  }

  const supabaseAnon = createServerAnonClient(config.url, config.anonKey);
  const supabaseAdmin = createServerAdminClient(config.url, config.serviceRoleKey);

  try {
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError || !userData.user) {
      return {
        ok: false,
        response: {
          status: 401,
          body: { success: false, message: '세션이 만료되었거나 유효하지 않습니다.' },
        },
      };
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile) {
      return {
        ok: false,
        response: {
          status: 403,
          body: { success: false, message: '관리자 프로필을 확인할 수 없습니다.' },
        },
      };
    }

    if (normalizeStatus(profile.status) === 'suspended') {
      return {
        ok: false,
        response: {
          status: 403,
          body: { success: false, message: '이용이 정지된 계정입니다.' },
        },
      };
    }

    if (normalizeRole(profile.role) !== 'admin') {
      return {
        ok: false,
        response: {
          status: 403,
          body: { success: false, message: '관리자 권한이 없습니다.' },
        },
      };
    }

    return { ok: true, adminClient: supabaseAdmin, userId: userData.user.id };
  } catch {
    return {
      ok: false,
      response: {
        status: 500,
        body: { success: false, message: '관리자 권한 검증 중 오류가 발생했습니다.' },
      },
    };
  }
}

export async function handleAdminVerify(authHeader: string | undefined): Promise<AuthCoreResponse> {
  const auth = await authenticateAdminRequest(authHeader);
  if (!auth.ok) return auth.response;

  return {
    status: 200,
    body: {
      success: true,
      authorized: true,
      userId: auth.userId,
      role: 'admin',
    },
  };
}

export async function handleAdminGetMembers(authHeader: string | undefined): Promise<AuthCoreResponse> {
  const auth = await authenticateAdminRequest(authHeader);
  if (!auth.ok) return auth.response;

  try {
    const { data, error } = await auth.adminClient
      .from('profiles')
      .select('*');

    if (error || !Array.isArray(data)) {
      return {
        status: 500,
        body: { success: false, message: '회원 목록 조회 중 오류가 발생했습니다.' },
      };
    }

    const needsAuthFallback = data.some(
      (row) => typeof row.email !== 'string' || !row.email.trim() || !row.created_at
    );

    const authUserMap = new Map<string, { email: string; created_at?: string }>();
    if (needsAuthFallback) {
      try {
        const { data: listed } = await auth.adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });
        if (listed?.users) {
          for (const u of listed.users) {
            authUserMap.set(u.id, {
              email: u.email ?? '',
              created_at: u.created_at,
            });
          }
        }
      } catch {
        // Ignore fallback failure and rely on profile fields
      }
    }

    const sortedRows = [...data].sort((a, b) => {
      const aTime =
        typeof a.created_at === 'string'
          ? Date.parse(a.created_at)
          : Date.parse(authUserMap.get(String(a.id))?.created_at || '');
      const bTime =
        typeof b.created_at === 'string'
          ? Date.parse(b.created_at)
          : Date.parse(authUserMap.get(String(b.id))?.created_at || '');
      const safeA = Number.isNaN(aTime) ? 0 : aTime;
      const safeB = Number.isNaN(bTime) ? 0 : bTime;
      return safeB - safeA;
    });

    const members: AdminUserProfile[] = sortedRows.map((row) => {
      const id = String(row.id);
      const authFallback = authUserMap.get(id);
      const email =
        typeof row.email === 'string' && row.email.trim()
          ? row.email.trim()
          : authFallback?.email || '';
      const rawCreatedAt = row.created_at ?? authFallback?.created_at;

      return {
        id,
        username: typeof row.username === 'string' ? row.username : '',
        name: typeof row.name === 'string' ? row.name : '',
        email,
        phone: typeof row.phone === 'string' ? row.phone : '',
        gender: typeof row.gender === 'string' ? row.gender : '기타',
        birthDate:
          typeof row.birth_date === 'string' && row.birth_date.trim()
            ? row.birth_date.trim().slice(0, 10)
            : null,
        role: normalizeRole(row.role),
        status: normalizeStatus(row.status),
        createdAt: formatCreatedAt(rawCreatedAt),
      };
    });

    return {
      status: 200,
      body: {
        success: true,
        members,
      },
    };
  } catch {
    return {
      status: 500,
      body: { success: false, message: '회원 목록을 불러오는 중 오류가 발생했습니다.' },
    };
  }
}

// =========================================================================
// FIND ID & RESET PASSWORD OTP HANDLERS
// =========================================================================

function getCooldownSecret(): string | null {
  const raw = (process.env.OTP_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return raw || null;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = val;
  }
  return out;
}

function signCooldownPayload(payloadB64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

function hashCooldownTarget(purpose: string, email: string): string {
  return crypto
    .createHash('sha256')
    .update(`${purpose}:${email.toLowerCase()}`)
    .digest('hex')
    .slice(0, 16);
}

const otpCooldownStore = new Map<string, number>();

function readInMemoryCooldownRemainingSeconds(purpose: string, email: string): number {
  const key = `${purpose}:${email.toLowerCase()}`;
  const exp = otpCooldownStore.get(key);
  if (!exp) return 0;
  const remaining = Math.ceil((exp - Date.now()) / 1000);
  if (remaining <= 0) {
    otpCooldownStore.delete(key);
    return 0;
  }
  return remaining;
}

function recordInMemoryCooldown(purpose: string, email: string): void {
  const now = Date.now();
  otpCooldownStore.set(`${purpose}:${email.toLowerCase()}`, now + OTP_RESEND_COOLDOWN_SECONDS * 1000);
  if (otpCooldownStore.size > 2000) {
    for (const [k, exp] of otpCooldownStore.entries()) {
      if (exp <= now) {
        otpCooldownStore.delete(k);
      }
    }
  }
}

function readCooldownRemainingSeconds(
  cookieHeader: string | undefined,
  purpose: string,
  email: string
): number {
  const secret = getCooldownSecret();
  if (!secret || !cookieHeader) return 0;

  const cookies = parseCookies(cookieHeader);
  const rawToken = cookies[OTP_COOLDOWN_COOKIE_NAME];
  if (!rawToken) return 0;

  const parts = rawToken.split('.');
  if (parts.length !== 2) return 0;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return 0;

  const expectedSig = signCooldownPayload(payloadB64, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return 0;
    }
    const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      t?: string;
      exp?: number;
    };
    if (
      decoded.t !== hashCooldownTarget(purpose, email) ||
      typeof decoded.exp !== 'number'
    ) {
      return 0;
    }
    const remaining = Math.ceil((decoded.exp - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

function buildCooldownSetCookieHeader(
  purpose: string,
  email: string,
  isHttps: boolean
): string | null {
  const secret = getCooldownSecret();
  if (!secret) return null;

  const exp = Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000;
  const payloadB64 = Buffer.from(
    JSON.stringify({
      t: hashCooldownTarget(purpose, email),
      exp,
    }),
    'utf8'
  ).toString('base64url');
  const sig = signCooldownPayload(payloadB64, secret);
  const secureFlag = isHttps ? '; Secure' : '';
  return `${OTP_COOLDOWN_COOKIE_NAME}=${payloadB64}.${sig}; Path=/api; Max-Age=${OTP_RESEND_COOLDOWN_SECONDS}; HttpOnly; SameSite=Lax${secureFlag}`;
}

function isValidEmailFormat(email: string): boolean {
  return email.length > 3 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isSupabaseRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const errObj = error as { status?: number; message?: string; code?: string };
  if (errObj.status === 429) return true;
  const raw = `${errObj.code ?? ''} ${errObj.message ?? ''}`.toLowerCase();
  return (
    raw.includes('over_email_send_rate_limit') ||
    raw.includes('rate limit') ||
    raw.includes('too many') ||
    raw.includes('for security purposes')
  );
}

export async function handleFindIdSendOtp(params: {
  rawBody: string;
  clientIp: string;
  cookieHeader?: string;
  isHttps?: boolean;
}): Promise<AuthCoreResponse> {
  const { rawBody, clientIp, cookieHeader, isHttps = false } = params;

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_LOGIN_BODY_BYTES) {
    return {
      status: 413,
      body: { success: false, message: '요청 데이터 크기가 허용 범위를 초과했습니다.' },
    };
  }

  let parsed: { email?: unknown };
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as { email?: unknown }) : {};
  } catch {
    return {
      status: 400,
      body: { success: false, message: '잘못된 요청 형식입니다.' },
    };
  }

  const cleanEmail = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
  if (!isValidEmailFormat(cleanEmail)) {
    return {
      status: 400,
      body: { success: false, message: '올바른 이메일 주소를 입력해 주세요.' },
    };
  }

  const cooldownRemaining = Math.max(
    readCooldownRemainingSeconds(cookieHeader, 'find_id', cleanEmail),
    readInMemoryCooldownRemainingSeconds('find_id', cleanEmail)
  );
  if (cooldownRemaining > 0) {
    return {
      status: 429,
      headers: { 'Retry-After': String(cooldownRemaining) },
      body: {
        success: false,
        retryAfterSeconds: cooldownRemaining,
        message: `보안상 이메일 발송은 ${cooldownRemaining}초 후에 다시 요청할 수 있습니다.`,
      },
    };
  }

  if (
    isRateLimited(`find_id_send:ip:${clientIp}`, MAX_OTP_SEND_PER_IP, OTP_SEND_WINDOW_MS) ||
    isRateLimited(`find_id_send:email:${cleanEmail}`, MAX_OTP_SEND_PER_EMAIL, OTP_SEND_WINDOW_MS)
  ) {
    return {
      status: 429,
      headers: { 'Retry-After': String(OTP_RESEND_COOLDOWN_SECONDS) },
      body: {
        success: false,
        retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        message: '인증번호 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }

  const config = getServerAnonConfig();
  if (!config) {
    return {
      status: 503,
      body: {
        success: false,
        code: 'SERVER_CONFIG_MISSING',
        message: '서버 Supabase 환경변수가 설정되지 않았습니다.',
      },
    };
  }

  const supabaseAnon = createServerAnonClient(config.url, config.anonKey);

  try {
    const { error } = await supabaseAnon.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error && isSupabaseRateLimitError(error)) {
      return {
        status: 429,
        headers: { 'Retry-After': String(OTP_RESEND_COOLDOWN_SECONDS) },
        body: {
          success: false,
          retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
          message: '요청 횟수 제한에 도달했습니다. 약 1분 후 다시 시도해 주세요.',
        },
      };
    }

    // Anti-enumeration: always return neutral success response whether email exists or not
    recordInMemoryCooldown('find_id', cleanEmail);
    const setCookie = buildCooldownSetCookieHeader('find_id', cleanEmail, isHttps);
    return {
      status: 200,
      headers: setCookie ? { 'Set-Cookie': setCookie } : undefined,
      body: {
        success: true,
        cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        expirySeconds: OTP_EXPIRY_SECONDS,
        message:
          '입력하신 이메일이 가입된 계정이라면 6자리 본인확인 인증번호가 발송되었습니다. 메일함(또는 스팸함)을 확인해 주세요.',
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        success: false,
        message: '인증번호 발송 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }
}

export async function handleFindIdVerifyOtp(params: {
  rawBody: string;
  clientIp: string;
}): Promise<AuthCoreResponse> {
  const { rawBody, clientIp } = params;

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_LOGIN_BODY_BYTES) {
    return {
      status: 413,
      body: { success: false, message: '요청 데이터 크기가 허용 범위를 초과했습니다.' },
    };
  }

  let parsed: { email?: unknown; token?: unknown };
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as { email?: unknown; token?: unknown }) : {};
  } catch {
    return {
      status: 400,
      body: { success: false, message: '잘못된 요청 형식입니다.' },
    };
  }

  const cleanEmail = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
  const cleanToken = typeof parsed.token === 'string' ? parsed.token.trim() : '';

  if (!isValidEmailFormat(cleanEmail)) {
    return {
      status: 400,
      body: { success: false, message: '올바른 이메일 주소를 입력해 주세요.' },
    };
  }

  if (!/^\d{6}$/.test(cleanToken)) {
    return {
      status: 400,
      body: { success: false, message: '이메일로 받은 6자리 숫자 인증번호를 입력해 주세요.' },
    };
  }

  if (
    isRateLimited(`find_id_verify:ip:${clientIp}`, MAX_OTP_VERIFY_PER_IP, OTP_VERIFY_WINDOW_MS) ||
    isRateLimited(`find_id_verify:email:${cleanEmail}`, MAX_OTP_VERIFY_PER_EMAIL, OTP_VERIFY_WINDOW_MS)
  ) {
    return {
      status: 429,
      headers: { 'Retry-After': '60' },
      body: {
        success: false,
        message: '인증 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }

  const config = getServerAnonConfig();
  if (!config) {
    return {
      status: 503,
      body: {
        success: false,
        code: 'SERVER_CONFIG_MISSING',
        message: '서버 Supabase 환경변수가 설정되지 않았습니다.',
      },
    };
  }

  const supabaseAnon = createServerAnonClient(config.url, config.anonKey);

  try {
    const { data, error } = await supabaseAnon.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    if (error) {
      if (isSupabaseRateLimitError(error)) {
        return {
          status: 429,
          headers: { 'Retry-After': '60' },
          body: {
            success: false,
            message: '인증 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
          },
        };
      }
      return {
        status: 401,
        body: {
          success: false,
          message: '인증번호가 일치하지 않거나 만료되었습니다. 메일의 6자리 숫자를 다시 확인해 주세요.',
        },
      };
    }

    if (!data.user?.id) {
      return {
        status: 401,
        body: {
          success: false,
          message: '인증번호 확인에 실패했습니다. 다시 시도해 주세요.',
        },
      };
    }

    const verifiedUserId = data.user.id;
    const authCreatedAt = data.user.created_at;

    // Look up username strictly by verified Supabase Auth user ID
    let profile: Record<string, unknown> | null = null;
    if (config.serviceRoleKey) {
      const supabaseAdmin = createServerAdminClient(config.url, config.serviceRoleKey);
      const { data: adminProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', verifiedUserId)
        .single();
      if (adminProfile) {
        profile = adminProfile as Record<string, unknown>;
      }
    } else if (data.session?.access_token) {
      // Fallback for local dev without service role key: query own profile under verified user JWT
      const { data: ownProfile } = await supabaseAnon
        .from('profiles')
        .select('*')
        .eq('id', verifiedUserId)
        .single();
      if (ownProfile) {
        profile = ownProfile as Record<string, unknown>;
      }
    }

    // Immediately terminate the temporary server-side verification session
    try {
      await supabaseAnon.auth.signOut({ scope: 'local' });
    } catch {
      // Ignore cleanup errors
    }

    const username =
      profile && typeof profile.username === 'string' ? profile.username.trim() : '';

    if (!username) {
      return {
        status: 404,
        body: {
          success: false,
          message: '본인인증은 완료되었으나 연결된 아이디 정보를 찾을 수 없습니다. 운영팀에 문의해 주세요.',
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        username,
        name: profile && typeof profile.name === 'string' ? profile.name : '',
        createdAt: formatCreatedAt(profile?.created_at ?? authCreatedAt),
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        success: false,
        message: '인증번호 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }
}

export async function handleResetPasswordSendOtp(params: {
  rawBody: string;
  clientIp: string;
  cookieHeader?: string;
  isHttps?: boolean;
}): Promise<AuthCoreResponse> {
  const { rawBody, clientIp, cookieHeader, isHttps = false } = params;

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_LOGIN_BODY_BYTES) {
    return {
      status: 413,
      body: { success: false, message: '요청 데이터 크기가 허용 범위를 초과했습니다.' },
    };
  }

  let parsed: { email?: unknown };
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as { email?: unknown }) : {};
  } catch {
    return {
      status: 400,
      body: { success: false, message: '잘못된 요청 형식입니다.' },
    };
  }

  const cleanEmail = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
  if (!isValidEmailFormat(cleanEmail)) {
    return {
      status: 400,
      body: { success: false, message: '올바른 이메일 주소를 입력해 주세요.' },
    };
  }

  const cooldownRemaining = Math.max(
    readCooldownRemainingSeconds(cookieHeader, 'reset_pw', cleanEmail),
    readInMemoryCooldownRemainingSeconds('reset_pw', cleanEmail)
  );
  if (cooldownRemaining > 0) {
    return {
      status: 429,
      headers: { 'Retry-After': String(cooldownRemaining) },
      body: {
        success: false,
        retryAfterSeconds: cooldownRemaining,
        message: `보안상 이메일 발송은 ${cooldownRemaining}초 후에 다시 요청할 수 있습니다.`,
      },
    };
  }

  if (
    isRateLimited(`reset_pw_send:ip:${clientIp}`, MAX_OTP_SEND_PER_IP, OTP_SEND_WINDOW_MS) ||
    isRateLimited(`reset_pw_send:email:${cleanEmail}`, MAX_OTP_SEND_PER_EMAIL, OTP_SEND_WINDOW_MS)
  ) {
    return {
      status: 429,
      headers: { 'Retry-After': String(OTP_RESEND_COOLDOWN_SECONDS) },
      body: {
        success: false,
        retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        message: '비밀번호 재설정 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }

  const config = getServerAnonConfig();
  if (!config) {
    return {
      status: 503,
      body: {
        success: false,
        code: 'SERVER_CONFIG_MISSING',
        message: '서버 Supabase 환경변수가 설정되지 않았습니다.',
      },
    };
  }

  const supabaseAnon = createServerAnonClient(config.url, config.anonKey);

  try {
    const { error } = await supabaseAnon.auth.resetPasswordForEmail(cleanEmail);

    if (error && isSupabaseRateLimitError(error)) {
      return {
        status: 429,
        headers: { 'Retry-After': String(OTP_RESEND_COOLDOWN_SECONDS) },
        body: {
          success: false,
          retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
          message: '요청 횟수 제한에 도달했습니다. 약 1분 후 다시 시도해 주세요.',
        },
      };
    }

    // Anti-enumeration: identical neutral response whether email exists or not
    recordInMemoryCooldown('reset_pw', cleanEmail);
    const setCookie = buildCooldownSetCookieHeader('reset_pw', cleanEmail, isHttps);
    return {
      status: 200,
      headers: setCookie ? { 'Set-Cookie': setCookie } : undefined,
      body: {
        success: true,
        cooldownSeconds: OTP_RESEND_COOLDOWN_SECONDS,
        expirySeconds: OTP_EXPIRY_SECONDS,
        message:
          '입력하신 이메일이 가입된 계정이라면 비밀번호 재설정 6자리 인증번호가 발송되었습니다. 메일함(또는 스팸함)을 확인해 주세요.',
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        success: false,
        message: '비밀번호 재설정 메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }
}

export async function handleResetPasswordVerifyOtp(params: {
  rawBody: string;
  clientIp: string;
}): Promise<AuthCoreResponse> {
  const { rawBody, clientIp } = params;

  if (Buffer.byteLength(rawBody, 'utf8') > MAX_LOGIN_BODY_BYTES) {
    return {
      status: 413,
      body: { success: false, message: '요청 데이터 크기가 허용 범위를 초과했습니다.' },
    };
  }

  let parsed: { email?: unknown; token?: unknown };
  try {
    parsed = rawBody ? (JSON.parse(rawBody) as { email?: unknown; token?: unknown }) : {};
  } catch {
    return {
      status: 400,
      body: { success: false, message: '잘못된 요청 형식입니다.' },
    };
  }

  const cleanEmail = typeof parsed.email === 'string' ? parsed.email.trim().toLowerCase() : '';
  const cleanToken = typeof parsed.token === 'string' ? parsed.token.trim() : '';

  if (!isValidEmailFormat(cleanEmail)) {
    return {
      status: 400,
      body: { success: false, message: '올바른 이메일 주소를 입력해 주세요.' },
    };
  }

  if (!/^\d{6}$/.test(cleanToken)) {
    return {
      status: 400,
      body: { success: false, message: '이메일로 받은 6자리 숫자 인증번호를 입력해 주세요.' },
    };
  }

  if (
    isRateLimited(`reset_pw_verify:ip:${clientIp}`, MAX_OTP_VERIFY_PER_IP, OTP_VERIFY_WINDOW_MS) ||
    isRateLimited(`reset_pw_verify:email:${cleanEmail}`, MAX_OTP_VERIFY_PER_EMAIL, OTP_VERIFY_WINDOW_MS)
  ) {
    return {
      status: 429,
      headers: { 'Retry-After': '60' },
      body: {
        success: false,
        message: '인증 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }

  const config = getServerAnonConfig();
  if (!config) {
    return {
      status: 503,
      body: {
        success: false,
        code: 'SERVER_CONFIG_MISSING',
        message: '서버 Supabase 환경변수가 설정되지 않았습니다.',
      },
    };
  }

  const supabaseAnon = createServerAnonClient(config.url, config.anonKey);

  try {
    const { data, error } = await supabaseAnon.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'recovery',
    });

    if (error) {
      if (isSupabaseRateLimitError(error)) {
        return {
          status: 429,
          headers: { 'Retry-After': '60' },
          body: {
            success: false,
            message: '인증 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
          },
        };
      }
      return {
        status: 401,
        body: {
          success: false,
          message: '인증번호가 일치하지 않거나 만료되었습니다. 메일의 6자리 숫자를 다시 확인해 주세요.',
        },
      };
    }

    if (!data.session?.access_token || !data.session?.refresh_token || !data.user?.id) {
      return {
        status: 401,
        body: {
          success: false,
          message: '비밀번호 재설정 본인인증에 실패했습니다. 다시 시도해 주세요.',
        },
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        recoverySession: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
      },
    };
  } catch {
    return {
      status: 500,
      body: {
        success: false,
        message: '비밀번호 재설정 인증 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
    };
  }
}

