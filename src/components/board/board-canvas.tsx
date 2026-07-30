"use client";
import { useCallback, useRef, useState } from "react";
import { Plus, Radio } from "lucide-react";
import { ModernPostCard } from "@/components/board/modern-post-card";
import { PostModal } from "@/components/board/post-modal";
import { canDeletePost, canEditPost } from "@/lib/board/permissions";
import { useBoardPostsRealtime } from "@/hooks/use-board-posts-realtime";
import type { Group, Post, UserProfile } from "@/types/database";

type Props = { boardId: string; boardTitle: string; group: Group; profile: UserProfile; initialPosts: Post[] };
type ModalState = { open: false } | { open: true; mode: "create" | "edit" | "view"; post?: Post | null };

export function BoardCanvas({ boardId, boardTitle, group, profile, initialPosts }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const draggingIdRef = useRef<string | null>(null);
  const realtimeStatus = useBoardPostsRealtime(setPosts, { boardId, draggingIdRef });
  const openPost = useCallback((post: Post) => setModal({ open: true, mode: canEditPost(profile, post) ? "edit" : "view", post }), [profile]);
  const liveLabel = realtimeStatus === "live" ? "실시간 연결" : realtimeStatus === "connecting" ? "연결 중…" : "오프라인";
  return (
    <div className="masonry-board-shell">
      <div className={`masonry-live ${realtimeStatus}`}><Radio />{liveLabel}</div>
      <div className="masonry-board-heading"><div><span>GRID BOARD</span><h2>{boardTitle}</h2></div><p>카드 높이에 맞춰 빈틈없이 정리되는 벽돌형 보드입니다.</p></div>
      {posts.length ? <section className="masonry-grid" aria-label={`${boardTitle} 게시글`}>
        {posts.map((post) => <div className="masonry-item" key={post.id}><ModernPostCard post={post} onOpen={openPost} /></div>)}
      </section> : <div className="masonry-empty"><h3>첫 번째 생각을 붙여 보세요</h3><p>오른쪽 아래 + 버튼을 누르면 새 포스트잇을 작성할 수 있어요.</p></div>}
      <button type="button" onClick={() => setModal({ open: true, mode: "create", post: null })} className="fab-add masonry-fab" aria-label="포스트잇 추가"><Plus /></button>
      <PostModal open={modal.open} mode={modal.open ? modal.mode : "create"} boardId={boardId} groupId={group.id} userId={profile.id} post={modal.open ? modal.post : null} canEdit={modal.open && modal.post ? canEditPost(profile, modal.post) : modal.open && modal.mode === "create"} canDelete={modal.open && modal.post ? canDeletePost(profile, modal.post, group) : false} onClose={() => setModal({ open: false })} onSaved={(saved) => setPosts((prev) => prev.some((p) => p.id === saved.id) ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev])} onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))} />
    </div>
  );
}
