import { AppShell } from "@/components/app-shell";
import { ClassroomModule } from "@/components/classroom-module";
import { requireProfile } from "@/lib/auth/session";
export default async function Page(){const p=await requireProfile();return <AppShell name={p.name} role={p.role}><ClassroomModule kind="discussion" role={p.role}/></AppShell>;}