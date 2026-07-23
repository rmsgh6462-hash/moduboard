"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus, Radio } from "lucide-react";
import { updatePostPositionAction } from "@/app/actions/posts";
import { PostCard } from "@/components/board/post-card";
import { PostModal } from "@/components/board/post-modal";
import {
  canDeletePost,
  canEditPost,
  canMovePost,
} from "@/lib/board/permissions";
import {
  BOARD_CANVAS_HEIGHT,
  BOARD_CANVAS_WIDTH,
  POST_CARD_WIDTH,
} from "@/lib/constants";
import { useBoardSensors } from "@/lib/dnd/sensors";
import { useBoardPostsRealtime } from "@/hooks/use-board-posts-realtime";
import type { Group, Post, UserProfile } from "@/types/database";

type Props = {
  boardId: string;
  boardTitle: string;
  group: Group;
  profile: UserProfile;
  initialPosts: Post[];
};

type ModalState =
  | { open: false }
  | {
      open: true;
      mode: "create" | "edit" | "view";
      post?: Post | null;
      initialX?: number;
      initialY?: number;
    };

export function BoardCanvas({
  boardId,
  boardTitle,
  group,
  profile,
  initialPosts,
}: Props) {
  const sensors = useBoardSensors();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const draggingIdRef = useRef<string | null>(null);

  const realtimeStatus = useBoardPostsRealtime(setPosts, {
    boardId,
    draggingIdRef,
  });

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const activePost = useMemo(
    () => posts.find((p) => p.id === activeId) ?? null,
    [posts, activeId],
  );

  const openCreate = useCallback(() => {
    const viewport = document.getElementById("board-scroll");
    const scrollLeft = viewport?.scrollLeft ?? 0;
    const scrollTop = viewport?.scrollTop ?? 0;
    const cardWidth =
      typeof window !== "undefined" && window.innerWidth < 640
        ? 148
        : POST_CARD_WIDTH;
    setModal({
      open: true,
      mode: "create",
      post: null,
      initialX: Math.min(
        scrollLeft + 40,
        BOARD_CANVAS_WIDTH - cardWidth - 16,
      ),
      initialY: Math.min(scrollTop + 72, BOARD_CANVAS_HEIGHT - 160),
    });
  }, []);

  const openPost = useCallback(
    (post: Post) => {
      const editable = canEditPost(profile, post);
      setModal({
        open: true,
        mode: editable ? "edit" : "view",
        post,
      });
    },
    [profile],
  );

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    draggingIdRef.current = id;
    setActiveId(id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const id = String(active.id);
    setActiveId(null);
    draggingIdRef.current = null;

    if (delta.x === 0 && delta.y === 0) return;

    const current = posts.find((p) => p.id === id);
    if (!current) return;
    if (!canMovePost(profile, current, group)) return;

    const cardWidth =
      typeof window !== "undefined" && window.innerWidth < 640
        ? 148
        : POST_CARD_WIDTH;

    const nextX = Math.max(
      0,
      Math.min(
        BOARD_CANVAS_WIDTH - cardWidth,
        Math.round(current.x_pos + delta.x),
      ),
    );
    const nextY = Math.max(
      0,
      Math.min(
        BOARD_CANVAS_HEIGHT - 40,
        Math.round(current.y_pos + delta.y),
      ),
    );

    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, x_pos: nextX, y_pos: nextY } : p,
      ),
    );

    void updatePostPositionAction({
      postId: id,
      boardId,
      xPos: nextX,
      yPos: nextY,
    });
  }

  function handleDragCancel() {
    setActiveId(null);
    draggingIdRef.current = null;
  }

  const liveLabel =
    realtimeStatus === "live"
      ? "실시간 연결"
      : realtimeStatus === "connecting"
        ? "연결 중…"
        : "오프라인";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        className={`pointer-events-none absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur-md sm:left-4 sm:top-4 ${
          realtimeStatus === "live"
            ? "bg-emerald-500/90 text-white"
            : realtimeStatus === "connecting"
              ? "bg-amber-400/90 text-amber-950"
              : "bg-zinc-500/90 text-white"
        }`}
        aria-live="polite"
      >
        <Radio className="size-3" aria-hidden />
        {liveLabel}
      </div>

      <div
        id="board-scroll"
        className="board-viewport min-h-0 flex-1 overflow-auto overscroll-contain bg-[radial-gradient(#d8ebe6_1px,transparent_1px)] [background-size:16px_16px] sm:[background-size:18px_18px]"
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            className="board-canvas relative"
            style={{
              width: BOARD_CANVAS_WIDTH,
              height: BOARD_CANVAS_HEIGHT,
            }}
          >
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                disabled={!canMovePost(profile, post, group)}
                onOpen={openPost}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={null}>
            {activePost ? (
              <div
                className="post-card-shell rounded-xl border border-black/10 shadow-lg"
                style={{
                  width: "var(--post-card-w)",
                  backgroundColor: activePost.color,
                  padding: "10px 12px",
                }}
              >
                <p className="mb-1 text-[11px] font-medium text-black/55">
                  {activePost.author_name}
                </p>
                <p className="line-clamp-4 whitespace-pre-wrap text-sm">
                  {activePost.content}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <button
        type="button"
        onClick={openCreate}
        className="fab-add touch-target absolute z-30 inline-flex items-center justify-center rounded-full bg-brand text-white shadow-lg"
        aria-label="포스트잇 추가"
      >
        <Plus className="size-7" aria-hidden />
      </button>

      <PostModal
        open={modal.open}
        mode={modal.open ? modal.mode : "create"}
        boardId={boardId}
        groupId={group.id}
        userId={profile.id}
        post={modal.open ? modal.post : null}
        canEdit={
          modal.open && modal.post
            ? canEditPost(profile, modal.post)
            : modal.open && modal.mode === "create"
        }
        canDelete={
          modal.open && modal.post
            ? canDeletePost(profile, modal.post, group)
            : false
        }
        initialX={modal.open ? modal.initialX : undefined}
        initialY={modal.open ? modal.initialY : undefined}
        onClose={() => setModal({ open: false })}
        onSaved={(saved) => {
          setPosts((prev) => {
            const exists = prev.some((p) => p.id === saved.id);
            if (exists) {
              return prev.map((p) => (p.id === saved.id ? saved : p));
            }
            return [...prev, saved];
          });
        }}
        onDeleted={(postId) => {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }}
      />

      <span className="sr-only">{boardTitle}</span>
    </div>
  );
}
