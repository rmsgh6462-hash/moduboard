import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, CheckCircle2, Clock3, LogIn, Sparkles } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentProfile } from "@/lib/auth/session";
import { ReorderableFeatureGrid } from "@/components/reorderable-feature-grid";

const navigation=[{href:"/boards",label:"게시판"},{href:"/vote",label:"투표"},{href:"/debate",label:"토론·토의"},{href:"/tong",label:"통·마이룸"}];
const activities=[
  {href:"/vote",type:"진행 중인 투표",title:"다음 현장체험학습 장소는 어디가 좋을까요?",meta:"오늘 오후 3시 마감",emoji:"🗳️",progress:68,tone:"blue"},
  {href:"/debate",type:"2단계 · 자료 모으기",title:"학교에서 휴대전화를 사용해도 될까요?",meta:"마감까지 45분",emoji:"⚔️",progress:42,tone:"rose"},
  {href:"/discussion",type:"1단계 · 의견 제출",title:"우리 교실을 더 즐겁게 만드는 방법",meta:"새 의견 7개",emoji:"💡",progress:25,tone:"yellow"},
] as const;

export default async function Home(){
  const profile=await getCurrentProfile();
  const classroom=profile?.group?`${profile.group.grade}학년 ${profile.group.class_num}반`:"우리 반";
  const identity=profile?`${profile.name} ${profile.role==="teacher"?"선생님":"학생"}`:"모두보드 친구";
  return <div className="dashboard-shell page-enter">
    <header className="dashboard-header"><div className="dashboard-header-inner">
      <Link href="/" className="dashboard-logo bounce-hover" aria-label="모두보드 메인"><span>모</span><b>모두보드</b><em>🏫</em></Link>
      <nav className="dashboard-nav" aria-label="주요 메뉴">{navigation.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav>
      <div className="dashboard-account">{profile?<><span className={`role-pill ${profile.role}`}><i>{profile.role==="teacher"?"🧑‍🏫":"🧒"}</i>{classroom} · {identity}</span><form action={logoutAction}><button type="submit" className="dashboard-logout">로그아웃</button></form></>:<Link href="/login" className="dashboard-login bounce-hover"><LogIn/>로그인</Link>}</div>
    </div></header>

    <main className="dashboard-main">
      <section className="welcome-card"><div className="welcome-copy"><span className="welcome-kicker"><Sparkles/>TODAY&apos;S CLASS</span><h1>반가워요, {profile?.name??"모두"}!</h1><p>오늘도 친구들과 생각을 나누고, 우리 반의 멋진 결정을 함께 만들어 보세요.</p><div className="welcome-tags"><span><CalendarDays/>오늘의 학급 활동</span><span><CheckCircle2/>참여할 활동 3개</span></div></div>
        <aside className="class-notice bounce-hover"><div><Bell/><span><small>선생님 알림</small><b>오늘의 학급 공지</b></span></div><p>토론 자료를 읽고 내 생각을 한 문장으로 정리해 보세요. 서로 다른 생각도 따뜻하게 존중해요!</p><span className="notice-doodle">🧑‍🏫</span></aside>
      </section>

      <section className="dashboard-section"><div className="dashboard-title"><div><span>EXPLORE TOGETHER</span><h2>오늘은 무엇을 해볼까요? ✨</h2></div><p>카드를 눌러 원하는 활동으로 바로 이동하세요.</p></div><ReorderableFeatureGrid isTeacher={profile?.role==="teacher"}/></section>

      <section className="dashboard-section activity-section"><div className="dashboard-title"><div><span>KEEP GOING</span><h2>지금 참여할 수 있어요 👋</h2></div><Link href="/boards">전체 활동 보기 <ArrowRight/></Link></div>
        <div className="recent-carousel">{activities.map(activity=><Link key={activity.title} href={activity.href} className={`recent-card ${activity.tone} bounce-hover`}><div className="recent-card-top"><span className="activity-emoji">{activity.emoji}</span><span className="live-dot">● {activity.type}</span></div><h3>{activity.title}</h3><div className="activity-meta"><Clock3/><span>{activity.meta}</span><b>{activity.progress}%</b></div><i><em style={{width:`${activity.progress}%`}}/></i></Link>)}</div>
      </section>
    </main><footer className="dashboard-footer"><b>모두보드 🏫</b><span>우리 반의 모든 생각이 반짝이는 곳</span></footer>
  </div>
}
