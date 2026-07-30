export type RoomItemType = "background" | "character" | "bed" | "desk" | "wall" | "doorTheme";
export interface MyRoomUser { id: string; name: string; role: "teacher" | "student"; points: number; inventory: string[]; }
export interface PointGrant { id: string; studentId: string; amount: number; reason: string; createdAt: string; }
export interface MyRoomConfig { backgroundId: string; characterId: string; placedItems: Record<string, string>; doorTitle: string; doorTheme: string; }
export interface GuestbookEntry { id: string; targetUserId: string; authorId: string; authorName: string; content: string; isSecret: boolean; createdAt: string; }
export interface RoomStoreItem { id: string; name: string; type: RoomItemType; price: number; emoji: string; color: string; }
export type PointActivity = "attendance" | "vote" | "debatePost" | "discussionPost" | "comment";
