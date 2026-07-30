import { AppShell } from "@/components/app-shell";
import { DiscussionModule } from "@/components/discussion-module";
import { requireProfile } from "@/lib/auth/session";

export default async function Page() {
  const profile = await requireProfile();
  const groupId = profile.group_id ?? profile.group?.id ?? "discussion";
  return <AppShell name={profile.name} role={profile.role}><DiscussionModule currentUser={{ id: profile.id, name: profile.name, studentNum: profile.student_num }} role={profile.role} groupId={groupId} /></AppShell>;
}
