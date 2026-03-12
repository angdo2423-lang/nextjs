import type { NextApiRequest, NextApiResponse } from 'next';
import { SsoClient } from '@/lib/ssoClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // SSO Client 초기화
    const ssoClient = new SsoClient({
      ssoServerUrl: process.env.SSO_SERVER_URL!,
      siteId: process.env.SITE_ID!,
      siteSecret: process.env.SITE_SECRET!,
    });

    const jwks = await ssoClient.getJwks();

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(jwks);
  } catch (error: any) {
    console.error('[API] JWKS error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch JWKS',
    });
  }
}
