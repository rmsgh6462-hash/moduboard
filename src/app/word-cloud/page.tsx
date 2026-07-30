import { AppShell } from "@/components/app-shell";
import { WordCloudCenter } from "@/components/word-cloud-center";
import { requireProfile } from "@/lib/auth/session";

export default async function WordCloudPage(){const profile=await requireProfile();return <AppShell name={profile.name} role={profile.role}><WordCloudCenter currentUser={{id:profile.id,name:profile.name}} role={profile.role}/></AppShell>}
