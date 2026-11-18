import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  extractClientIp,
  handleAdminGetMembers,
  handleAdminVerify,
  handleUsernameLogin,
} from './server/authCore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Raw text parsing for /api/auth/login so byte-length and JSON checks match Netlify Functions
  app.post(
    '/api/auth/login',
    express.text({ type: '*/*', limit: '16kb' }),
    async (req: Request, res: Response): Promise<void> => {
      const rawBody =
        typeof req.body === 'string'
          ? req.body
          : req.body !== undefined
            ? JSON.stringify(req.body)
            : '';
      const clientIp =
        extractClientIp(req.headers as Record<string, string | string[] | undefined>) ||
        req.ip ||
        'unknown';
      const result = await handleUsernameLogin({ rawBody, clientIp });
      res.setHeader('Cache-Control', 'no-store');
      res.status(result.status).json(result.body);
    }
  );

  // Server-verified admin routes
  app.get('/api/admin/verify', async (req: Request, res: Response): Promise<void> => {
    const result = await handleAdminVerify(req.headers.authorization);
    res.setHeader('Cache-Control', 'no-store');
    res.status(result.status).json(result.body);
  });

  app.get('/api/admin/members', async (req: Request, res: Response): Promise<void> => {
    const result = await handleAdminGetMembers(req.headers.authorization);
    res.setHeader('Cache-Control', 'no-store');
    res.status(result.status).json(result.body);
  });

  app.use(express.json());

  const GMAIL_USER = process.env.GMAIL_USER || 'readoracontact@gmail.com';
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASSWORD || 'kcaupdrcusvjedna';
  const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

  // Endpoint: Check email service status
  app.get('/api/email-status', (_req: Request, res: Response) => {
    res.json({
      configured: Boolean(RESEND_API_KEY || GMAIL_APP_PASSWORD),
      senderEmail: GMAIL_USER,
      service: RESEND_API_KEY ? 'Resend API' : 'Google Gmail SMTP'
    });
  });

  // Endpoint: Send verification code via readoracontact@gmail.com
  app.post('/api/send-verification', async (req: Request, res: Response): Promise<void> => {
    const { email, type = 'signup' } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, message: '올바른 이메일 주소를 입력해 주세요.' });
      return;
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const typeTitle =
      type === 'find_id'
        ? '아이디 찾기'
        : type === 'reset_password'
        ? '비밀번호 재설정'
        : '회원가입';

    // 1. If Resend API key is configured, send via Resend (Bypasses all Google IP blocks)
    if (RESEND_API_KEY) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `리도라(Readora) <onboarding@resend.dev>`,
            reply_to: GMAIL_USER,
            to: [email.trim()],
            subject: `[리도라 Readora] ${typeTitle} 본인인증 번호 [${verificationCode}]`,
            html: `
              <div style="max-width: 520px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F5EE; border-radius: 18px; color: #19221C;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #172E22;">리도라 <span style="font-size: 13px; font-weight: 600; color: #DF612D; letter-spacing: 2px;">READORA</span></h1>
                  <p style="margin: 6px 0 0; font-size: 13px; color: #556358;">캘거리 한인 독서 커뮤니티 · 이메일 본인인증</p>
                </div>
                <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 16px; border: 1px solid #EAE3D4; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                  <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #19221C;">${typeTitle} 본인인증 번호</h2>
                  <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #465349;">
                    안녕하세요. <strong>리도라(Readora)</strong>를 찾아주셔서 감사합니다.<br/>
                    아래의 6자리 인증번호를 인증창에 입력하여 본인인증을 완료해 주세요.
                  </p>
                  <div style="background-color: #FAF6F0; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px dashed #DF612D;">
                    <span style="font-size: 12px; font-weight: 600; color: #78716C; display: block; margin-bottom: 6px;">인증번호 (3분 동안 유효)</span>
                    <strong style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #DF612D; font-family: monospace;">${verificationCode}</strong>
                  </div>
                  <p style="margin: 0; font-size: 12px; color: #8C827A; line-height: 1.5;">
                    • 본인이 요청하지 않은 경우 본 메일을 무시하셔도 안전합니다.<br/>
                    • 인증번호 유효 시간은 3분입니다.
                  </p>
                </div>
                <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #8C827A;">
                  <p style="margin: 0;">대표 문의: <a href="mailto:${GMAIL_USER}" style="color: #DF612D; text-decoration: none; font-weight: 600;">${GMAIL_USER}</a></p>
                  <p style="margin: 4px 0 0;">© Readora Calgary Book Club.</p>
                </div>
              </div>
            `
          })
        });

        if (resendRes.ok) {
          res.json({
            success: true,
            sentRealEmail: true,
            code: verificationCode,
            senderEmail: GMAIL_USER,
            message: `${email} 수신함으로 인증 메일이 성공적으로 전송되었습니다.`
          });
          return;
        }
      } catch (e) {
        console.error('Resend API error:', e);
      }
    }

    // 2. If Google App Password is provided, send real email via Gmail SMTP
    if (GMAIL_APP_PASSWORD) {
      try {
        const cleanPassword = GMAIL_APP_PASSWORD.replace(/\s+/g, '');
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: GMAIL_USER,
            pass: cleanPassword,
          },
        });

        const mailOptions = {
          from: `"리도라(Readora)" <${GMAIL_USER}>`,
          to: email.trim(),
          subject: `[리도라 Readora] ${typeTitle} 본인인증 번호 [${verificationCode}]`,
          text: `안녕하세요. 캘거리 한인 독서 커뮤니티 리도라(Readora)입니다.\n\n요청하신 ${typeTitle} 본인인증 번호는 [${verificationCode}] 입니다.\n화면의 인증번호 입력란에 3분 이내로 입력해 주세요.\n\n문의사항: ${GMAIL_USER}`,
          html: `
            <div style="max-width: 520px; margin: 0 auto; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F5EE; border-radius: 18px; color: #19221C;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #172E22;">리도라 <span style="font-size: 13px; font-weight: 600; color: #DF612D; letter-spacing: 2px;">READORA</span></h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #556358;">캘거리 한인 독서 커뮤니티 · 이메일 본인인증</p>
              </div>
              <div style="background-color: #ffffff; padding: 28px 24px; border-radius: 16px; border: 1px solid #EAE3D4; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #19221C;">${typeTitle} 본인인증 번호</h2>
                <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #465349;">
                  안녕하세요. <strong>리도라(Readora)</strong>를 찾아주셔서 감사합니다.<br/>
                  아래의 6자리 인증번호를 인증창에 입력하여 본인인증을 완료해 주세요.
                </p>
                <div style="background-color: #FAF6F0; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px dashed #DF612D;">
                  <span style="font-size: 12px; font-weight: 600; color: #78716C; display: block; margin-bottom: 6px;">인증번호 (3분 동안 유효)</span>
                  <strong style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #DF612D; font-family: monospace;">${verificationCode}</strong>
                </div>
                <p style="margin: 0; font-size: 12px; color: #8C827A; line-height: 1.5;">
                  • 본인이 요청하지 않은 경우 본 메일을 무시하셔도 안전합니다.<br/>
                  • 인증번호 유효 시간은 3분입니다.
                </p>
              </div>
              <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #8C827A;">
                <p style="margin: 0;">발신 및 문의: <a href="mailto:${GMAIL_USER}" style="color: #DF612D; text-decoration: none; font-weight: 600;">${GMAIL_USER}</a></p>
                <p style="margin: 4px 0 0;">© Readora Calgary Book Club.</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);

        res.json({
          success: true,
          sentRealEmail: true,
          code: verificationCode,
          senderEmail: GMAIL_USER,
          message: `${GMAIL_USER} 계정에서 ${email} 수신함으로 인증 메일을 성공적으로 발송했습니다.`
        });
        return;
      } catch (err: any) {
        console.error('SMTP sending error:', err);
        // Fallback with simulated code so users are not blocked
        res.json({
          success: true,
          sentRealEmail: false,
          code: verificationCode,
          senderEmail: GMAIL_USER,
          smtpError: err?.message || 'SMTP Authentication Error',
          message: `구글 SMTP 인증 오류가 발생하여 화면에 인증번호 [${verificationCode}]를 제공합니다. 구글 계정 16자리 앱 비밀번호(GMAIL_APP_PASSWORD)를 확인해 주세요.`
        });
        return;
      }
    }

    // When GMAIL_APP_PASSWORD is not yet set in environment variables
    res.json({
      success: true,
      sentRealEmail: false,
      code: verificationCode,
      senderEmail: GMAIL_USER,
      message: `대표 메일 계정(${GMAIL_USER})의 구글 16자리 앱 비밀번호(GMAIL_APP_PASSWORD)가 아직 설정되지 않았습니다. 원활한 가입 및 테스트를 위해 인증번호 [${verificationCode}]를 화면에 표시해 드립니다.`
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
