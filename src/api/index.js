import axios from 'axios';

// 공통 axios 인스턴스 생성
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '', // 환경변수 기반 (ex: /api)
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
