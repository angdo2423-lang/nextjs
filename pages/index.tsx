import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface HomeProps {
  siteName: string;
  siteId: string;
  siteColor: string;
  baseUrl: string;
}

export default function Home({ siteName, siteId, siteColor, baseUrl }: HomeProps) {
  const router = useRouter();

  const handleSsoLogin = async () => {
    try {
      // 서버 사이드 API를 호출하여 SSO 인증 시작 (Referer 헤더 포함)
      const response = await fetch('/test/api/sso-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // SSO 서버로 리다이렉트
        window.location.href = data.redirectUrl;
      } else {
        console.error('SSO authentication failed:', data.error);
        alert('SSO 인증 요청에 실패했습니다: ' + data.error);
      }
    } catch (error) {
      console.error('SSO authentication error:', error);
      alert('SSO 인증 요청 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Head>
        <title>{siteName}</title>
        <meta name="description" content="SSO Test with Next.js SSR" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <div className="header" style={{ backgroundColor: siteColor }}>
          <h1>{siteName}</h1>
          <div className="badge">Site ID: {siteId}</div>
          <div className="badge">Next.js SSR</div>
          <p className="description">
            Next.js Server-Side Rendering을 사용한 SSO 테스트 환경입니다.
          </p>
        </div>

        <div className="content">
          <div className="welcome-section">
            <h2>🚀 SSO 인증 테스트</h2>
            <p>Next.js SSR을 활용한 Single Sign-On 인증 테스트입니다.</p>
          </div>

          <div className="feature-box">
            <h3>📦 주요 기능</h3>
            <ul className="feature-list">
              <li>Server-Side Rendering (SSR)</li>
              <li>SSO 서버 연동</li>
              <li>JWT 검증 (JWKS)</li>
              <li>세션 관리</li>
              <li>타입 안전성 (TypeScript)</li>
            </ul>
          </div>

          <div className="btn-container">
            <button onClick={handleSsoLogin} className="btn">
              🔐 SSO 인증 시작
            </button>
          </div>

          <div className="info-section">
            <h4>🛠 사용 기술</h4>
            <div>
              <span className="tech-badge">Next.js 13</span>
              <span className="tech-badge">TypeScript</span>
              <span className="tech-badge">SSR</span>
              <span className="tech-badge">RSA JWT</span>
              <span className="tech-badge">JWKS</span>
            </div>
          </div>
        </div>

        <style jsx>{`
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            margin-top: 50px;
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
            font-size: 0.9em;
            margin: 5px;
          }

          .description {
            margin-top: 15px;
            opacity: 0.9;
            font-size: 1.1em;
          }

          .content {
            padding: 50px;
          }

          .welcome-section {
            text-align: center;
            margin-bottom: 40px;
          }

          .welcome-section h2 {
            color: #333;
            font-size: 2em;
            margin-bottom: 15px;
          }

          .welcome-section p {
            color: #666;
            font-size: 1.1em;
          }

          .feature-box {
            background: #f8f9fa;
            border-left: 4px solid ${siteColor};
            padding: 25px;
            border-radius: 10px;
            margin: 20px 0;
          }

          .feature-box h3 {
            color: #333;
            margin-bottom: 15px;
          }

          .feature-list {
            list-style: none;
            padding: 0;
          }

          .feature-list li {
            padding: 8px 0;
            color: #555;
          }

          .feature-list li:before {
            content: '✓ ';
            color: ${siteColor};
            font-weight: bold;
            margin-right: 10px;
          }

          .btn-container {
            text-align: center;
            margin-top: 40px;
          }

          .btn {
            padding: 18px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            transition: all 0.3s;
          }

          .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          }

          .info-section {
            margin-top: 40px;
            padding: 20px;
            background: #e9ecef;
            border-radius: 10px;
            text-align: center;
          }

          .info-section h4 {
            color: #495057;
            margin-bottom: 10px;
          }

          .tech-badge {
            display: inline-block;
            background: white;
            padding: 5px 15px;
            border-radius: 15px;
            margin: 5px;
            font-size: 0.9em;
            color: #495057;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      siteName: process.env.SITE_NAME || 'SSO Test Site',
      siteId: process.env.SITE_ID || 'SITE_A',
      siteColor: process.env.SITE_COLOR || '#E74C3C',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    },
  };
};
