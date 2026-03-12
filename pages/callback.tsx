import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { SsoClient } from '@/lib/ssoClient';

interface CallbackProps {
  siteName: string;
  siteId: string;
  siteColor: string;
  success: boolean;
  needAuth: boolean;
  authCode?: string;
  jwtToken?: string;
  kvKey?: string;
  userId?: string;
  userName?: string;
  email?: string;
  error?: string;
}

export default function Callback({
  siteName,
  siteId,
  siteColor,
  success,
  needAuth,
  authCode,
  jwtToken,
  kvKey,
  userId,
  userName,
  email,
  error,
}: CallbackProps) {
  const router = useRouter();

  if (needAuth && kvKey) {
    // 로그인 페이지로 이동
    if (typeof window !== 'undefined') {
      router.push(`/login?kvKey=${kvKey}`);
    }
    return null;
  }

  if (error) {
    return (
      <>
        <Head>
          <title>{`인증 오류 - ${siteName}`}</title>
        </Head>
        <div className="container">
          <div className="header" style={{ backgroundColor: '#dc3545' }}>
            <h1>인증 오류</h1>
          </div>
          <div className="content">
            <div className="error-box">
              <p>{error}</p>
            </div>
            <button onClick={() => router.push('/')} className="btn">
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`인증 성공 - ${siteName}`}</title>
      </Head>

      <div className="container">
        <div className="header" style={{ backgroundColor: siteColor }}>
          <div className="badge">{siteId}</div>
          <h1>✅ 인증 성공!</h1>
          <p className="description">SSO 인증이 완료되었습니다.</p>
        </div>

        <div className="content">
          {/* 주요 인증 정보 하이라이트 */}
          <div className="highlight-section">
            {authCode && (
              <div className="highlight-box">
                <div className="highlight-label">🔑 Auth Code</div>
                <div className="highlight-value">{authCode}</div>
              </div>
            )}

            {userId && (
              <div className="highlight-box">
                <div className="highlight-label">👤 사용자 ID</div>
                <div className="highlight-value">{userId}</div>
              </div>
            )}
          </div>

          {/* 추가 사용자 정보 */}
          {userName && (
            <div className="info-box">
              <div className="info-label">사용자 이름:</div>
              <div className="info-value">{userName}</div>
            </div>
          )}

          {email && (
            <div className="info-box">
              <div className="info-label">이메일:</div>
              <div className="info-value">{email}</div>
            </div>
          )}

          {jwtToken && (
            <div className="info-box">
              <div className="info-label">JWT Token:</div>
              <div className="info-value" style={{ wordBreak: 'break-all' }}>
                {jwtToken}
              </div>
            </div>
          )}

          <div className="btn-container">
            <button onClick={() => router.push('/')} className="btn">
              🏠 홈으로
            </button>
          </div>
        </div>

        <style jsx>{`
          .container {
            max-width: 800px;
            margin: 50px auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }

          .header {
            color: white;
            padding: 40px;
            text-align: center;
          }

          .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
          }

          .badge {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 20px;
            border-radius: 20px;
            margin-bottom: 20px;
          }

          .description {
            opacity: 0.9;
            font-size: 1.1em;
          }

          .content {
            padding: 50px;
          }

          .highlight-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }

          .highlight-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            text-align: center;
          }

          .highlight-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9em;
            font-weight: bold;
            margin-bottom: 10px;
          }

          .highlight-value {
            font-family: monospace;
            background: rgba(255, 255, 255, 0.95);
            padding: 12px;
            border-radius: 8px;
            color: #333;
            font-size: 1.1em;
            font-weight: bold;
            word-break: break-all;
          }

          @media (max-width: 600px) {
            .highlight-section {
              grid-template-columns: 1fr;
            }
          }

          .info-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }

          .info-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
          }

          .info-value {
            font-family: monospace;
            background: white;
            padding: 10px;
            border-radius: 5px;
            color: #212529;
          }

          .error-box {
            background: #f8d7da;
            color: #721c24;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
          }

          .btn-container {
            text-align: center;
            margin-top: 30px;
          }

          .btn {
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
          }

          .btn:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;

  // SSO Client 초기화
  const ssoClient = new SsoClient({
    ssoServerUrl: process.env.SSO_SERVER_URL!,
    siteId: process.env.SITE_ID!,
    siteSecret: process.env.SITE_SECRET!,
  });

  // 콜백 파라미터 처리
  const response = ssoClient.handleCallback(query as Record<string, string>);

  let userId: string | undefined;
  let userName: string | undefined;
  let email: string | undefined;
  let jwtToken: string | undefined;

  // authCode가 있으면 /session/get으로 사용자 정보 조회
  if (response.success && response.authCode) {
    try {
      console.log('[Callback] Fetching session info with authCode:', response.authCode);
      const sessionInfo = await ssoClient.getSessionInfo(response.authCode);
      console.log(sessionInfo);
      if (sessionInfo.success) {
        userId = sessionInfo.userId;
        console.log('[Callback] Session info retrieved:', { userId });
      } else {
        console.error('[Callback] Failed to get session info:', sessionInfo.errorMessage);
      }
    } catch (error) {
      console.error('[Callback] Session info error:', error);
    }
  }

  // JWT 검증 및 사용자 ID 추출 (fallback)
  if (!userId && response.success && response.jwtToken) {
    try {
      const { JwtValidator } = await import('@/lib/jwtValidator');
      const validator = new JwtValidator(process.env.SSO_SERVER_URL!);
      await validator.loadPublicKeyFromJwks();
      userId = (await validator.getUserIdFromJwt(response.jwtToken)) || undefined;
      console.log('[Callback] UserId from JWT:', userId);
    } catch (error) {
      console.error('[Callback] JWT validation error:', error);
    }
  }

  return {
    props: {
      siteName: process.env.SITE_NAME || 'SSO Test Site',
      siteId: process.env.SITE_ID || 'SITE_A',
      siteColor: process.env.SITE_COLOR || '#E74C3C',
      success: response.success,
      needAuth: response.needAuth,
      authCode: response.authCode || null,
      jwtToken: response.jwtToken || null,
      kvKey: response.kvKey || null,
      userId: userId || null,
      userName: userName || null,
      email: email || null,
      error: response.errorMessage || null,
    },
  };
};
