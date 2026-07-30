"use client";
import { useMemo, useState } from "react";
import { BarChart3, CalendarDays, Check, ChevronDown, Clock3, Plus, Search, ShieldCheck, ThumbsDown, ThumbsUp, UserCheck, Users, X } from "lucide-react";

export type VoteChoice = "agree" | "disagree" | "abstain";
export type VoteResponse = { studentId: string; studentName: string; choice: VoteChoice; votedAt: string };
export type ClassroomVote = { id: string; title: string; description: string; createdAt: string; deadline: string | null; allowAbstain: boolean; isAnonymous: boolean; createdBy: string; responses: VoteResponse[] };
export type VotePermissions = { canCreateVote: boolean };
type Student = { id: string; name: string; studentNum: number | null };
type Tab = VoteChoice | "not-voted";

const choiceMeta: Record<VoteChoice, { label: string; emoji: string; color: string }> = {
  agree: { label: "찬성", emoji: "👍", color: "#52a77c" },
  disagree: { label: "반대", emoji: "👎", color: "#e36e7e" },
  abstain: { label: "기권", emoji: "✋", color: "#efa84d" },
};

function remaining(deadline: string | null) {
  if (!deadline) return "마감 기한 없음";
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "마감됨";
  const hours = Math.ceil(diff / 3600000);
  if (hours < 24) return `⏰ 마감까지 ${hours}시간 남음`;
  return `📅 D-${Math.ceil(hours / 24)}`;
}

export function VoteCenter({ currentUser, role, students, initialCanCreateVote = false }: { currentUser: Student; role: "teacher" | "student"; students: Student[]; initialCanCreateVote?: boolean }) {
  const seedResponses: VoteResponse[] = students.slice(0, Math.max(1, Math.min(4, students.length))).map((s, i) => ({ studentId: s.id, studentName: s.name, choice: i % 3 === 0 ? "disagree" : "agree", votedAt: new Date().toISOString() }));
  const [votes, setVotes] = useState<ClassroomVote[]>([
    { id: "vote-1", title: "다음 현장체험학습 장소로 어디가 좋을까요?", description: "우리 반이 함께 즐겁게 배울 장소를 결정해요.", createdAt: new Date().toISOString(), deadline: new Date(Date.now() + 2 * 3600000).toISOString(), allowAbstain: true, isAnonymous: false, createdBy: "선생님", responses: seedResponses },
    { id: "vote-2", title: "교실에서 실내화를 신는 것에 찬성하나요?", description: "안전하고 깨끗한 교실을 위한 우리 반 투표입니다.", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), deadline: new Date(Date.now() - 3600000).toISOString(), allowAbstain: false, isAnonymous: true, createdBy: "선생님", responses: students.slice(0, 2).map((s, i) => ({ studentId: s.id, studentName: s.name, choice: i ? "disagree" : "agree", votedAt: new Date().toISOString() })) },
  ]);
  const [studentPermission, setStudentPermission] = useState(initialCanCreateVote);
  const canCreateVote = role === "teacher" || studentPermission;
  const [createOpen, setCreateOpen] = useState(false);
  const [detailVote, setDetailVote] = useState<ClassroomVote | null>(null);
  const [detailTab, setDetailTab] = useState<Tab>("agree");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const filtered = useMemo(() => votes.filter((v) => v.title.toLowerCase().includes(query.toLowerCase()) && (!from || new Date(v.createdAt) >= new Date(from)) && (!to || new Date(v.createdAt) <= new Date(`${to}T23:59:59`))).sort((a, b) => (sort === "newest" ? -1 : 1) * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())), [votes, query, sort, from, to]);
  function cast(voteId: string, choice: VoteChoice) { setVotes((all) => all.map((v) => v.id !== voteId ? v : { ...v, responses: [...v.responses.filter((r) => r.studentId !== currentUser.id), { studentId: currentUser.id, studentName: currentUser.name, choice, votedAt: new Date().toISOString() }] })); }
  function createVote(data: Omit<ClassroomVote, "id" | "createdAt" | "createdBy" | "responses">) { setVotes((v) => [{ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), createdBy: currentUser.name, responses: [] }, ...v]); setCreateOpen(false); }
  return <div className="vote-center">
    <header className="vote-hero"><div><p>우리 반의 생각을 한눈에</p><h1>모두의 투표</h1><span>친구들과 쉽고 즐겁게 의견을 모아 우리 반의 선택을 만들어요.</span></div><div className="vote-hero-icon"><BarChart3 /></div></header>
    {role === "teacher" ? <section className="vote-permission"><div><ShieldCheck /><span><b>학생 투표 생성 권한</b><small>허용하면 학생 계정에서도 새 투표를 만들 수 있어요.</small></span></div><label className="vote-switch"><input type="checkbox" checked={studentPermission} onChange={(e) => setStudentPermission(e.target.checked)} /><span /></label></section> : null}
    <section className="vote-toolbar"><label className="vote-search"><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="투표 제목을 검색해요" /></label><label className="vote-date"><CalendarDays /><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /><span>~</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label><label className="vote-sort"><select value={sort} onChange={(e) => setSort(e.target.value as "newest" | "oldest")}><option value="newest">최신순</option><option value="oldest">과거순</option></select><ChevronDown /></label>{canCreateVote ? <button className="vote-create-button" onClick={() => setCreateOpen(true)}><Plus />새 투표 만들기</button> : null}</section>
    <div className="vote-list-heading"><div><h2>우리 반 투표</h2><p>{filtered.length}개의 투표가 있어요</p></div></div>
    <section className="vote-card-grid">{filtered.map((vote) => <VoteCard key={vote.id} vote={vote} currentUser={currentUser} role={role} onVote={cast} onDetail={() => { setDetailVote(vote); setDetailTab("agree"); }} />)}</section>
    {!filtered.length ? <div className="vote-empty"><Search /><h2>조건에 맞는 투표가 없어요</h2><p>검색어나 날짜를 바꾸어 다시 찾아보세요.</p></div> : null}
    {createOpen ? <VoteCreateModal onClose={() => setCreateOpen(false)} onCreate={createVote} /> : null}
    {detailVote ? <VoteDetailModal vote={votes.find((v) => v.id === detailVote.id) ?? detailVote} students={students} tab={detailTab} setTab={setDetailTab} onClose={() => setDetailVote(null)} /> : null}
  </div>;
}

function VoteCard({ vote, currentUser, role, onVote, onDetail }: { vote: ClassroomVote; currentUser: Student; role: "teacher" | "student"; onVote: (id: string, c: VoteChoice) => void; onDetail: () => void }) {
  const closed = !!vote.deadline && new Date(vote.deadline).getTime() <= Date.now();
  const selected = vote.responses.find((r) => r.studentId === currentUser.id)?.choice;
  const choices: VoteChoice[] = vote.allowAbstain ? ["agree", "disagree", "abstain"] : ["agree", "disagree"];
  const total = vote.responses.length;
  return <article className="vote-card"><header><span className={closed ? "vote-status closed" : "vote-status live"}>{closed ? "마감됨" : "진행 중"}</span><span className="vote-remaining">{remaining(vote.deadline)}</span></header><h2>{vote.title}</h2><p>{vote.description}</p><div className={`vote-choice-buttons count-${choices.length}`}>{choices.map((c) => <button key={c} disabled={closed} className={selected === c ? `selected ${c}` : c} onClick={() => onVote(vote.id, c)}><span>{choiceMeta[c].emoji}</span><b>{choiceMeta[c].label}</b>{selected === c ? <Check /> : null}</button>)}</div>{selected || role === "teacher" ? <div className="vote-results">{choices.map((c) => { const count = vote.responses.filter((r) => r.choice === c).length; const percent = total ? Math.round(count / total * 100) : 0; return <div key={c}><div><span>{choiceMeta[c].label}</span><b>{percent}% <small>{count}표</small></b></div><i><em style={{ width: `${percent}%`, background: choiceMeta[c].color }} /></i></div>; })}<p><Users /> 총 {total}명 참여{vote.isAnonymous ? " · 무기명 투표" : ""}</p></div> : <div className="vote-before"><UserCheck />투표하면 현재 결과를 볼 수 있어요!</div>}{role === "teacher" ? <button className="vote-admin-button" onClick={onDetail}><ShieldCheck />교사 전용: 명부 및 상세 결과 보기</button> : null}</article>;
}

function VoteCreateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (v: Omit<ClassroomVote, "id" | "createdAt" | "createdBy" | "responses">) => void }) {
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [allowAbstain, setAllowAbstain] = useState(false); const [isAnonymous, setAnonymous] = useState(false); const [noDeadline, setNoDeadline] = useState(false); const [deadline, setDeadline] = useState("");
  return <div className="vote-modal-backdrop" onClick={onClose}><div className="vote-create-modal" onClick={(e) => e.stopPropagation()}><button className="vote-modal-x" onClick={onClose}><X /></button><span className="modal-eyebrow">NEW VOTE</span><h2>새 투표 만들기</h2><p>기본 선택지는 찬성과 반대예요.</p><label>투표 제목 <b>필수</b><input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="친구들에게 물어볼 내용을 적어 주세요" /></label><label>설명<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="투표에 대한 설명을 적어 주세요" /></label><div className="vote-option-list"><label><span><b>✋ 기권표 허용</b><small>찬성·반대 외에 기권을 선택할 수 있어요.</small></span><i className="vote-switch"><input type="checkbox" checked={allowAbstain} onChange={(e) => setAllowAbstain(e.target.checked)} /><span /></i></label><label><span><b>🕵️ 무기명 투표</b><small>학생 화면에 친구들의 선택이 공개되지 않아요.</small></span><i className="vote-switch"><input type="checkbox" checked={isAnonymous} onChange={(e) => setAnonymous(e.target.checked)} /><span /></i></label></div><label className="deadline-label">마감 일시<input type="datetime-local" value={deadline} disabled={noDeadline} onChange={(e) => setDeadline(e.target.value)} /></label><label className="no-deadline"><input type="checkbox" checked={noDeadline} onChange={(e) => setNoDeadline(e.target.checked)} />마감 기한 없음</label><button className="vote-modal-submit" disabled={!title.trim() || (!noDeadline && !deadline)} onClick={() => onCreate({ title: title.trim(), description: description.trim(), allowAbstain, isAnonymous, deadline: noDeadline ? null : new Date(deadline).toISOString() })}><Plus />투표 시작하기</button></div></div>;
}

function VoteDetailModal({ vote, students, tab, setTab, onClose }: { vote: ClassroomVote; students: Student[]; tab: Tab; setTab: (t: Tab) => void; onClose: () => void }) {
  const participated = new Set(vote.responses.map((r) => r.studentId)); const percent = students.length ? (participated.size / students.length * 100).toFixed(1) : "0.0";
  const tabs: { key: Tab; label: string }[] = [{ key: "agree", label: "찬성" }, { key: "disagree", label: "반대" }, ...(vote.allowAbstain ? [{ key: "abstain" as Tab, label: "기권" }] : []), { key: "not-voted", label: "미참여" }];
  const members = tab === "not-voted" ? students.filter((s) => !participated.has(s.id)).map((s) => ({ id: s.id, name: s.name, studentNum: s.studentNum })) : vote.responses.filter((r) => r.choice === tab).map((r) => ({ id: r.studentId, name: r.studentName, studentNum: students.find((s) => s.id === r.studentId)?.studentNum ?? null }));
  return <div className="vote-modal-backdrop" onClick={onClose}><div className="vote-detail-modal" onClick={(e) => e.stopPropagation()}><button className="vote-modal-x" onClick={onClose}><X /></button><span className="modal-eyebrow">TEACHER ONLY</span><h2>투표 상세 결과</h2><h3>{vote.title}</h3><div className="participation-box"><div><Users /><span><b>{students.length}명 중 {participated.size}명 참여</b><small>우리 반 참여율</small></span></div><strong>{percent}%</strong><i><em style={{ width: `${percent}%` }} /></i></div><div className="vote-detail-tabs">{tabs.map((t) => { const count = t.key === "not-voted" ? students.length - participated.size : vote.responses.filter((r) => r.choice === t.key).length; return <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>{t.label}<span>{count}</span></button>; })}</div><div className="student-vote-list">{members.map((s) => <div key={s.id}><span>{s.name.slice(0, 1)}</span><b>{s.studentNum ? `${s.studentNum}번 ` : ""}{s.name}</b>{tab === "not-voted" ? <small>아직 참여하지 않았어요</small> : <Check />}</div>)}{!members.length ? <p>해당하는 학생이 없습니다.</p> : null}</div>{vote.isAnonymous ? <div className="anonymous-notice">학생에게는 무기명으로 표시되며, 이 명부는 교사에게만 보입니다.</div> : null}</div></div>;
}
