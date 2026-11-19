import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
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
} from './server/authCore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendCoreResponse(res: Response, result: AuthCoreResponse): void {
  res.setHeader('Cache-Control', 'no-store');
  if (result.headers) {
    for (const [key, val] of Object.entries(result.headers)) {
      res.setHeader(key, val);
    }
  }
  res.status(result.status).json(result.body);
}

function getRawBodyString(req: Request): string {
  if (typeof req.body === 'string') return req.body;
  if (req.body !== undefined) return JSON.stringify(req.body);
  return '';
}

function getClientIp(req: Request): string {
  return (
    extractClientIp(req.headers as Record<string, string | string[] | undefined>) ||
    req.ip ||
    'unknown'
  );
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  const authTextParser = express.text({ type: '*/*', limit: '16kb' });

  app.post('/api/auth/login', authTextParser, async (req: Request, res: Response): Promise<void> => {
    const result = await handleUsernameLogin({
      rawBody: getRawBodyString(req),
      clientIp: getClientIp(req),
    });
    sendCoreResponse(res, result);
  });

  app.post(
    '/api/auth/find-id/send-otp',
    authTextParser,
    async (req: Request, res: Response): Promise<void> => {
      const isHttps = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
      const result = await handleFindIdSendOtp({
        rawBody: getRawBodyString(req),
        clientIp: getClientIp(req),
        cookieHeader: req.headers.cookie,
        isHttps,
      });
      sendCoreResponse(res, result);
    }
  );

  app.post(
    '/api/auth/find-id/verify-otp',
    authTextParser,
    async (req: Request, res: Response): Promise<void> => {
      const result = await handleFindIdVerifyOtp({
        rawBody: getRawBodyString(req),
        clientIp: getClientIp(req),
      });
      sendCoreResponse(res, result);
    }
  );

  app.post(
    '/api/auth/reset-password/send-otp',
    authTextParser,
    async (req: Request, res: Response): Promise<void> => {
      const isHttps = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https';
      const result = await handleResetPasswordSendOtp({
        rawBody: getRawBodyString(req),
        clientIp: getClientIp(req),
        cookieHeader: req.headers.cookie,
        isHttps,
      });
      sendCoreResponse(res, result);
    }
  );

  app.post(
    '/api/auth/reset-password/verify-otp',
    authTextParser,
    async (req: Request, res: Response): Promise<void> => {
      const result = await handleResetPasswordVerifyOtp({
        rawBody: getRawBodyString(req),
        clientIp: getClientIp(req),
      });
      sendCoreResponse(res, result);
    }
  );

  // Server-verified admin routes
  app.get('/api/admin/verify', async (req: Request, res: Response): Promise<void> => {
    const result = await handleAdminVerify(req.headers.authorization);
    sendCoreResponse(res, result);
  });

  app.get('/api/admin/members', async (req: Request, res: Response): Promise<void> => {
    const result = await handleAdminGetMembers(req.headers.authorization);
    sendCoreResponse(res, result);
  });

  app.use(express.json());

  const GMAIL_USER = process.env.GMAIL_USER || 'readoracontact@gmail.com';
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD || '';
  const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

  // Endpoint: Check email service status
  app.get('/api/email-status', (_req: Request, res: Response) => {
    res.json({
      configured: Boolean(RESEND_API_KEY || GMAIL_APP_PASSWORD),
      senderEmail: GMAIL_USER,
      service: RESEND_API_KEY ? 'Resend API' : 'Google Gmail SMTP'
    });
  });

  // Legacy client-OTP verification endpoint replaced by Supabase Auth OTP endpoints
  app.post('/api/send-verification', (_req: Request, res: Response): void => {
    res.status(410).json({
      success: false,
      message: '이메일 인증이 Supabase Auth OTP 방식으로 전환되었습니다. 페이지를 새로고침 후 다시 이용해 주세요.',
    });
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
