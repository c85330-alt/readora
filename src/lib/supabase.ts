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

export const supabase: SupabaseClient | null = envStatus.isConfigured
  ? createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
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
