/**
 * Public type entry point for Moduboard.
 * Import application contracts from `@/types` instead of individual module files.
 */
export * from "./moduboard-schema";
export type { Database, Json } from "./supabase";

import type {
  Attachment,
  GuestbookEntry,
  MindmapNode as StoredMindmapNode,
  MyRoomConfig,
  PostItCard,
  TongQuestion,
  UUID,
} from "./moduboard-schema";

/** Product-language compatibility names. */
export type Post = PostItCard;
export type DailyBalance = TongQuestion;
export type MyRoom = MyRoomConfig;
export type Guestbook = GuestbookEntry;

/** React Flow-compatible contracts without coupling the domain layer to a UI package. */
export interface MindmapNodeData extends Record<string, unknown> {
  label: string;
  color: string;
  authorId: UUID;
  attachmentIds?: UUID[];
}

export interface ReactFlowMindmapNode {
  id: UUID;
  type: "mindmapNode";
  position: { x: number; y: number };
  data: MindmapNodeData;
  parentId?: UUID;
  draggable?: boolean;
  selected?: boolean;
}

export interface ReactFlowMindmapEdge {
  id: UUID;
  source: UUID;
  target: UUID;
  type: "smoothstep" | "bezier";
  animated?: boolean;
  style?: { stroke?: string; strokeWidth?: number };
}

export interface Mindmap {
  boardId: UUID;
  rootNodeId: UUID;
  nodes: ReactFlowMindmapNode[];
  edges: ReactFlowMindmapEdge[];
  storedNodes?: StoredMindmapNode[];
  exportedImage?: Attachment;
}
