import type { NextApiRequest, NextApiResponse } from 'next';
import { SsoClient } from '@/lib/ssoClient';

type Data = {
  success: boolean;
  redirectUrl?: string;
  error?: string;
};

/**
 * SSO 인증 API
 * 브라우저 리다이렉트를 위한 SSO 인증 URL을 생성합니다.
 * 클라이언트는 이 URL로 브라우저를 리다이렉트하여 SSO 인증을 진행합니다.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // SSO Client 초기화
    const ssoClient = new SsoClient({
      ssoServerUrl: process.env.SSO_SERVER_URL!,
      siteId: process.env.SITE_ID!,
      siteSecret: process.env.SITE_SECRET!,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const redirectPath = '/test/callback';

    // 브라우저 리다이렉트용 인증 URL 생성
    const authUrl = ssoClient.buildAuthenticateUrl(redirectPath, baseUrl);

    return res.status(200).json({
      success: true,
      redirectUrl: authUrl,
    });
  } catch (error: any) {
    console.error('SSO authentication error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
