import { POST_IMAGES_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

function extensionOf(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type.includes("heic") || file.type.includes("heif")) return "heic";
  return "jpg";
}

/**
 * board-images 버킷에 업로드. 경로: {groupId}/{boardId}/{userId}-{ts}.ext
 */
export async function uploadBoardImage(options: {
  file: File;
  groupId: string;
  boardId: string;
  userId: string;
}): Promise<{ publicUrl: string } | { error: string }> {
  const { file, groupId, boardId, userId } = options;

  if (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith("image/")) {
    return { error: "이미지 파일만 업로드할 수 있습니다." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "이미지는 5MB 이하만 업로드할 수 있습니다." };
  }

  const supabase = createClient();
  const ext = extensionOf(file);
  const path = `${groupId}/${boardId}/${userId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(POST_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(POST_IMAGES_BUCKET).getPublicUrl(path);

  return { publicUrl };
}
