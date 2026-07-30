import { AppShell } from "@/components/app-shell";
import { TongCenter } from "@/components/tong-center";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function Page(){const p=await requireProfile();const s=await createClient();const groupId=p.group_id??p.group?.id;const{data}=groupId?await s.from("users").select("id,name,student_num").eq("group_id",groupId).eq("role","student").order("student_num"):{data:[]};const students=(data??[]).map((student)=>({id:student.id,name:student.name,studentNum:student.student_num}));const now=new Date();const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(now);const currentHour=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Seoul",hour:"2-digit",hourCycle:"h23"}).format(now));return <AppShell name={p.name} role={p.role}><TongCenter currentUser={{id:p.id,name:p.name,studentNum:p.student_num}} students={students} role={p.role} today={today} currentHour={currentHour}/></AppShell>;}
