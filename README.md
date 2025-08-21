# <img src="https://github.com/user-attachments/assets/f0b57239-a8ad-4597-b02a-f2dbc6558ebc" alt="FinMate Logo" width="32" /> FinMate Frontend

> **당신만을 위한 금융 메이트, FinMate**  
개인 투자 성향 분석을 기반으로 금융 상품을 추천하고 비교할 수 있는 웹 서비스입니다.  
20-30대의 낮은 금융 이해도를 보완하고, 초보 투자자에게 맞춤형 포트폴리오와 의사결정 지원을 제공합니다.

<p align="center">
  <img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Pinia-Store-FFD952?logo=vue.js&logoColor=white" />
  <img src="https://img.shields.io/badge/SCSS-CSS%20Preprocessor-CC6699?logo=sass&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployment-Vercel-000000?logo=vercel&logoColor=white" />
</p>

---

## 🔗 배포 주소
👉 [**FinMate 서비스 바로가기**](https://finmate-woad.vercel.app)

## 🎥 시연 영상
👉 [![FinMate 시연 영상](https://img.youtube.com/vi/AecgrwJb0_c/0.jpg)](https://www.youtube.com/watch?v=AecgrwJb0_c)

---

## 📌 프로젝트 소개
- 금융상품 추천, 비교, 포트폴리오 관리까지 한 곳에서 가능한 **원스톱 금융 플랫폼**
- WMTI(투자 성향 검사)를 통한 **맞춤형 투자 전략 제시**
- **커뮤니티 기능**을 통해 사용자 간 금융 정보 공유
- AI 요약 기능을 통한 **금융 상품 이해도 향상**

---

## 🛠️ 사용 기술 스택
### Frontend
- **Framework**: Vue 3 (Composition API)  
- **State Management**: Pinia  
- **Build Tool**: Vite  
- **Styling**: CSS, Fontawesome, Bootstrap
- **Deployment**: Vercel  

### 협업 & 관리
- GitHub, GitHub Projects, PR 리뷰 & 코드 컨벤션
- Figma로 UI/UX 설계 👉 [Figma - FinMate](https://www.figma.com/design/JNQEx3lVgzP1sGgmAcoZDh/ITYL_12%ED%9A%8C%EC%B0%A8_4%ED%8C%80?node-id=0-1&t=8WHFruNnrzYrSzD1-1)
- Swagger로 API 명세 관리 👉 [Swagger - FinMate](http://54.180.75.58:8080/swagger-ui.html)

---

## 📂 주요 기능
✅ **회원가입 / 로그인**: JWT 인증, 소셜 로그인 (카카오 OAuth2.0), SMS 인증  
✅ **금융상품 검색 & 비교**: 금융감독원 OpenAPI 데이터 기반, 최대 3개 상품 비교, GPT 요약 제공  
✅ **투자 성향 검사 (WMTI)**: 20문항 Likert Scale, 개인 성향 분석 및 맞춤 포트폴리오 제공  
✅ **포트폴리오**: 사용자 입력 기반, 동일 연령대·유형별 자산 분포 비교  
✅ **커뮤니티**: 게시글 작성, 댓글/대댓글, 좋아요/스크랩, 태그별 검색  
✅ **챗봇**: 금융 정보 질의응답, 사이트 기능 안내  
✅ **마이페이지**: 즐겨찾기, 활동 기록, 프로필 관리  
✅ **알림 기능**: 댓글/좋아요/스크랩 등 실시간 알림 제공  

---

## 👥 팀원 구성
| 이름 | 역할 | GitHub |
|------|------|--------|
| **강영광** | OpenAPI 데이터 가공, 마이페이지 구현 | [Glory](https://github.com/glorypang) |
| **조하영** | 로그인/로그아웃, 알림 기능 | [fanfanduck](https://github.com/fanfanduck) |
| **오혁신** | 예적금 상품 필터링/검색, 상품 비교 | [Hyukman818](https://github.com/Hyukman818) |
| **신예린** | 챗봇, 커뮤니티, 상품 비교 및 요약 AI 연동, CI/CD | [nyeroni](https://github.com/nyeroni) |
| **이주영** | WMTI 투자성향 분석, 맞춤 포트폴리오 추천 | [LeeJooYoung1999](https://github.com/LeeJooYoung1999) |
| **최혜림** | 프론트엔드 리더, 커뮤니티 구현, 공통 컴포넌트 개발, 프론트 배포 | [BaileyChoi](https://github.com/BaileyChoi) |

---

## 📆 개발 일정
- **07.09 ~ 07.14**: 프로젝트 제안 및 기획  
- **07.14 ~ 07.20**: ERD 설계, UI/UX 디자인, 구조 설계  
- **07.20 ~ 07.31**: 1차 개발 및 테스트  
- **07.31 ~ 08.14**: 2차 개발 및 테스트  
- **08.14 ~ 08.16**: 배포  
- **08.16 ~ 08.21**: 최종 QA 및 산출물 정리  

---

## ✨ 기대 효과
- 맞춤형 금융 추천으로 **정보 격차 해소**  
- 상품 비교 및 GPT 요약을 통한 **합리적 투자 판단 지원**  
- 커뮤니티 기능으로 **사용자 간 정보 교류**  
- 데이터 기반의 **개인화 인사이트 제공**  

---

## 📌 향후 계획
1. 예·적금뿐만 아니라 다양한 금융상품으로 확장  
2. 마이데이터 기반 자동화 (보유 자산 자동 수집/동기화)  
3. 금융 커뮤니티 확장 (투자 사례 공유, 금융 뉴스 요약 등)  
4. 모바일 앱/알림 기능 강화  

---
