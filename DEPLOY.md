# Vercel 배포 가이드 (모두보드)

Next.js 앱을 Vercel에 배포하고 Supabase와 연결하는 절차입니다.

---

## 1. 사전 준비

1. GitHub(또는 GitLab/Bitbucket)에 이 저장소를 푸시합니다.
2. [Vercel](https://vercel.com) 계정으로 로그인합니다.
3. Supabase 프로젝트에 `schema.sql`이 적용되어 있는지 확인합니다.
4. Supabase **Authentication → Providers → Email** 에서  
   - Email 로그인 활성화  
   - 학교 수업용이면 **Confirm email** 비활성화 권장  

---

## 2. 환경 변수 (필수)

Vercel 프로젝트 → **Settings → Environment Variables** 에 아래를 추가합니다.

| Name | Value | 비고 |
|------|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Project Settings → API → **Project URL** (`/rest/v1` 붙이지 말 것) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` (anon public) | 브라우저에 노출되어도 됨 (RLS로 보호) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (service_role) | **절대** `NEXT_PUBLIC_` 붙이지 말 것 |

- Environment: **Production / Preview / Development** 모두에 넣는 것을 권장합니다.
- `service_role` 키는 학생 일괄 생성(Admin API)에만 서버에서 사용됩니다.

로컬 `.env.local`과 동일한 값을 쓰면 됩니다.

---

## 3. Supabase Auth URL 설정 (배포 후)

배포 URL이 정해지면 Supabase Dashboard에서 허용 도메인을 등록합니다.

1. **Authentication → URL Configuration**
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs**에 추가:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (로컬 테스트용)

---

## 4. Realtime 확인

`schema.sql` 적용 시 `posts` 테이블이 Realtime publication에 포함됩니다.  
문제가 있으면 Dashboard에서 확인합니다.

1. **Database → Publications → `supabase_realtime`**
2. `posts` 테이블이 체크되어 있는지 확인
3. 또는 SQL Editor:

```sql
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

---

## 5. Vercel에 배포하기

### 방법 A — 대시보드

1. Vercel → **Add New → Project**
2. Git 저장소 Import
3. Framework Preset: **Next.js** (자동 감지)
4. Root Directory: `.` (기본)
5. 위에서 설정한 Environment Variables 입력
6. **Deploy**

### 방법 B — CLI

```bash
npm i -g vercel
vercel login
vercel
# 프로덕션
vercel --prod
```

CLI 사용 시에도 환경 변수는 대시보드에 미리 넣거나 `vercel env add`로 등록합니다.

---

## 6. 배포 후 스모크 테스트

1. `https://your-app.vercel.app/login` 접속
2. 시드/테스트 계정으로 로그인 (세션 쿠키 유지 확인)
3. 교사: 학급·학생·보드 생성
4. 학생: 보드 입장 → 포스트잇 작성·사진 업로드
5. **두 기기(또는 시크릿 창)** 로 같은 보드를 열어 Realtime 확인  
   - A에서 이동/작성 → B에 새로고침 없이 반영  
   - 좌측 상단 **실시간 연결** 뱃지 표시

---

## 7. 자주 나는 문제

| 증상 | 해결 |
|------|------|
| 로그인 후 바로 풀림 | Site URL / Redirect URLs에 Vercel 도메인 추가 |
| 학생 일괄 생성 실패 | `SUPABASE_SERVICE_ROLE_KEY` 미설정 또는 Production에만 빠진 경우 |
| 사진 업로드 실패 | Storage `board-images` 버킷·정책 확인, 파일 5MB 이하 |
| Realtime 미반영 | `posts` publication, RLS SELECT 권한, 브라우저 두 개 모두 로그인 상태인지 확인 |
| 빌드 실패 | `npm run build` 로컬 확인, Node 20+ 권장 (Vercel 기본 OK) |

---

## 8. 보안 체크리스트

- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 번들에 노출되지 않음 (`NEXT_PUBLIC_` 없음)
- [ ] RLS가 `users` / `groups` / `boards` / `posts` / Storage에 활성화됨
- [ ] 시드 계정 비밀번호를 운영 전에 변경 또는 삭제
- [ ] Vercel Preview에도 동일 env를 넣되, 가능하면 별도 Supabase 프로젝트 사용
