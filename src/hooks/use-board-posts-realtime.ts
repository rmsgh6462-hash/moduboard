"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types/database";

export type RealtimeStatus = "connecting" | "live" | "offline";

type Options = {
  boardId: string;
  enabled?: boolean;
  /** 드래그 중인 포스트 ID — 원격 위치 반영을 잠시 건너뜁니다 */
  draggingIdRef?: MutableRefObject<string | null>;
};

/**
 * posts 테이블 Realtime 구독.
 * INSERT / UPDATE / DELETE를 로컬 상태에 병합합니다.
 */
export function useBoardPostsRealtime(
  setPosts: Dispatch<SetStateAction<Post[]>>,
  { boardId, enabled = true, draggingIdRef }: Options,
) {
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const boardIdRef = useRef(boardId);
  boardIdRef.current = boardId;

  useEffect(() => {
    if (!enabled) {
      setStatus("offline");
      return;
    }

    const supabase = createClient();
    setStatus("connecting");

    const channel = supabase
      .channel(`board-posts:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as Post;
            if (row.board_id !== boardIdRef.current) return;
            setPosts((prev) => {
              if (prev.some((p) => p.id === row.id)) {
                return prev.map((p) => (p.id === row.id ? row : p));
              }
              return [...prev, row];
            });
            return;
          }

          if (payload.eventType === "UPDATE") {
            const row = payload.new as Post;
            if (row.board_id !== boardIdRef.current) return;
            setPosts((prev) =>
              prev.map((p) => {
                if (p.id !== row.id) return p;
                // 내가 드래그 중이면 원격 x/y는 무시하고 나머지 필드만 반영
                if (draggingIdRef?.current === row.id) {
                  return {
                    ...row,
                    x_pos: p.x_pos,
                    y_pos: p.y_pos,
                  };
                }
                return row;
              }),
            );
            return;
          }

          if (payload.eventType === "DELETE") {
            const row = payload.old as Pick<Post, "id">;
            setPosts((prev) => prev.filter((p) => p.id !== row.id));
          }
        },
      )
      .subscribe((subscribeStatus) => {
        if (subscribeStatus === "SUBSCRIBED") {
          setStatus("live");
        } else if (
          subscribeStatus === "CHANNEL_ERROR" ||
          subscribeStatus === "TIMED_OUT" ||
          subscribeStatus === "CLOSED"
        ) {
          setStatus("offline");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [boardId, enabled, setPosts, draggingIdRef]);

  return status;
}
