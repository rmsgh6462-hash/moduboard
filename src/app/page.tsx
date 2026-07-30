import Link from "next/link";
import { ArrowRight, Bell, CalendarDays, CheckCircle2, Clock3, LayoutGrid, Lightbulb, LogIn, MessageSquareText, Sparkles, Vote } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentProfile } from "@/lib/auth/session";
import { ReorderableFeatureGrid } from "@/components/reorderable-feature-grid";

const features = [
  { href: "/boards", icon: LayoutGrid, emoji: "📌", title: "모두의 게시판", description: "기둥형·벽돌형 포스트잇에 생각을 자유롭게 붙여요.", tone: "mint" },
  { href: "/vote", icon: Vote, emoji: "🗳️", title: "모두의 투표", description: "친구들과 쉽고 재미있게 우리 반의 선택을 모아요.", tone: "yellow" },
  { href: "/debate", icon: MessageSquareText, emoji: "⚔️", title: "모두의 토론", description: "찬성과 반대 팀이 근거를 모아 단계별로 토론해요.", tone: "rose" },
  { href: "/discussion", icon: Lightbulb, emoji: "💡", title: "모두의 토의", description: "다양한 아이디어를 모으고 투표로 최종 결정해요.", tone: "lavender" },
] as const;

const activities = [
  { href: "/vote", type: "진행 중인 투표", title: "우리 반 체육 시간에 하고 싶은 활동은?", meta: "오늘 오후 3시 마감", emoji: "🗳️", progress: 68, tone: "blue" },
  { href: "/debate", type: "2단계 · 자료 모으기", title: "학교에서 휴대폰을 사용해도 될까요?", meta: "마감까지 45분", emoji: "⚔️", progress: 42, tone: "rose" },
  { href: "/discussion", type: "1단계 · 의견 제출", title: "우리 교실을 더 즐겁게 만드는 방법", meta: "새 의견 7개", emoji: "💡", progress: 25, tone: "yellow" },
] as const;

export default async function Home() {
  const profile = await getCurrentProfile();
  const className = profile?.group ? `${profile.group.grade}학년 ${profile.group.class_num}반` : "우리 반";
  const identity = profile ? (profile.role === "teacher" ? `${profile.name} 선생님` : `${profile.name} 학생`) : "모두보드 친구";

  return <div className="dashboard-shell page-enter">
    <header className="dashboard-header"><div className="dashboard-header-inner">
      <Link href="/" className="dashboard-logo bounce-hover" aria-label="모두보드 메인"><span>모</span><b>모두보드</b><em>🏫</em></Link>
      <nav className="dashboard-nav" aria-label="주요 메뉴">{features.map(({ href, title }) => <Link key={href} href={href}>{title.replace("모두의 ", "")}</Link>)}</nav>
      <div className="dashboard-account">{profile ? <><span className={`role-pill ${profile.role}`}><i>{profile.role === "teacher" ? "✏️" : "🎒"}</i>{className} · {identity}</span><form action={logoutAction}><button type="submit" className="dashboard-logout">로그아웃</button></form></> : <Link href="/login" className="dashboard-login bounce-hover"><LogIn /> 로그인</Link>}</div>
    </div></header>

    <main className="dashboard-main">
      <section className="welcome-card">
        <div className="welcome-copy"><span className="welcome-kicker"><Sparkles /> TODAY&apos;S CLASS</span><h1>👋 반가워요, {profile?.name ?? "모두들"}!</h1><p>오늘도 친구들과 즐겁게 생각을 나누고, 멋진 의견을 만들어 보세요.</p><div className="welcome-tags"><span><CalendarDays /> 오늘의 학급 활동</span><span><CheckCircle2 /> 오늘 할 일 3개</span></div></div>
        <aside className="class-notice bounce-hover"><div><Bell /><span><small>선생님 알림</small><b>오늘의 학급 공지</b></span></div><p>토론 자료를 읽고 내 생각을 한 문장으로 정리해 보세요!</p><span className="notice-doodle">✏️</span></aside>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-title"><div><span>EXPLORE TOGETHER</span><h2>오늘은 무엇을 해볼까요? 🚀</h2></div><p>카드를 눌러 바로 참여해 보세요.</p></div>
        <ReorderableFeatureGrid isTeacher={profile?.role === "teacher"} />
      </section>

      <section className="dashboard-section activity-section">
        <div className="dashboard-title"><div><span>KEEP GOING</span><h2>지금 참여할 수 있어요 🔥</h2></div><Link href="/boards">전체 활동 보기 <ArrowRight /></Link></div>
        <div className="recent-carousel">{activities.map((activity) => <Link key={activity.title} href={activity.href} className={`recent-card ${activity.tone} bounce-hover`}><div className="recent-card-top"><span className="activity-emoji">{activity.emoji}</span><span className="live-dot">● {activity.type}</span></div><h3>{activity.title}</h3><div className="activity-meta"><Clock3 /><span>{activity.meta}</span><b>{activity.progress}%</b></div><i><em style={{ width: `${activity.progress}%` }} /></i></Link>)}</div>
      </section>
    </main>
    <footer className="dashboard-footer"><b>모두보드 🏫</b><span>우리 반의 모든 생각이 반짝이는 곳</span></footer>
  </div>;
}
