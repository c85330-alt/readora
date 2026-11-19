import {
  AuthCoreResponse,
  extractClientIp,
  handleAdminGetMembers,
  handleAdminVerify,
  handleFindIdSendOtp,
  handleFindIdVerifyOtp,
  handleResetPasswordSendOtp,
  handleResetPasswordVerifyOtp,
  handleUsernameLogin,
} from '../../server/authCore';

function jsonResponse(result: AuthCoreResponse): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...(result.headers ?? {}),
  };

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers,
  });
}

function normalizeRoutePath(urlStr: string): string {
  try {
    const pathname = new URL(urlStr).pathname;
    return (
      pathname
        .replace(/^\/\.netlify\/functions\/api/, '')
        .replace(/^\/api/, '') || '/'
    );
  } catch {
    return '/';
  }
}

export default async function handler(req: Request): Promise<Response> {
  const routePath = normalizeRoutePath(req.url);
  const method = req.method.toUpperCase();
  const isHttps = req.url.startsWith('https://') || req.headers.get('x-forwarded-proto') === 'https';

  const headersObj: Record<string, string | string[] | undefined> = {};
  req.headers.forEach((value, key) => {
    headersObj[key.toLowerCase()] = value;
  });

  if (routePath === '/auth/login' && method === 'POST') {
    const rawBody = await req.text();
    const clientIp = extractClientIp(headersObj);
    return jsonResponse(await handleUsernameLogin({ rawBody, clientIp }));
  }

  if (routePath === '/auth/find-id/send-otp' && method === 'POST') {
    const rawBody = await req.text();
    const clientIp = extractClientIp(headersObj);
    return jsonResponse(
      await handleFindIdSendOtp({
        rawBody,
        clientIp,
        cookieHeader: req.headers.get('cookie') ?? undefined,
        isHttps,
      })
    );
  }

  if (routePath === '/auth/find-id/verify-otp' && method === 'POST') {
    const rawBody = await req.text();
    const clientIp = extractClientIp(headersObj);
    return jsonResponse(await handleFindIdVerifyOtp({ rawBody, clientIp }));
  }

  if (routePath === '/auth/reset-password/send-otp' && method === 'POST') {
    const rawBody = await req.text();
    const clientIp = extractClientIp(headersObj);
    return jsonResponse(
      await handleResetPasswordSendOtp({
        rawBody,
        clientIp,
        cookieHeader: req.headers.get('cookie') ?? undefined,
        isHttps,
      })
    );
  }

  if (routePath === '/auth/reset-password/verify-otp' && method === 'POST') {
    const rawBody = await req.text();
    const clientIp = extractClientIp(headersObj);
    return jsonResponse(await handleResetPasswordVerifyOtp({ rawBody, clientIp }));
  }

  if (routePath === '/admin/verify' && method === 'GET') {
    return jsonResponse(
      await handleAdminVerify(req.headers.get('authorization') ?? undefined)
    );
  }

  if (routePath === '/admin/members' && method === 'GET') {
    return jsonResponse(
      await handleAdminGetMembers(req.headers.get('authorization') ?? undefined)
    );
  }

  return jsonResponse({
    status: 404,
    body: {
      success: false,
      message: '요청하신 API 경로를 찾을 수 없습니다.',
    },
  });
}
