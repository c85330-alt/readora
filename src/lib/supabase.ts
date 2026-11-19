import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const rawSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export interface SupabaseEnvValidation {
  isConfigured: boolean;
  missingVars: string[];
  invalidVars: string[];
  errorMessage: string | null;
}

const isPlaceholderValue = (value: string): boolean => {
  const lower = value.toLowerCase();
  return (
    !value ||
    lower.includes('your_supabase') ||
    lower.includes('your-project') ||
    lower.includes('my_supabase')
  );
};

const isValidHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export function validateSupabaseEnv(): SupabaseEnvValidation {
  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  if (!rawSupabaseUrl || isPlaceholderValue(rawSupabaseUrl)) {
    missingVars.push('VITE_SUPABASE_URL');
  } else if (!isValidHttpUrl(rawSupabaseUrl)) {
    invalidVars.push('VITE_SUPABASE_URL (올바른 http/https URL 형식이 아닙니다)');
  }

  if (!rawSupabaseAnonKey || isPlaceholderValue(rawSupabaseAnonKey)) {
    missingVars.push('VITE_SUPABASE_ANON_KEY');
  }

  if (missingVars.length === 0 && invalidVars.length === 0) {
    return {
      isConfigured: true,
      missingVars: [],
      invalidVars: [],
      errorMessage: null,
    };
  }

  const reasons: string[] = [];
  if (missingVars.length > 0) {
    reasons.push(`누락된 환경변수: ${missingVars.join(', ')}`);
  }
  if (invalidVars.length > 0) {
    reasons.push(`형식 오류: ${invalidVars.join(', ')}`);
  }

  const errorMessage =
    `[Supabase 설정 오류] ${reasons.join(' / ')}. ` +
    `.env 파일 또는 배포 플랫폼(Netlify) 환경변수 설정에서 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 확인해 주세요.`;

  return {
    isConfigured: false,
    missingVars,
    invalidVars,
    errorMessage,
  };
}

const envStatus = validateSupabaseEnv();

export const isSupabaseConfigured = envStatus.isConfigured;
export const supabaseConfigError = envStatus.errorMessage;

if (!envStatus.isConfigured && envStatus.errorMessage) {
  console.error(envStatus.errorMessage);
}

export type AuthPersistenceMode = 'local' | 'session';

const PERSISTENCE_PREF_KEY = 'readora_auth_persist_mode';

function isSupabaseAuthTokenKey(key: string): boolean {
  return key.startsWith('sb-') && key.includes('-auth-token');
}

function safeStorageGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore storage quota/privacy mode errors
  }
}

function safeStorageRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

function clearSupabaseTokensFromStorage(storage: Storage): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (k && isSupabaseAuthTokenKey(k)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => safeStorageRemove(storage, k));
  } catch {
    // Ignore storage iteration errors
  }
}

function hasSupabaseTokenInStorage(storage: Storage): boolean {
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (k && isSupabaseAuthTokenKey(k) && safeStorageGet(storage, k)) {
        return true;
      }
    }
  } catch {
    // Ignore
  }
  return false;
}

export function getAuthPersistenceMode(): AuthPersistenceMode {
  if (typeof window === 'undefined') return 'session';

  const sessionPref = safeStorageGet(window.sessionStorage, PERSISTENCE_PREF_KEY);
  if (sessionPref === 'session') return 'session';

  const localPref = safeStorageGet(window.localStorage, PERSISTENCE_PREF_KEY);
  if (localPref === 'local') return 'local';

  // Compatibility: preserve pre-existing sessions stored in localStorage before this update
  if (hasSupabaseTokenInStorage(window.localStorage)) {
    return 'local';
  }

  return 'session';
}

export function setAuthPersistenceMode(mode: AuthPersistenceMode): void {
  if (typeof window === 'undefined') return;

  if (mode === 'local') {
    safeStorageSet(window.localStorage, PERSISTENCE_PREF_KEY, 'local');
    safeStorageRemove(window.sessionStorage, PERSISTENCE_PREF_KEY);
    clearSupabaseTokensFromStorage(window.sessionStorage);
  } else {
    safeStorageSet(window.sessionStorage, PERSISTENCE_PREF_KEY, 'session');
    safeStorageRemove(window.localStorage, PERSISTENCE_PREF_KEY);
    clearSupabaseTokensFromStorage(window.localStorage);
  }
}

export function clearAuthSessionStorage(): void {
  if (typeof window === 'undefined') return;

  safeStorageRemove(window.localStorage, PERSISTENCE_PREF_KEY);
  safeStorageRemove(window.sessionStorage, PERSISTENCE_PREF_KEY);
  clearSupabaseTokensFromStorage(window.localStorage);
  clearSupabaseTokensFromStorage(window.sessionStorage);
}

const readoraAuthStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    const mode = getAuthPersistenceMode();
    if (mode === 'local') {
      return (
        safeStorageGet(window.localStorage, key) ??
        safeStorageGet(window.sessionStorage, key)
      );
    }
    return safeStorageGet(window.sessionStorage, key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    const mode = getAuthPersistenceMode();
    if (mode === 'local') {
      safeStorageSet(window.localStorage, key, value);
    } else {
      safeStorageSet(window.sessionStorage, key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    safeStorageRemove(window.localStorage, key);
    safeStorageRemove(window.sessionStorage, key);
  },
};

export const supabase: SupabaseClient | null = envStatus.isConfigured
  ? createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: readoraAuthStorage,
      },
    })
  : null;

/**
 * Supabase 클라이언트를 반환합니다.
 * 환경변수가 누락되었거나 잘못 설정된 경우 원인 파악이 가능한 명확한 오류를 발생시킵니다.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      supabaseConfigError ??
        '[Supabase 설정 오류] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.'
    );
  }
  return supabase;
}

/**
 * 비밀번호 재설정 등 임시 복구 세션 전용 비영속성 클라이언트.
 * 브라우저 storage 및 메인 로그인 세션을 절대 덮어쓰지 않습니다.
 */
export function createEphemeralSupabaseClient(): SupabaseClient {
  if (!envStatus.isConfigured) {
    throw new Error(
      supabaseConfigError ??
        '[Supabase 설정 오류] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.'
    );
  }

  const memoryStore = new Map<string, string>();
  return createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `readora-ephemeral-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      storage: {
        getItem: (key: string) => memoryStore.get(key) ?? null,
        setItem: (key: string, value: string) => {
          memoryStore.set(key, value);
        },
        removeItem: (key: string) => {
          memoryStore.delete(key);
        },
      },
    },
  });
}
