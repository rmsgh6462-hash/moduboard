"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Camera, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import {
  createPostAction,
  deletePostAction,
  updatePostAction,
} from "@/app/actions/posts";
import { POST_COLORS } from "@/lib/constants";
import { uploadBoardFile } from "@/lib/storage/upload-board-file";
import type { Post } from "@/types/database";

type Props = {
  open: boolean;
  mode: "create" | "edit" | "view";
  boardId: string;
  groupId: string;
  userId: string;
  post?: Post | null;
  canEdit: boolean;
  canDelete: boolean;
  initialX?: number;
  initialY?: number;
  initialMedia?: { url: string; type: "image" | "video" | "mindmap"; name?: string } | null;
  onClose: () => void;
  onSaved: (post: Post) => void;
  onDeleted: (postId: string) => void;
};

export function PostModal({
  open,
  mode,
  boardId,
  groupId,
  userId,
  post,
  canEdit,
  canDelete,
  initialX,
  initialY,
  initialMedia,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const titleId = useId();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string>(POST_COLORS[0]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "mindmap" | null>(null);
  const [mediaPosition, setMediaPosition] = useState<"top" | "bottom">("bottom");
  const [mediaName, setMediaName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  const readOnly = mode === "view" || (mode === "edit" && !canEdit);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (post) {
      setTitle(post.title ?? "");
      setContent(post.content);
      setColor(post.color);
      setImageUrl(post.image_url || post.attachment_url);
      setMediaType(post.media_type || (post.attachment_type?.startsWith("video/") ? "video" : post.image_url || post.attachment_url ? "image" : null));
      setMediaPosition(post.media_position || "bottom");
      setMediaName(post.attachment_name);
    } else {
      setTitle("");
      setContent("");
      setColor(POST_COLORS[Math.floor(Math.random() * POST_COLORS.length)]);
      setImageUrl(initialMedia?.url ?? null);
      setMediaType(initialMedia?.type ?? null);
      setMediaName(initialMedia?.name ?? null);
      setMediaPosition("bottom");
    }
  }, [open, post, initialMedia]);

  if (!open) return null;

  async function handleFile(file: File | undefined) {
    if (!file || readOnly) return;
    setUploading(true);
    setError(null);
    const result = await uploadBoardFile({
      file,
      groupId,
      boardId,
      userId,
    });
    setUploading(false);
    if ("error" in result) {
      setError(result.error ?? "첨부파일 업로드에 실패했습니다.");
      return;
    }
    setImageUrl(result.publicUrl);
    setMediaType(file.type.startsWith("video/") ? "video" : "image");
    setMediaName(result.name);
  }

  function handleSave() {
    setError(null);
    if (!title.trim()) { setError("제목을 입력해 주세요."); return; }
    startTransition(async () => {
      if (mode === "create") {
        const result = await createPostAction({
          boardId,
          title,
          content,
          color,
          imageUrl,
          mediaType,
          mediaPosition,
          attachmentName: mediaName,
          attachmentType: mediaType === "video" ? "video/mp4" : mediaType ? "image/png" : null,
          xPos: initialX,
          yPos: initialY,
        });
        if (!result.ok || !result.post) {
          setError(result.message ?? "저장에 실패했습니다.");
          return;
        }
        onSaved(result.post);
        onClose();
        return;
      }

      if (!post) return;
      const result = await updatePostAction({
        postId: post.id,
        boardId,
        title,
          content,
        color,
        imageUrl,
        mediaType,
        mediaPosition,
      });
      if (!result.ok || !result.post) {
        setError(result.message ?? "수정에 실패했습니다.");
        return;
      }
      onSaved(result.post);
      onClose();
    });
  }

  function handleDelete() {
    if (!post || !canDelete) return;
    if (!confirm("이 포스트잇을 삭제할까요?")) return;
    startTransition(async () => {
      const result = await deletePostAction({
        postId: post.id,
        boardId,
      });
      if (!result.ok) {
        setError(result.message ?? "삭제에 실패했습니다.");
        return;
      }
      onDeleted(post.id);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="flex max-h-[min(92dvh,100%)] w-full max-w-lg flex-col rounded-t-3xl bg-surface shadow-xl sm:rounded-3xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-lg font-bold">
            {mode === "create"
              ? "포스트잇 작성"
              : readOnly
                ? "포스트잇 보기"
                : "포스트잇 수정"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="touch-target inline-flex items-center justify-center rounded-xl"
            aria-label="닫기"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 pb-[calc(1rem+var(--safe-bottom))]">
          {post ? (
            <p className="text-xs text-muted">작성자 · {post.author_name}</p>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">제목 <b className="text-red-500">필수</b></span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={readOnly}
              required
              maxLength={100}
              placeholder="글 제목을 입력하세요"
              className="touch-target w-full rounded-2xl border border-border px-4 text-base font-semibold outline-none ring-brand focus:ring-2 read-only:bg-background"
            />
          </label>


          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">내용</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              readOnly={readOnly}
              rows={5}
              placeholder="의견을 적어 보세요"
              className="min-h-28 w-full rounded-2xl border border-border px-4 py-3 text-base outline-none ring-brand focus:ring-2 read-only:bg-background"
            />
          </label>

          {!readOnly ? (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">색상</span>
              <div className="flex flex-wrap gap-2">
                {POST_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`색상 ${c}`}
                    onClick={() => setColor(c)}
                    className={`size-10 rounded-full border-2 ${
                      color === c ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">첨부 매체</span>
            {imageUrl ? (
              <div className="relative overflow-hidden rounded-2xl border border-border">
                {mediaType === "video" ? <video src={imageUrl} controls className="max-h-56 w-full bg-black object-contain" /> : <img
                  src={imageUrl}
                  alt={mediaType === "mindmap" ? "첨부한 생각 그물" : "첨부 사진"}
                  className="max-h-56 w-full object-contain"
                />}
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => { setImageUrl(null); setMediaType(null); setMediaName(null); }}
                    className="absolute right-2 top-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white"
                  >
                    첨부 제거
                  </button>
                ) : null}
              </div>
            ) : null}

            {!readOnly ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => cameraInputRef.current?.click()}
                  className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm font-semibold"
                >
                  <Camera className="size-4" aria-hidden />
                  카메라
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => galleryInputRef.current?.click()}
                  className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-background text-sm font-semibold"
                >
                  <ImagePlus className="size-4" aria-hidden />
                  이미지 · 동영상
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            ) : null}
            {uploading ? (
              <p className="flex items-center gap-2 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                첨부파일 업로드 중…
              </p>
            ) : null}
          </div>

          {imageUrl ? <fieldset className="rounded-2xl border border-border p-3"><legend className="px-1 text-sm font-medium">매체 배치 위치</legend><div className="grid grid-cols-2 gap-2">{([['top','글 위에 배치'],['bottom','글 아래에 배치']] as const).map(([value,label])=><label key={value} className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm ${mediaPosition===value?'border-brand bg-indigo-50 font-bold text-brand':'border-border'}`}><input className="sr-only" type="radio" name="mediaPosition" value={value} checked={mediaPosition===value} disabled={readOnly} onChange={()=>setMediaPosition(value)}/>{label}</label>)}</div></fieldset> : null}

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 pt-1">
            {!readOnly ? (
              <button
                type="button"
                disabled={pending || uploading}
                onClick={handleSave}
                className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl bg-brand font-semibold text-white disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                ) : null}
                {mode === "create" ? "붙이기" : "저장"}
              </button>
            ) : null}

            {canDelete && post ? (
              <button
                type="button"
                disabled={pending}
                onClick={handleDelete}
                className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 text-sm font-semibold text-red-600"
              >
                <Trash2 className="size-4" aria-hidden />
                삭제
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
