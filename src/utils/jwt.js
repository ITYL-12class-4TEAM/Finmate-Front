/**
 * JWT 문자열을 디코딩하여 payload(JSON 객체)를 반환합니다.
 * 서명(signature) 검증은 하지 않으며, 클라이언트에서 정보 확인용으로만 사용됩니다.
 * 
 * @param {string} token - JWT 토큰 문자열 (예: "eyJhbGciOiJIUzI1NiIsInR5cCI6...")
 * @returns {Object|null} - 디코딩된 payload 객체 또는 null
 */
export function decodeJwt(token) {
    try {
      if (!token) return null;
      
      const payload = token.split('.')[1];
      // base64url → base64 변환
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('❌ JWT 디코딩 실패:', error);
      return null;
    }
  }
  