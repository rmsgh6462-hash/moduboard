-- 기둥형 보드 업그레이드: Supabase SQL Editor에서 한 번 실행하세요.
CREATE TABLE IF NOT EXISTS public.board_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 80),
  position integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS column_id uuid NULL REFERENCES public.board_columns(id) ON DELETE SET NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS attachment_url text NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS attachment_name text NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS attachment_type text NULL;
CREATE INDEX IF NOT EXISTS board_columns_board_idx ON public.board_columns(board_id, position);
CREATE INDEX IF NOT EXISTS posts_column_idx ON public.posts(column_id, created_at);
ALTER TABLE public.board_columns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "columns_select_members" ON public.board_columns;
CREATE POLICY "columns_select_members" ON public.board_columns FOR SELECT TO authenticated USING (public.is_group_member(public.board_group_id(board_id)));
DROP POLICY IF EXISTS "columns_teacher_insert" ON public.board_columns;
CREATE POLICY "columns_teacher_insert" ON public.board_columns FOR INSERT TO authenticated WITH CHECK (created_by=auth.uid() AND public.teaches_group(public.board_group_id(board_id)));
DROP POLICY IF EXISTS "columns_teacher_update" ON public.board_columns;
CREATE POLICY "columns_teacher_update" ON public.board_columns FOR UPDATE TO authenticated USING (public.teaches_group(public.board_group_id(board_id)));
DROP POLICY IF EXISTS "columns_teacher_delete" ON public.board_columns;
CREATE POLICY "columns_teacher_delete" ON public.board_columns FOR DELETE TO authenticated USING (public.teaches_group(public.board_group_id(board_id)));
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('board-files','board-files',true,20971520,NULL) ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=20971520,allowed_mime_types=NULL;
DROP POLICY IF EXISTS "board_files_select" ON storage.objects;
CREATE POLICY "board_files_select" ON storage.objects FOR SELECT USING(bucket_id='board-files');
DROP POLICY IF EXISTS "board_files_insert" ON storage.objects;
CREATE POLICY "board_files_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='board-files' AND public.is_group_member(((storage.foldername(name))[1])::uuid));
DROP POLICY IF EXISTS "board_files_delete" ON storage.objects;
CREATE POLICY "board_files_delete" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='board-files' AND (owner=auth.uid() OR public.teaches_group(((storage.foldername(name))[1])::uuid)));
