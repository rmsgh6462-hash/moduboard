import type { GuestbookEntry, MyRoomUser } from "@/types/my-room";
export function canViewGuestbook(user: MyRoomUser, entry: GuestbookEntry) { return !entry.isSecret || user.id === entry.authorId || user.id === entry.targetUserId || user.role === "teacher"; }
