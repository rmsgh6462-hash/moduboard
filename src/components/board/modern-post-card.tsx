"use client";
import { useState } from "react";
import { FileText, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import type { Post } from "@/types/database";

type Props = { post: Post; onOpen?: (post: Post) => void };

function timeAgo(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric" }).format(new Date(value));
}

export function ModernPostCard({ post, onOpen }: Props) {
  const [liked, setLiked] = useState(false);
  const imageUrl = post.image_url || (post.attachment_type?.startsWith("image/") ? post.attachment_url : null);
  return (
    <article className="modern-post-card" style={{ backgroundColor: post.color || "#fff" }}>
      <header className="modern-post-header">
        <span className="modern-post-avatar">{post.author_name.slice(0, 1)}</span>
        <div><b>{post.author_name}</b><time dateTime={post.created_at}>{timeAgo(post.created_at)}</time></div>
        <button type="button" onClick={() => onOpen?.(post)} aria-label={`${post.author_name} 게시글 더보기`}><MoreHorizontal /></button>
      </header>
      <button type="button" className="modern-post-body" onClick={() => onOpen?.(post)}>
        {post.title ? <h3>{post.title}</h3> : null}
        {post.content ? <p>{post.content}</p> : null}
        {imageUrl ? <img src={imageUrl} alt={post.attachment_name || "첨부 이미지"} /> : null}
        {post.attachment_url && !imageUrl ? <a href={post.attachment_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}><FileText /><span>{post.attachment_name || "첨부파일 열기"}</span></a> : null}
      </button>
      <footer className="modern-post-footer">
        <button type="button" className={liked ? "liked" : ""} onClick={() => setLiked(!liked)} aria-label="공감"><Heart /> <span>{liked ? 1 : 0}</span></button>
        <button type="button" onClick={() => onOpen?.(post)} aria-label="댓글"><MessageCircle /> <span>0</span></button>
      </footer>
    </article>
  );
}
