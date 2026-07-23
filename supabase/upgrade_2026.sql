-- Run once in Supabase SQL Editor for the 2026 upgrade.
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS layout text NOT NULL DEFAULT 'brick';
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS sort_order text NOT NULL DEFAULT 'newest';
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS is_hidden boolean NOT NULL DEFAULT false;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS audience_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS allow_video boolean NOT NULL DEFAULT true;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS allow_pdf boolean NOT NULL DEFAULT true;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS allow_hwp boolean NOT NULL DEFAULT true;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS allow_image boolean NOT NULL DEFAULT true;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS allow_comments boolean NOT NULL DEFAULT true;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS allow_likes boolean NOT NULL DEFAULT true;
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS background text NOT NULL DEFAULT 'mint';
ALTER TABLE public.boards ADD COLUMN IF NOT EXISTS thumbnail_url text NULL;
