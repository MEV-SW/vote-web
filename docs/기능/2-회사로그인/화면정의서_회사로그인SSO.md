<!-- AI 지시문: 기능요청서를 입력으로 화면 목록과 화면별 구성·데이터·액션을 도출하라. 없는 화면을 지어내지 말 것.
     경로에 따라 쓰는 범위가 다르다 — 디자이너 경로면 색·간격·컴포넌트 스타일은 쓰지 않는다(디자이너의 일).
     클로드 직행이면 이 문서가 곧 생성 프롬프트이므로 디자인 시스템과 쓸 컴포넌트를 지목해야 한다.
     구성(정보 구조)은 두 경로 모두 필수다 — 안 적으면 사람이든 AI든 배치를 지어낸다. -->
# 화면정의서_회사로그인SSO

- 기능요청: [#2](https://github.com/MEV-SW/vote-web/issues/2)
- **디자인 경로**: 클로드 직행 (§2)
- 작성: 채윤성 / 승인: 미정
- **디자인 시스템**
  - Figma 라이브러리: 없음 (내부 도구, 기존 화면 스타일 재사용)
  - 코드 토큰·컴포넌트: `src/index.css`, `src/lib/oidc.ts`
  - 쓸 컴포넌트: `btn` / `cp-input` / `cp-field` / `LoginPage` / `AuthCallbackPage` / `SsoVerifyGate` / `VoteVerifyGate` — 새 부품을 만들지 않는다

API는 [vote-server API스펙_Keycloak앱접근](https://github.com/MEV-SW/vote-server/blob/main/docs/기능/3-Keycloak/API스펙_Keycloak앱접근.md). Blocked by server #3.

## 화면 목록
| # | 화면명 | 진입 경로 | 비고 |
|---|---|---|---|
| 1 | 호스트 로그인 | `/admin/login` | 회사 계정 버튼 + 로컬(설정 시) |
| 2 | OIDC 콜백 | `/auth/callback` | 토큰 저장 후 `/admin` 또는 투표 복귀 |
| 3 | 제한 참여 게이트 | `/polls/:pollId` | `verify_method=sso`이면 SSO 게이트 |

## 화면별 정의
### 1. 호스트 로그인
- **구성**:
  ```
  카드  안내 문구
        회사 계정으로 로그인 버튼 (oidc_enabled)
        또는
        아이디 · 비밀번호 · 로그인 (local_enabled)
  ```
- **표시 데이터**: `GET /admin/auth/config`
- **액션**: 회사 계정 → IdP. 로컬 → `POST /admin/login` → `/admin`
- **상태**: 불러오는 중 / 설정 실패 시 로컬 폼만 / 403은 앱 접근 없음 문구. 로컬 비활성이면 아이디 폼 없음
- **권한**: 누구나

### 2. OIDC 콜백
- **구성**:
  ```
  본문  처리 중 문구 또는 오류
  ```
- **표시 데이터**: 없음
- **액션**: 코드를 토큰으로 바꾼 뒤 만들기 화면 또는 참여 화면으로 이동
- **상태**: 처리 중 / 오류. 성공과 오류는 구분
- **권한**: IdP에서 돌아온 세션

### 3. 제한 참여 게이트
- **구성**:
  ```
  PIN이면 기존 VoteVerifyGate
  SSO이면 SsoVerifyGate — 회사 계정으로 확인 버튼
  ```
- **표시 데이터**: `poll.verify_method`
- **액션**: SSO → IdP → `POST /polls/{id}/verify-sso` → 투표/폼 본문
- **상태**: 게이트 / 본문. 자격 실패 오류
- **권한**: 제한 항목 대상자
