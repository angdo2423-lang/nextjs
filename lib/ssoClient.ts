import axios from 'axios';

export interface SsoConfig {
  ssoServerUrl: string;
  siteId: string;
  siteSecret: string;
}

export interface SsoResponse {
  success: boolean;
  needAuth: boolean;
  authCode?: string;
  jwtToken?: string;
  kvKey?: string;
  error?: string;
  errorMessage?: string;
}

export class SsoClient {
  private config: SsoConfig;

  constructor(config: SsoConfig) {
    this.config = config;
  }

  /**
   * SSO 인증 URL 생성
   * 브라우저 리다이렉트를 통해 SSO 서버로 인증 요청
   */
  buildAuthenticateUrl(redirectPath: string, baseUrl: string): string {
    const params = new URLSearchParams({
      siteId: this.config.siteId,
      adapterKey: this.generateAdapterKey(),
      redirectPath,
      baseUrl, // SSO 서버가 콜백 URL을 생성하기 위해 필요
    });

    return `${this.config.ssoServerUrl}/authenticate?${params.toString()}`;
  }

  /**
   * 콜백 파라미터 처리
   */
  handleCallback(params: Record<string, string | string[]>): SsoResponse {
    const getParam = (key: string): string | undefined => {
      const value = params[key];
      return Array.isArray(value) ? value[0] : value;
    };

    const success = getParam('success');
    const needAuth = getParam('needAuth');
    const error = getParam('error');

    if (error) {
      return {
        success: false,
        needAuth: false,
        error: getParam('errorCode'),
        errorMessage: getParam('message'),
      };
    }

    if (success === 'true') {
      return {
        success: true,
        needAuth: false,
        authCode: getParam('authCode'),
        jwtToken: getParam('jwtToken'),
      };
    }

    if (needAuth === 'true') {
      return {
        success: false,
        needAuth: true,
        kvKey: getParam('kvKey'),
      };
    }

    return {
      success: false,
      needAuth: false,
      errorMessage: 'Unknown callback response',
    };
  }

  /**
   * 사용자 데이터 저장 (kv/set)
   */
  async saveUserData(
    kvKey: string,
    userId: string,
    userData: Record<string, any>
  ): Promise<SsoResponse> {
    try {
      const userDataMap = {
        userId,
        ...userData,
      };

      const body = {
        [kvKey]: userDataMap,
      };

      const authHeader = this.getAuthorizationHeader();
      console.log("AUTH Header:: ", authHeader);
      console.log(`url is: ${this.config.ssoServerUrl}/kv/set`);
      const response = await axios.post(
        `http://dev1-tokenserver-svc/sso/api/v1/kv/set`,
        body ,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        }
      ).catch(
        (x) => {
          console.log(x);
        }
      );

      console.log("AUTH Header axios /kv/set response:: ", response);

      if (response.data && response.data.jwtToken) {
        console.log("AUTH Header response.data jwttoken ");
        return {
          success: true,
          needAuth: false,
          jwtToken: response.data.jwtToken,
        };
      }

      return {
        success: false,
        needAuth: false,
        errorMessage: 'No JWT token in response',
      };
    } catch (error: any) {
      console.error("AUTH Header CATCH ");
      return {
        success: false,
        needAuth: false,
        errorMessage: error.message || 'Failed to save user data',
      };
    }
  }

  /**
   * authCode로 세션 정보 조회 (session/get)
   */
  async getSessionInfo(authCode: string): Promise<{
    success: boolean;
    userId?: string;
    userName?: string;
    email?: string;
    errorMessage?: string;
  }> {
    try {
      const authHeader = this.getAuthorizationHeader();

      const response = await axios.post(
        `http://test-svc/session/get`,
        { sessionId: authCode },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        }
      );

      if (response.data) {
        // userId가 직접 있으면 사용
        if (response.data.userId) {
          return {
            success: true,
            userId: response.data.userId,
            userName: response.data.userName,
            email: response.data.email,
          };
        }

        // jwtToken 필드가 있으면 (userId 또는 실제 JWT 토큰)
        if (response.data.jwtToken) {
          const tokenValue = response.data.jwtToken;

          // JWT 형식인지 확인 (xxx.xxx.xxx 형태)
          if (tokenValue.includes('.') && tokenValue.split('.').length === 3) {
            // JWT 토큰이면 디코드해서 userId 추출 시도
            try {
              const payload = JSON.parse(Buffer.from(tokenValue.split('.')[1], 'base64').toString());
              return {
                success: true,
                userId: payload.sub || payload.userId,
                userName: response.data.userName || payload.userName,
                email: response.data.email || payload.email,
              };
            } catch (e) {
              // 디코드 실패하면 토큰 값 자체를 userId로 사용
              return {
                success: true,
                userId: tokenValue,
                userName: response.data.userName,
                email: response.data.email,
              };
            }
          } else {
            // JWT 형식이 아니면 userId 값으로 간주
            return {
              success: true,
              userId: tokenValue,
              userName: response.data.userName,
              email: response.data.email,
            };
          }
        }
      }

      return {
        success: false,
        errorMessage: 'No user data in response',
      };
    } catch (error: any) {
      return {
        success: false,
        errorMessage: error.response?.data?.message || error.message || 'Failed to get session info',
      };
    }
  }

  /**
   * JWKS 조회
   */
  async getJwks(): Promise<string> {
    try {
      const response = await axios.get(
        `${this.config.ssoServerUrl.replace('/api/v1', '')}/.well-known/jwks.json`
      );
      return JSON.stringify(response.data);
    } catch (error: any) {
      throw new Error(`Failed to fetch JWKS: ${error.message}`);
    }
  }

  /**
   * Authorization 헤더 생성
   */
  private getAuthorizationHeader(): string {
    const credentials = `${this.config.siteId}:${this.config.siteSecret}`;
    const base64 = Buffer.from(credentials).toString('base64');
    return `Basic ${base64}`;
  }

  /**
   * Adapter Key 생성
   */
  private generateAdapterKey(): string {
    return `adapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
