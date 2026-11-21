import {
  clearAuthSessionStorage,
  getSupabaseClient,
  isSupabaseConfigured,
  supabaseConfigError,
} from './supabase';
import { validateBirthDateString } from '../utils/birthDate';

export const SIGNUP_OTP_EXPIRY_SECONDS = 600; // 10 minutes (matches Supabase Email OTP Expiration = 600s)
export const SIGNUP_RESEND_COOLDOWN_SECONDS = 60; // Supabase default email resend rate limit

export interface SupabaseProfile {
  id: string;
  username: string;
  name: string;
  phone: string | null;
  gender: string | null;
  birth_date?: string | null;
  role?: string | null;
  email?: string | null;
  created_at?: string | null;
}

export interface UsernameCheckResult {
  available: boolean;
  errorMessage?: string;
}

export interface SendSignupOtpResult {
  success: boolean;
  errorMessage?: string;
  isUsernameConflict?: boolean;
}

export interface VerifySignupOtpResult {
  success: boolean;
  userId?: string;
  profile?: SupabaseProfile;
  errorMessage?: string;
}

function getRawErrorText(error: unknown): string {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const errObj = error as { message?: string; code?: string; error_description?: string };
    return [errObj.code, errObj.message, errObj.error_description].filter(Boolean).join(' ');
  }
  return String(error);
}

export function translateSupabaseSignupError(
  error: unknown,
  context: 'rpc' | 'signup' | 'resend' | 'verify' | 'profile'
): { message: string; isUsernameConflict?: boolean } {
  const raw = getRawErrorText(error);
  const lower = raw.toLowerCase();

  // Rate limit / resend cooldown
  if (
    lower.includes('over_email_send_rate_limit') ||
    lower.includes('rate limit') ||
    lower.includes('too many requests') ||
    lower.includes('for security purposes') ||
    lower.includes('429')
  ) {
    const secMatch = raw.match(/(\d+)\s*seconds?/i);
    if (secMatch) {
      return {
        message: `보안상 이메일 발송은 ${secMatch[1]}초 후에 다시 요청할 수 있습니다.`,
      };
    }
    return {
      message: '요청 횟수 제한에 도달했습니다. 약 1분 후 다시 시도해 주세요.',
    };
  }

  if (context === 'rpc') {
    return {
      message: '아이디 중복 확인 중 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  if (context === 'signup') {
    if (
      lower.includes('profiles_username_unique') ||
      lower.includes('duplicate key') ||
      lower.includes('23505') ||
      (lower.includes('database error saving new user') && lower.includes('username'))
    ) {
      return {
        message: '이미 사용 중인 아이디입니다. 다른 아이디로 중복 확인 후 다시 시도해 주세요.',
        isUsernameConflict: true,
      };
    }

    if (lower.includes('database error saving new user')) {
      return {
        message: '이미 사용 중인 아이디이거나 회원 정보 저장 중 오류가 발생했습니다. 아이디 중복 확인을 다시 진행해 주세요.',
        isUsernameConflict: true,
      };
    }

    if (
      lower.includes('user already registered') ||
      lower.includes('already been registered') ||
      lower.includes('email_exists')
    ) {
      return {
        message: '이미 가입된 이메일 주소입니다. 다른 이메일 주소를 입력해 주세요.',
      };
    }

    if (lower.includes('invalid') && lower.includes('email')) {
      return {
        message: '올바른 이메일 주소 형식이 아닙니다.',
      };
    }

    if (lower.includes('password') || lower.includes('weak_password')) {
      return {
        message: '비밀번호는 8~16자의 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
      };
    }

    if (lower.includes('signup_disabled') || lower.includes('signups not allowed')) {
      return {
        message: '현재 신규 회원가입이 비활성화되어 있습니다. 운영팀에 문의해 주세요.',
      };
    }

    return {
      message: '인증번호 발송 중 오류가 발생했습니다. 입력 정보를 확인 후 다시 시도해 주세요.',
    };
  }

  if (context === 'resend') {
    if (lower.includes('already confirmed')) {
      return {
        message: '이미 이메일 인증이 완료된 계정입니다.',
      };
    }
    return {
      message: '인증번호 재전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  if (context === 'verify') {
    if (lower.includes('otp_expired') || lower.includes('expired')) {
      return {
        message: '인증번호 유효 시간(10분)이 만료되었거나 더 이상 유효하지 않습니다. 재발송 버튼을 눌러 주세요.',
      };
    }

    if (lower.includes('invalid') || lower.includes('token')) {
      return {
        message: '인증번호가 일치하지 않거나 만료되었습니다. 메일의 6자리 숫자를 다시 확인해 주세요.',
      };
    }

    return {
      message: '이메일 인증 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  return {
    message: '프로필 정보를 조회하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  };
}

export async function checkUsernameAvailability(username: string): Promise<UsernameCheckResult> {
  if (!isSupabaseConfigured) {
    return {
      available: false,
      errorMessage: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc('check_username_available', {
      p_username: username.trim(),
    });

    if (error || typeof data !== 'boolean') {
      return {
        available: false,
        errorMessage: translateSupabaseSignupError(error, 'rpc').message,
      };
    }

    if (!data) {
      return {
        available: false,
        errorMessage: '이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요.',
      };
    }

    return { available: true };
  } catch (err) {
    return {
      available: false,
      errorMessage: translateSupabaseSignupError(err, 'rpc').message,
    };
  }
}

export async function signUpWithEmailOtp(params: {
  email: string;
  password: string;
  username: string;
  name: string;
  phone: string;
  gender: '여성' | '남성' | '기타';
  birthDate: string;
}): Promise<SendSignupOtpResult> {
  const birthValidation = validateBirthDateString(params.birthDate);
  if (!birthValidation.valid || !birthValidation.formatted) {
    return {
      success: false,
      errorMessage: birthValidation.message ?? '생년월일을 입력해 주세요.',
    };
  }

  if (!isSupabaseConfigured) {
    return {
      success: false,
      errorMessage: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email: params.email.trim(),
      password: params.password,
      options: {
        data: {
          username: params.username.trim(),
          name: params.name.trim(),
          phone: params.phone.trim(),
          gender: params.gender,
          birth_date: birthValidation.formatted,
        },
      },
    });

    if (error) {
      const translated = translateSupabaseSignupError(error, 'signup');
      return {
        success: false,
        errorMessage: translated.message,
        isUsernameConflict: translated.isUsernameConflict,
      };
    }

    // Supabase returns empty identities array when email is already registered & confirmed
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return {
        success: false,
        errorMessage: '이미 가입된 이메일 주소입니다. 다른 이메일 주소를 입력해 주세요.',
      };
    }

    return { success: true };
  } catch (err) {
    const translated = translateSupabaseSignupError(err, 'signup');
    return {
      success: false,
      errorMessage: translated.message,
      isUsernameConflict: translated.isUsernameConflict,
    };
  }
}

export async function resendSignupOtp(email: string): Promise<SendSignupOtpResult> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      errorMessage: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    if (error) {
      return {
        success: false,
        errorMessage: translateSupabaseSignupError(error, 'resend').message,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      errorMessage: translateSupabaseSignupError(err, 'resend').message,
    };
  }
}

export async function verifySignupOtpAndFetchProfile(
  email: string,
  token: string,
  birthDate: string
): Promise<VerifySignupOtpResult> {
  const birthValidation = validateBirthDateString(birthDate);
  if (!birthValidation.valid || !birthValidation.formatted) {
    return {
      success: false,
      errorMessage: birthValidation.message ?? '생년월일을 입력해 주세요.',
    };
  }

  if (!isSupabaseConfigured) {
    return {
      success: false,
      errorMessage: supabaseConfigError ?? 'Supabase 연결 설정이 완료되지 않았습니다.',
    };
  }

  const targetBirthDate = birthValidation.formatted;

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.verifyOtp({
      email: email.trim(),
      token: token.trim(),
      type: 'signup',
    });

    if (error || !data.user) {
      return {
        success: false,
        errorMessage: translateSupabaseSignupError(error, 'verify').message,
      };
    }

    const userId = data.user.id;

    // Fetch own profile created by handle_new_user trigger
    let profileData: SupabaseProfile | null = null;
    let profileError: unknown = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const res = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!res.error && res.data) {
        profileData = res.data as SupabaseProfile;
        profileError = null;
        break;
      }

      profileError = res.error;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    }

    if (!profileData) {
      try {
        await client.auth.signOut({ scope: 'local' });
      } catch {
        // Ignore cleanup errors
      }
      clearAuthSessionStorage();
      return {
        success: false,
        userId,
        errorMessage: translateSupabaseSignupError(profileError, 'profile').message,
      };
    }

    // Ensure birth_date is persisted on public.profiles even if DB trigger hasn't been updated yet
    const existingBirthDate =
      typeof profileData.birth_date === 'string'
        ? profileData.birth_date.trim().slice(0, 10)
        : '';

    if (existingBirthDate !== targetBirthDate) {
      const { data: updatedProfile, error: updateBirthError } = await client
        .from('profiles')
        .update({ birth_date: targetBirthDate })
        .eq('id', userId)
        .select('*')
        .single();

      const confirmedBirthDate =
        updatedProfile && typeof (updatedProfile as SupabaseProfile).birth_date === 'string'
          ? (updatedProfile as SupabaseProfile).birth_date!.trim().slice(0, 10)
          : '';

      if (updateBirthError || !updatedProfile || confirmedBirthDate !== targetBirthDate) {
        try {
          await client.auth.signOut({ scope: 'local' });
        } catch {
          // Ignore cleanup errors
        }
        clearAuthSessionStorage();
        return {
          success: false,
          userId,
          errorMessage:
            '생년월일 정보를 저장하지 못해 회원가입을 완료할 수 없습니다. 잠시 후 다시 시도하거나 운영팀에 문의해 주세요.',
        };
      }

      profileData = updatedProfile as SupabaseProfile;
    }

    return {
      success: true,
      userId,
      profile: profileData,
    };
  } catch (err) {
    return {
      success: false,
      errorMessage: translateSupabaseSignupError(err, 'verify').message,
    };
  }
}
