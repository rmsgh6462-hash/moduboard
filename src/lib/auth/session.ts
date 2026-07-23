import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Group, UserProfile } from "@/types/database";

export type SessionProfile = UserProfile & {
  group: Group | null;
};

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  let group: Group | null = null;
  if (profile.group_id) {
    const { data: groupRow } = await supabase
      .from("groups")
      .select("*")
      .eq("id", profile.group_id)
      .maybeSingle();
    group = groupRow;
  } else if (profile.role === "teacher") {
    const { data: taught } = await supabase
      .from("groups")
      .select("*")
      .eq("teacher_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    group = taught;
  }

  return { ...profile, group };
}

export async function requireProfile(): Promise<SessionProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireTeacher(): Promise<SessionProfile> {
  const profile = await requireProfile();
  if (profile.role !== "teacher") redirect("/boards");
  return profile;
}
