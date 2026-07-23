/** 포스트잇 기본 배경색 팔레트 */
export const POST_COLORS = [
  "#FEF3C7", // amber
  "#DBEAFE", // blue
  "#FCE7F3", // pink
  "#D1FAE5", // emerald
  "#E0E7FF", // indigo
  "#FFEDD5", // orange
] as const;

export const DEFAULT_POST_COLOR = POST_COLORS[0];

/** Supabase Storage 버킷명 */
export const POST_IMAGES_BUCKET = "board-images";

/** 보드 캔버스 기본 크기 (모바일 스크롤·드래그용) */
export const BOARD_CANVAS_WIDTH = 1600;
export const BOARD_CANVAS_HEIGHT = 2400;

/** 포스트잇 카드 크기 */
export const POST_CARD_WIDTH = 168;
export const POST_CARD_MIN_HEIGHT = 120;
