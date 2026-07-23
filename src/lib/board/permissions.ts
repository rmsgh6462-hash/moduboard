import type { Group, Post, UserProfile } from "@/types/database";

export function isGroupTeacher(
  profile: UserProfile,
  group: Group | null | undefined,
): boolean {
  return (
    profile.role === "teacher" &&
    !!group &&
    group.teacher_id === profile.id
  );
}

/** 본문·색·이미지 수정: 작성자만 */
export function canEditPost(
  profile: UserProfile,
  post: Pick<Post, "user_id">,
): boolean {
  return profile.id === post.user_id;
}

/** 삭제: 작성자 또는 담당 교사 */
export function canDeletePost(
  profile: UserProfile,
  post: Pick<Post, "user_id">,
  group: Group | null | undefined,
): boolean {
  return profile.id === post.user_id || isGroupTeacher(profile, group);
}

/** 이동: 작성자 또는 담당 교사 */
export function canMovePost(
  profile: UserProfile,
  post: Pick<Post, "user_id">,
  group: Group | null | undefined,
): boolean {
  return profile.id === post.user_id || isGroupTeacher(profile, group);
}
