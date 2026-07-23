-- =============================================================================
-- 모두보드 (Moduboard) — Supabase Schema
-- =============================================================================
-- 사용 방법:
--   1. Supabase Dashboard → SQL Editor → New query
--   2. 이 파일 전체 내용을 붙여넣기
--   3. Run (실행)
--
-- 주의:
--   - 기존 동일 테이블/정책이 있으면 충돌할 수 있습니다.
--   - 시드 계정 비밀번호는 테스트용입니다. 배포 전 변경하세요.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 0. 기존 객체 정리 (재실행 가능하도록)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "board_images_select" ON storage.objects;
DROP POLICY IF EXISTS "board_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "board_images_update" ON storage.objects;
DROP POLICY IF EXISTS "board_images_delete" ON storage.objects;

DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.boards CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP FUNCTION IF EXISTS public.current_user_profile();
DROP FUNCTION IF EXISTS public.is_teacher();
DROP FUNCTION IF EXISTS public.my_group_id();
DROP FUNCTION IF EXISTS public.teaches_group(uuid);
DROP FUNCTION IF EXISTS public.is_group_member(uuid);
DROP FUNCTION IF EXISTS public.board_group_id(uuid);

-- -----------------------------------------------------------------------------
-- 1. 테이블 생성
--    users ↔ groups 순환 FK이므로 먼저 테이블을 만든 뒤 FK를 추가합니다.
-- -----------------------------------------------------------------------------

-- 1-1. users (프로필) — auth.users 와 1:1
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('teacher', 'student')),
  group_id uuid NULL,
  student_num integer NULL,
  name text NOT NULL,
  gender text NULL CHECK (gender IS NULL OR gender IN ('M', 'F', 'other')),
  login_id text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_student_num_positive CHECK (
    student_num IS NULL OR student_num > 0
  )
);

CREATE UNIQUE INDEX users_login_id_key ON public.users (login_id)
  WHERE login_id IS NOT NULL;

CREATE INDEX users_group_id_idx ON public.users (group_id);
CREATE INDEX users_role_idx ON public.users (role);

COMMENT ON TABLE public.users IS '교사/학생 프로필 (auth.users 확장)';
COMMENT ON COLUMN public.users.login_id IS '학생 로그인 아이디 (표시·검색용)';

-- 1-2. groups (학급/그룹)
CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  school_name text NOT NULL,
  grade integer NOT NULL CHECK (grade BETWEEN 1 AND 12),
  class_num integer NOT NULL CHECK (class_num > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX groups_teacher_id_idx ON public.groups (teacher_id);
CREATE UNIQUE INDEX groups_school_grade_class_key
  ON public.groups (school_name, grade, class_num);

COMMENT ON TABLE public.groups IS '학교-학년-반 학급 그룹';

-- 순환 FK 연결
ALTER TABLE public.groups
  ADD CONSTRAINT groups_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.users (id) ON DELETE CASCADE;

ALTER TABLE public.users
  ADD CONSTRAINT users_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES public.groups (id) ON DELETE SET NULL;

-- 1-3. boards (게시판)
CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  group_id uuid NOT NULL REFERENCES public.groups (id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX boards_group_id_idx ON public.boards (group_id);
CREATE INDEX boards_created_by_idx ON public.boards (created_by);

COMMENT ON TABLE public.boards IS '학급 보드(패들렛)';

-- 1-4. posts (포스트잇)
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL DEFAULT '',
  image_url text NULL,
  color text NOT NULL DEFAULT '#FEF3C7',
  x_pos integer NOT NULL DEFAULT 40,
  y_pos integer NOT NULL DEFAULT 40,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_board_id_idx ON public.posts (board_id);
CREATE INDEX posts_user_id_idx ON public.posts (user_id);
CREATE INDEX posts_board_created_idx ON public.posts (board_id, created_at);

COMMENT ON TABLE public.posts IS '보드 위 포스트잇 카드';
COMMENT ON COLUMN public.posts.image_url IS 'Storage board-images 공개 URL (optional)';
COMMENT ON COLUMN public.posts.x_pos IS '캔버스 X 좌표(px)';
COMMENT ON COLUMN public.posts.y_pos IS '캔버스 Y 좌표(px)';

-- -----------------------------------------------------------------------------
-- 2. Realtime (포스트 추가/이동 즉시 반영)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.posts REPLICA IDENTITY FULL;

-- -----------------------------------------------------------------------------
-- 3. RLS 헬퍼 함수 (SECURITY DEFINER — 정책 내 재귀 방지)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_user_profile()
RETURNS public.users
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION public.my_group_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.teaches_group(target_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = target_group_id AND g.teacher_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_group_member(target_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND (
        u.group_id = target_group_id
        OR EXISTS (
          SELECT 1 FROM public.groups g
          WHERE g.id = target_group_id AND g.teacher_id = u.id
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.board_group_id(target_board_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM public.boards WHERE id = target_board_id;
$$;

GRANT EXECUTE ON FUNCTION public.current_user_profile() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_group_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.teaches_group(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.board_group_id(uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- ---- users ----
CREATE POLICY "users_select_own_or_same_group"
  ON public.users FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (
      group_id IS NOT NULL
      AND public.is_group_member(group_id)
    )
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.teacher_id = auth.uid() AND g.id = users.group_id
    )
  );

CREATE POLICY "users_insert_own_or_teacher_students"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR (
      public.is_teacher()
      AND role = 'student'
      AND group_id IS NOT NULL
      AND public.teaches_group(group_id)
    )
  );

CREATE POLICY "users_update_own_or_teacher"
  ON public.users FOR UPDATE TO authenticated
  USING (
    id = auth.uid()
    OR (
      public.is_teacher()
      AND group_id IS NOT NULL
      AND public.teaches_group(group_id)
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR (
      public.is_teacher()
      AND group_id IS NOT NULL
      AND public.teaches_group(group_id)
    )
  );

CREATE POLICY "users_delete_teacher_students"
  ON public.users FOR DELETE TO authenticated
  USING (
    public.is_teacher()
    AND role = 'student'
    AND group_id IS NOT NULL
    AND public.teaches_group(group_id)
  );

-- ---- groups ----
CREATE POLICY "groups_select_member"
  ON public.groups FOR SELECT TO authenticated
  USING (public.is_group_member(id));

CREATE POLICY "groups_insert_teacher"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (
    public.is_teacher()
    AND teacher_id = auth.uid()
  );

CREATE POLICY "groups_update_owner_teacher"
  ON public.groups FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "groups_delete_owner_teacher"
  ON public.groups FOR DELETE TO authenticated
  USING (teacher_id = auth.uid());

-- ---- boards ----
CREATE POLICY "boards_select_group_member"
  ON public.boards FOR SELECT TO authenticated
  USING (public.is_group_member(group_id));

CREATE POLICY "boards_insert_teacher"
  ON public.boards FOR INSERT TO authenticated
  WITH CHECK (
    public.teaches_group(group_id)
    AND created_by = auth.uid()
  );

CREATE POLICY "boards_update_teacher"
  ON public.boards FOR UPDATE TO authenticated
  USING (public.teaches_group(group_id))
  WITH CHECK (public.teaches_group(group_id));

CREATE POLICY "boards_delete_teacher"
  ON public.boards FOR DELETE TO authenticated
  USING (public.teaches_group(group_id));

-- ---- posts ----
CREATE POLICY "posts_select_group_member"
  ON public.posts FOR SELECT TO authenticated
  USING (
    public.is_group_member(public.board_group_id(board_id))
  );

CREATE POLICY "posts_insert_group_member"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_group_member(public.board_group_id(board_id))
  );

-- 작성자: 전체 수정 / 같은 학급: 위치(드래그) 수정 허용 / 담당 교사: 전체 수정
CREATE POLICY "posts_update_author_member_or_teacher"
  ON public.posts FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_group_member(public.board_group_id(board_id))
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_group_member(public.board_group_id(board_id))
  );

CREATE POLICY "posts_delete_author_or_teacher"
  ON public.posts FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.teaches_group(public.board_group_id(board_id))
  );

-- -----------------------------------------------------------------------------
-- 5. Storage 버킷: board-images (포스트잇 사진)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'board-images',
  'board-images',
  true,
  5242880, -- 5MB
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 경로 규칙: {group_id}/{board_id}/{filename}
-- 공개 읽기(모바일 <img> 표시), 쓰기는 해당 학급 멤버만
CREATE POLICY "board_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'board-images');

CREATE POLICY "board_images_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'board-images'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND public.is_group_member(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "board_images_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'board-images'
    AND public.is_group_member(((storage.foldername(name))[1])::uuid)
  )
  WITH CHECK (
    bucket_id = 'board-images'
    AND public.is_group_member(((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "board_images_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'board-images'
    AND (
      owner = auth.uid()
      OR public.teaches_group(((storage.foldername(name))[1])::uuid)
    )
  );

-- -----------------------------------------------------------------------------
-- 6. Seed — 테스트용 교사 / 학급 / 학생 / 보드 / 포스트
-- -----------------------------------------------------------------------------
-- 로그인 (Auth → Email):
--   교사  teacher01@moduboard.local  /  Teacher1234!
--   학생1 student01@moduboard.local  /  Student1234!
--   학생2 student02@moduboard.local  /  Student1234!
--   학생3 student03@moduboard.local  /  Student1234!
-- login_id: teacher01, student01, student02, student03
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  v_teacher_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  v_student1_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1';
  v_student2_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2';
  v_student3_id uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3';
  v_group_id uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  v_board_id uuid := 'dddddddd-dddd-dddd-dddd-dddddddddddd';
  v_instance_id uuid;
BEGIN
  SELECT id INTO v_instance_id FROM auth.instances LIMIT 1;
  IF v_instance_id IS NULL THEN
    v_instance_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  -- 기존 시드 정리 (재실행 안전)
  DELETE FROM auth.identities
  WHERE user_id IN (v_teacher_id, v_student1_id, v_student2_id, v_student3_id);
  DELETE FROM auth.users
  WHERE id IN (v_teacher_id, v_student1_id, v_student2_id, v_student3_id);

  -- auth.users: 교사
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    v_instance_id,
    v_teacher_id,
    'authenticated',
    'authenticated',
    'teacher01@moduboard.local',
    crypt('Teacher1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"김선생","role":"teacher"}'::jsonb,
    now(), now(), '', '', '', ''
  );

  -- auth.users: 학생 3명
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES
  (
    v_instance_id, v_student1_id, 'authenticated', 'authenticated',
    'student01@moduboard.local', crypt('Student1234!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"이민","role":"student"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    v_instance_id, v_student2_id, 'authenticated', 'authenticated',
    'student02@moduboard.local', crypt('Student1234!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"박서연","role":"student"}'::jsonb,
    now(), now(), '', '', '', ''
  ),
  (
    v_instance_id, v_student3_id, 'authenticated', 'authenticated',
    'student03@moduboard.local', crypt('Student1234!', gen_salt('bf')),
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"최준호","role":"student"}'::jsonb,
    now(), now(), '', '', '', ''
  );

  -- email 로그인용 identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES
  (
    v_teacher_id, v_teacher_id,
    format('{"sub":"%s","email":"%s","email_verified":true}', v_teacher_id, 'teacher01@moduboard.local')::jsonb,
    'email', v_teacher_id::text, now(), now(), now()
  ),
  (
    v_student1_id, v_student1_id,
    format('{"sub":"%s","email":"%s","email_verified":true}', v_student1_id, 'student01@moduboard.local')::jsonb,
    'email', v_student1_id::text, now(), now(), now()
  ),
  (
    v_student2_id, v_student2_id,
    format('{"sub":"%s","email":"%s","email_verified":true}', v_student2_id, 'student02@moduboard.local')::jsonb,
    'email', v_student2_id::text, now(), now(), now()
  ),
  (
    v_student3_id, v_student3_id,
    format('{"sub":"%s","email":"%s","email_verified":true}', v_student3_id, 'student03@moduboard.local')::jsonb,
    'email', v_student3_id::text, now(), now(), now()
  );

  -- 프로필: 교사 (그룹 생성 전)
  INSERT INTO public.users (id, role, group_id, student_num, name, gender, login_id)
  VALUES (v_teacher_id, 'teacher', NULL, NULL, '김선생', 'F', 'teacher01');

  -- 학급 그룹
  INSERT INTO public.groups (id, teacher_id, school_name, grade, class_num)
  VALUES (v_group_id, v_teacher_id, '모두초등학교', 5, 2);

  -- 교사 group_id 연결 + 학생 프로필
  UPDATE public.users SET group_id = v_group_id WHERE id = v_teacher_id;

  INSERT INTO public.users (id, role, group_id, student_num, name, gender, login_id)
  VALUES
    (v_student1_id, 'student', v_group_id, 1, '이민', 'M', 'student01'),
    (v_student2_id, 'student', v_group_id, 2, '박서연', 'F', 'student02'),
    (v_student3_id, 'student', v_group_id, 3, '최준호', 'M', 'student03');

  -- 샘플 보드
  INSERT INTO public.boards (id, title, group_id, created_by)
  VALUES (v_board_id, '우리 반 오늘 생각', v_group_id, v_teacher_id);

  -- 샘플 포스트잇
  INSERT INTO public.posts (
    board_id, user_id, author_name, content, color, x_pos, y_pos
  ) VALUES
  (
    v_board_id, v_teacher_id, '김선생',
    '자유롭게 의견을 붙여 보세요!', '#DBEAFE', 48, 64
  ),
  (
    v_board_id, v_student1_id, '이민',
    '오늘 체육이 제일 재미있었어요.', '#FEF3C7', 220, 120
  ),
  (
    v_board_id, v_student2_id, '박서연',
    '모둠 활동할 때 서로 도와주면 좋겠어요.', '#FCE7F3', 120, 280
  ),
  (
    v_board_id, v_student3_id, '최준호',
    '다음에 과학 실험도 하고 싶어요.', '#D1FAE5', 320, 240
  );
END $$;

-- =============================================================================
-- 완료 확인 쿼리 (선택 실행)
-- =============================================================================
-- SELECT role, login_id, name, student_num FROM public.users ORDER BY role, student_num NULLS FIRST;
-- SELECT school_name, grade, class_num FROM public.groups;
-- SELECT title FROM public.boards;
-- SELECT author_name, content, x_pos, y_pos FROM public.posts;
-- SELECT id, public, file_size_limit FROM storage.buckets WHERE id = 'board-images';
