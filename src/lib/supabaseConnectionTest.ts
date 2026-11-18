import { supabase, isSupabaseConfigured, supabaseConfigError } from './supabase';

export type SupabaseConnectionCategory =
  | 'config_error'
  | 'connection_error'
  | 'rls_restricted'
  | 'connected_with_data';

export interface SupabaseConnectionTestResult {
  category: SupabaseConnectionCategory;
  connected: boolean;
  isAuthenticated: boolean;
  httpStatus: number | null;
  errorCode: string | null;
  rowCount: number;
  message: string;
  rawError?: string;
}

/**
 * 개발용 Supabase 연결 상태 테스트 함수
 * - profiles 테이블에 읽기(SELECT) 요청을 보내 연결 상태와 RLS 권한 제한을 구분해 판별합니다.
 * - 기존 회원가입/로그인 상태나 localStorage 데이터는 변경하지 않습니다.
 */
export async function testSupabaseConnection(): Promise<SupabaseConnectionTestResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      category: 'config_error',
      connected: false,
      isAuthenticated: false,
      httpStatus: null,
      errorCode: 'ENV_MISSING',
      rowCount: 0,
      message:
        supabaseConfigError ??
        '[설정 오류] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.',
    };
  }

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      return {
        category: 'connection_error',
        connected: false,
        isAuthenticated: false,
        httpStatus: sessionError.status ?? null,
        errorCode: sessionError.code ?? 'AUTH_SESSION_ERROR',
        rowCount: 0,
        message: `[연결 오류] Supabase Auth 세션 확인 실패: ${sessionError.message}`,
        rawError: sessionError.message,
      };
    }

    const isAuthenticated = Boolean(sessionData.session);

    const { data, error, status } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      const code = error.code ?? null;
      const msgLower = (error.message ?? '').toLowerCase();

      // PostgreSQL 42501: insufficient_privilege / RLS policy block
      const isRlsPermissionError =
        code === '42501' ||
        status === 403 ||
        msgLower.includes('row-level security') ||
        msgLower.includes('permission denied');

      if (isRlsPermissionError) {
        return {
          category: 'rls_restricted',
          connected: true,
          isAuthenticated,
          httpStatus: status ?? 403,
          errorCode: code,
          rowCount: 0,
          message:
            '[연결 정상 · RLS 권한 제한] Supabase 서버 및 profiles 테이블 연결은 정상이나, 현재 비로그인(anon) 상태로 인해 RLS 정책에 의해 조회가 제한되었습니다.',
          rawError: error.message,
        };
      }

      // Connection, key, or schema/table errors (e.g., 401 invalid API key, PGRST205/42P01 missing table)
      return {
        category: 'connection_error',
        connected: false,
        isAuthenticated,
        httpStatus: status ?? null,
        errorCode: code,
        rowCount: 0,
        message: `[연결/조회 오류] Supabase 요청 실패 (HTTP ${status ?? 'N/A'}, 코드: ${code ?? 'UNKNOWN'}): ${error.message}`,
        rawError: error.message,
      };
    }

    const rowCount = Array.isArray(data) ? data.length : 0;

    if (rowCount === 0 && !isAuthenticated) {
      return {
        category: 'rls_restricted',
        connected: true,
        isAuthenticated: false,
        httpStatus: status ?? 200,
        errorCode: null,
        rowCount: 0,
        message:
          '[연결 정상 · RLS 필터링] Supabase 연결 및 profiles 테이블 요청(HTTP 200)이 정상 처리되었습니다. 비로그인 상태에서 RLS가 활성화되어 0건이 반환된 정상 동작입니다.',
      };
    }

    return {
      category: 'connected_with_data',
      connected: true,
      isAuthenticated,
      httpStatus: status ?? 200,
      errorCode: null,
      rowCount,
      message: `[연결 정상] Supabase profiles 테이블 조회 성공 (${rowCount}건 반환, HTTP ${status ?? 200}).`,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      category: 'connection_error',
      connected: false,
      isAuthenticated: false,
      httpStatus: null,
      errorCode: 'NETWORK_ERROR',
      rowCount: 0,
      message: `[네트워크/연결 오류] Supabase 서버에 연결할 수 없습니다: ${errorMessage}`,
      rawError: errorMessage,
    };
  }
}

declare global {
  interface Window {
    testSupabaseConnection?: () => Promise<SupabaseConnectionTestResult>;
  }
}

export function runDevSupabaseConnectionCheck(): void {
  if (!import.meta.env.DEV) return;

  if (typeof window !== 'undefined') {
    window.testSupabaseConnection = testSupabaseConnection;
  }

  void testSupabaseConnection().then((result) => {
    if (result.connected) {
      console.info('[DEV][Supabase]', result.message, {
        category: result.category,
        httpStatus: result.httpStatus,
        isAuthenticated: result.isAuthenticated,
        rowCount: result.rowCount,
      });
    } else {
      console.error('[DEV][Supabase]', result.message, {
        category: result.category,
        httpStatus: result.httpStatus,
        errorCode: result.errorCode,
      });
    }
  });
}
