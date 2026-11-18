import {
  extractClientIp,
  handleAdminGetMembers,
  handleAdminVerify,
  handleUsernameLogin,
} from '../../server/authCore';

function jsonResponse(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
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

  const headersObj: Record<string, string | string[] | undefined> = {};
  req.headers.forEach((value, key) => {
    headersObj[key.toLowerCase()] = value;
  });

  if (routePath === '/auth/login' && method === 'POST') {
    const rawBody = await req.text();
    const clientIp = extractClientIp(headersObj);
    const result = await handleUsernameLogin({ rawBody, clientIp });
    return jsonResponse(result.status, result.body);
  }

  if (routePath === '/admin/verify' && method === 'GET') {
    const result = await handleAdminVerify(req.headers.get('authorization') ?? undefined);
    return jsonResponse(result.status, result.body);
  }

  if (routePath === '/admin/members' && method === 'GET') {
    const result = await handleAdminGetMembers(req.headers.get('authorization') ?? undefined);
    return jsonResponse(result.status, result.body);
  }

  return jsonResponse(404, {
    success: false,
    message: '요청하신 API 경로를 찾을 수 없습니다.',
  });
}
