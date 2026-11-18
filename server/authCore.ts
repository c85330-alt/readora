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
  role: 'admin' | 'host' | 'user';
  status: 'active' | 'suspended';
  createdAt: string;
}

const MAX_LOGIN_BODY_BYTES = 4096;
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS_PER_IP = 20;
const MAX_ATTEMPTS_PER_USERNAME = 10;

// Best-effort in-memory rate limit store.
// Note: In serverless environments (Netlify Functions), memory is per warm instance and
// is complemented by Supabase Auth's built-in server-side rate limiting.
const attemptStore = new Map<string, number[]>();

function isRateLimited(key: string, maxAttempts: number): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (attemptStore.get(key) ?? []).filter((ts) => ts > windowStart);

  if (recent.length >= maxAttempts) {
    attemptStore.set(key, recent);
    return true;
  }

  recent.push(now);
  attemptStore.set(key, recent);
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
