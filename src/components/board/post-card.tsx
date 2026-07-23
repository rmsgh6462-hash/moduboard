"use client";

import type { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Post } from "@/types/database";

type Props = {
  post: Post;
  disabled: boolean;
  onOpen: (post: Post) => void;
};

export function PostCard({ post, disabled, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: post.id,
      disabled,
      data: { post },
    });

  const style: CSSProperties = {
    position: "absolute",
    left: post.x_pos,
    top: post.y_pos,
    width: "var(--post-card-w)",
    minHeight: "var(--post-card-min-h)",
    backgroundColor: post.color,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 40 : 1,
    opacity: isDragging ? 0.35 : 1,
    touchAction: disabled ? "auto" : "none",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="post-card flex flex-col overflow-hidden rounded-xl border border-black/5 shadow-md transition-shadow"
    >
      <div
        className={`flex items-center gap-1 border-b border-black/5 px-2 py-1.5 text-[11px] font-medium text-black/55 sm:py-1.5 ${
          disabled ? "" : "cursor-grab active:cursor-grabbing"
        }`}
        {...(disabled ? {} : listeners)}
        {...(disabled ? {} : attributes)}
      >
        {!disabled ? (
          <GripVertical className="size-3.5 shrink-0" aria-hidden />
        ) : (
          <span className="size-3.5" />
        )}
        <span className="truncate">{post.author_name}</span>
      </div>

      <button
        type="button"
        onClick={() => onOpen(post)}
        className="flex flex-1 flex-col gap-1.5 px-2.5 py-2 text-left sm:gap-2 sm:px-3"
      >
        {post.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image_url}
            alt=""
            className="h-20 w-full rounded-lg object-cover sm:h-24"
            draggable={false}
          />
        ) : null}
        <p className="whitespace-pre-wrap break-words text-[13px] leading-snug text-foreground sm:text-sm">
          {post.content || (post.image_url ? "(사진)" : "")}
        </p>
      </button>
    </article>
  );
}
