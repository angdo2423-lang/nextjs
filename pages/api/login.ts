import type { NextApiRequest, NextApiResponse } from 'next';
import { SsoClient } from '@/lib/ssoClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  /*
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  } */

  try {
    const { userId, userName, email, kvKey } = req.body;

    if (!userId || !kvKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // SSO Client 초기화
    const ssoClient = new SsoClient({
      ssoServerUrl: process.env.SSO_SERVER_URL!,
      siteId: process.env.SITE_ID!,
      siteSecret: process.env.SITE_SECRET!,
    });

    // 사용자 데이터 저장
    const userData = {
      userName: userName || userId,
      email: email || `${userId}@example.com`,
    };

    const response = await ssoClient.saveUserData(kvKey, userId, userData);
    console.log('TEST!!!!!!!!!!!!! ', response);
    if (response.success) {
      console.log('TEST IF');
      return res.status(200).json({
        success: true,
        jwtToken: response.jwtToken,
      });
    } else {
      console.log('TEST ELSE');
      return res.status(400).json({
        success: false,
        message: response.errorMessage || 'Login failed',
      });
    }
  } catch (error: any) {
    console.error('[API] Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}
