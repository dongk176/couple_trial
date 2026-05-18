# 커플재판 웹앱 MVP

커플재판은 공개 연애 사건을 읽고 배심원으로 투표한 뒤, 투표가 종료되면 AI mock 판결문과 형량을 생성하는 모바일 우선 웹앱 MVP입니다. 네이티브 앱, React Native, Expo, Flutter를 사용하지 않았고 Next.js App Router 기반 웹앱으로 구현했습니다.

## 기술 스택

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Supabase Postgres
- bcryptjs 기반 bcrypt 해시
- httpOnly cookie session
- lucide-react

## 실행 방법

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

환경 변수는 `bogopa_mvp`와 같은 변수명을 사용합니다. 현재 워크스페이스의 `.env`는 `/Users/gimdongmin/bogopa_mvp/.env.local`에서 복사되어 있으며, Prisma는 Supabase Postgres의 `couple_court` schema만 사용합니다. `public` schema에는 커플재판 테이블을 만들지 않습니다.

```bash
cp /Users/gimdongmin/bogopa_mvp/.env.local .env
```

데모 계정:

- 아이디: `minji`
- 비밀번호: `demo1234`

관리자 페이지:

- URL: `/admin?secret=<NEXTAUTH_SECRET 또는 COUPLE_COURT_ADMIN_SECRET>`

## 주요 기능

- 온보딩, 회원가입, 로그인, 로그아웃
- httpOnly 쿠키 기반 로그인 유지
- 아이디 중복 체크 및 비밀번호 해시 저장
- 기본 프로필 이미지 4종 선택
- 공개 사건 피드와 인기 사건 리스트
- 커플 초대코드 생성 및 연결
- 커플 연결 후 공개 사건 등록
- mock AI 사건 요약 생성
- 사건 상세, 신고, 유저 차단
- 배심 투표 중복 방지
- 사건당 최대 100명 투표 제한
- 투표 기한 또는 100명 달성 시 마감
- mock AI 최종 판결문 생성
- 판결 결과 프로필 반영
- 징역 프로필, 배심 배지, 활동 기록
- 알림 목록과 모두 읽음
- ADMIN_SECRET 기반 간단 관리자 신고 처리

## iOS 1.0 심사용 안전 경로

App Store 1차 심사용 WKWebView는 전체 웹앱이 아니라 아래 읽기 전용 경로를 시작 URL로 사용합니다.

- 시작 URL: `/ios-review`
- 공개 사건 읽기 전용: `/ios-review/cases`
- 판결 결과 예시: `/ios-review/verdict`
- 개인정보 처리방침: `/privacy`
- 고객지원: `/support`
- 이용약관: `/terms`

iOS 1.0 심사용 경로에서는 카메라 촬영, 사진 업로드, 댓글/답글, 사건 등록, 구독/IAP, 푸시 알림, 외부 AI 개인정보 전송, 사용자 추적을 제공하지 않습니다. 회원가입을 `?ios_review=1`로 열 경우 프로필 파일 업로드 입력도 숨깁니다.

## 데이터베이스

- provider: `postgresql`
- schema: `couple_court`
- env: `DATABASE_URL`, `DIRECT_URL`
- 테이블: `couple_court."User"`, `couple_court."Case"`, `couple_court."Vote"` 등
- Supabase에서는 `npx prisma db push`로 `couple_court` schema에 반영합니다.

## 시드 데이터

시드에는 바로 데모 가능한 데이터가 포함되어 있습니다.

- 주요 데모 유저 4명과 배심 투표용 유저
- 커플 1쌍
- 공개 사건 6개
- 일부 사건의 20명 이상 투표 데이터
- 판결 완료 사건 2개
- 알림, 신고, 판결 기록 일부

## 참고

이 MVP의 AI 로직은 외부 API를 호출하지 않습니다. `lib/ai.ts`에 템플릿 기반 `generateCaseSummary`와 `generateVerdict`를 분리해 두었기 때문에 추후 LLM API로 교체하기 쉽습니다.
