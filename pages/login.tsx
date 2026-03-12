import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface LoginProps {
  siteName: string;
  siteId: string;
  siteColor: string;
  kvKey: string;
}

const mockUsers = [
  { userId: 'user1', userName: '홍길동', email: 'hong@example.com' },
  { userId: 'user2', userName: '김철수', email: 'kim@example.com' },
  { userId: 'user3', userName: '이영희', email: 'lee@example.com' },
  { userId: 'admin', userName: '관리자', email: 'admin@example.com' },
];

export default function Login({ siteName, siteId, siteColor, kvKey }: LoginProps) {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectUser = (user: typeof mockUsers[0]) => {
    setUserId(user.userId);
    setUserName(user.userName);
    setEmail(user.email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/test/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName,
          email,
          kvKey,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 성공 시 콜백으로 리다이렉트
        router.push(`/callback?success=true&jwtToken=${data.jwtToken}`);
      } else {
        setError(data.message || '로그인 실패');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || '로그인 처리 오류');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`로그인 - ${siteName}`}</title>
      </Head>

      <div className="container">
        <div className="header" style={{ backgroundColor: siteColor }}>
          <div className="badge">{siteId}</div>
          <h1>로그인</h1>
          <p className="description">사용자 정보를 입력하세요</p>
        </div>

        <div className="content">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="quick-users">
            <div className="quick-users-title">빠른 선택:</div>
            {mockUsers.map((user) => (
              <span
                key={user.userId}
                className="user-btn"
                onClick={() => selectUser(user)}
              >
                {user.userName}
              </span>
            ))}
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="userId">사용자 ID</label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                placeholder="예: user1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="userName">이름</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                placeholder="예: 홍길동"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="예: user@example.com"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <style jsx>{`
          .container {
            max-width: 500px;
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
            font-size: 2em;
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
          }

          .content {
            padding: 40px;
          }

          .alert {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
          }

          .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .quick-users {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }

          .quick-users-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #495057;
          }

          .user-btn {
            display: inline-block;
            padding: 8px 16px;
            margin: 5px;
            background: white;
            border: 2px solid #dee2e6;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
          }

          .user-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
          }

          .form-group {
            margin-bottom: 20px;
          }

          label {
            display: block;
            color: #495057;
            font-weight: bold;
            margin-bottom: 8px;
          }

          input {
            width: 100%;
            padding: 12px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }

          input:focus {
            outline: none;
            border-color: #667eea;
          }

          .btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s;
          }

          .btn:hover:not(:disabled) {
            transform: translateY(-2px);
          }

          .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { kvKey } = context.query;

  if (!kvKey) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      siteName: process.env.SITE_NAME || 'SSO Test Site',
      siteId: process.env.SITE_ID || 'SITE_A',
      siteColor: process.env.SITE_COLOR || '#E74C3C',
      kvKey: kvKey as string,
    },
  };
};
