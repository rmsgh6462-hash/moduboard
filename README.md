# 모두보드 (Moduboard)

교사 관리형 모바일 반응형 학급 패들렛(Padlet) 클론 웹앱입니다.

초등학교/중학교 수업에서 교사와 학생(최대 약 60명)이 PC·태블릿·스마트폰으로 실시간 의견을 공유합니다.

## Tech Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + Lucide React
- **Supabase** (Auth, PostgreSQL, Storage, Realtime)
- **@dnd-kit** (마우스 + 터치 드래그)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수

`.env.example`을 복사해 `.env.local`을 만들고 Supabase 값을 넣습니다.

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> `SUPABASE_SERVICE_ROLE_KEY`는 학생 일괄 생성에 필요합니다. Dashboard → **Project Settings → API → `service_role`** 에서 복사하세요.

### 3. 개발 서버

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 개발 단계

| 단계 | 내용 | 상태 |
|------|------|------|
| 1 | Next.js 세팅, Tailwind, dnd-kit, Supabase SDK | ✅ |
| 2 | `schema.sql` (DB, Storage, RLS, Seed) | ✅ |
| 3 | 그룹 생성 · 로그인 · 자동 세션 | ✅ |
| 4 | 터치 드래그 보드 · 사진 첨부 | ✅ |
| 5 | Realtime · 모바일 반응형 · 배포 가이드 | ✅ |

## 배포

Vercel 배포 절차·환경 변수·Auth URL·Realtime 확인은 **[DEPLOY.md](./DEPLOY.md)** 를 참고하세요.

## 프로젝트 구조

```
src/
  app/                 # App Router (홈, login, signup, teacher, boards, board)
  components/board/    # 캔버스, 포스트잇, 모달, 툴바
  hooks/               # Realtime 구독 훅
  lib/
    supabase/          # 브라우저·서버·Admin·미들웨어 클라이언트
    dnd/               # 터치/마우스 센서
    board/             # 권한 헬퍼
    storage/           # board-images 업로드
  types/database.ts
middleware.ts          # 세션 쿠키 자동 갱신
supabase/schema.sql
DEPLOY.md
```

## 스크립트

- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run start` — 프로덕션 실행
- `npm run lint` — ESLint

## Realtime 테스트 (로컬)

1. `npm run dev` 실행
2. 브라우저 A: 교사 로그인 → 보드 입장 (좌측 상단 **실시간 연결** 확인)
3. 브라우저 B(시크릿): 학생 로그인 → 같은 보드 입장
4. A에서 포스트잇 작성·이동·삭제 → B에 새로고침 없이 반영되는지 확인
