import { AppShell } from "@/components/app-shell";
import { DebateModule } from "@/components/debate-module";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const profile = await requireProfile(); const supabase = await createClient(); const groupId = profile.group_id ?? profile.group?.id;
  const { data } = groupId ? await supabase.from("users").select("id,name,student_num").eq("group_id", groupId).eq("role", "student").order("student_num") : { data: [] };
  const students = (data ?? []).map((student) => ({ id: student.id, name: student.name, studentNum: student.student_num }));
  return <AppShell name={profile.name} role={profile.role}><DebateModule currentUser={{ id: profile.id, name: profile.name, studentNum: profile.student_num }} role={profile.role} students={students} groupId={groupId ?? "debate"} /></AppShell>;
}
