import * as jose from 'jose';

export class JwtValidator {
  private ssoServerUrl: string;
  private publicKey: jose.KeyLike | Uint8Array | null = null;

  constructor(ssoServerUrl: string) {
    this.ssoServerUrl = ssoServerUrl;
  }

  /**
   * JWKS에서 공개키 로드
   */
  async loadPublicKeyFromJwks(): Promise<void> {
    try {
      const jwksUrl = `${this.ssoServerUrl.replace('/api/v1', '')}/.well-known/jwks.json`;

      // JWKS 가져오기
      const response = await fetch(jwksUrl);
      const jwks = await response.json();

      if (!jwks.keys || jwks.keys.length === 0) {
        throw new Error('No keys in JWKS');
      }

      // 첫 번째 키 사용
      const jwk = jwks.keys[0];

      // JWK를 PublicKey로 변환
      this.publicKey = await jose.importJWK(jwk, jwk.alg);
    } catch (error: any) {
      throw new Error(`Failed to load public key from JWKS: ${error.message}`);
    }
  }

  /**
   * JWT 검증
   */
  async validateJwt(jwtToken: string): Promise<boolean> {
    if (!this.publicKey) {
      throw new Error('Public key not loaded. Call loadPublicKeyFromJwks() first.');
    }

    try {
      const { payload } = await jose.jwtVerify(jwtToken, this.publicKey, {
        algorithms: ['RS512'],
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * JWT에서 사용자 ID 추출
   */
  async getUserIdFromJwt(jwtToken: string): Promise<string | null> {
    if (!this.publicKey) {
      throw new Error('Public key not loaded. Call loadPublicKeyFromJwks() first.');
    }

    try {
      const { payload } = await jose.jwtVerify(jwtToken, this.publicKey, {
        algorithms: ['RS512'],
      });

      return (payload.sub as string) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * JWT 디코드 (검증 없이)
   */
  decodeJwt(jwtToken: string): any {
    try {
      const decoded = jose.decodeJwt(jwtToken);
      return decoded;
    } catch (error) {
      return null;
    }
  }
}
