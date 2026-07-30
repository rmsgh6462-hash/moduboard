"use client";
import { CheckCircle2, Eye, Lock, ThumbsDown, ThumbsUp, Users } from "lucide-react";
import type { DebateDecision, Team } from "@/types/activities";

export function AudienceVoteResults({ canVote, myVote, votes, closed, role, winner, onVote, onClose }: { canVote: boolean; myVote?: Team; votes: Record<string, Team>; closed: boolean; role: "teacher" | "student"; winner?: DebateDecision; onVote: (team: Team) => void; onClose: () => void }) {
  const values = Object.values(votes); const pro = values.filter((v) => v === "pro").length; const con = values.length - pro; const total = values.length; const proRate = total ? Math.round(pro / total * 100) : 0; const conRate = total ? 100 - proRate : 0;
  return <div className="audience-decision">
    <div className="audience-decision-title"><Users /><div><h3>청중 판정단 투표</h3><p>어느 팀의 주장이 더 설득력 있었나요?</p></div></div>
    {canVote && !closed ? <div className="audience-vote-buttons"><button className={myVote === "pro" ? "selected pro" : "pro"} onClick={() => onVote("pro")}><ThumbsUp /><b>찬성 팀 승리</b><span>주장이 더 설득력 있었어요</span></button><button className={myVote === "con" ? "selected con" : "con"} onClick={() => onVote("con")}><ThumbsDown /><b>반대 팀 승리</b><span>반론이 더 논리적이었어요</span></button></div> : null}
    {!canVote && role === "student" ? <div className="judge-notice"><Eye /><span><b>토론자는 투표할 수 없어요</b><small>청중 판정 결과를 함께 기다려 주세요.</small></span></div> : null}
    <div className="audience-result-bars"><div><span><b>👍 찬성 팀</b><em>{pro}표 · {proRate}%</em></span><i><u style={{ width: `${proRate}%` }} /></i></div><div className="con"><span><b>👎 반대 팀</b><em>{con}표 · {conRate}%</em></span><i><u style={{ width: `${conRate}%` }} /></i></div></div>
    <div className="audience-vote-footer"><span>{closed ? <><Lock /> 투표가 마감됐어요</> : <><CheckCircle2 /> {total}명이 판정에 참여했어요</>}</span>{role === "teacher" && !closed ? <button onClick={onClose} disabled={!total}>투표 마감하고 승리 팀 발표</button> : null}</div>
    {closed && winner ? <div className={`audience-winner ${winner}`}><b>{winner === "draw" ? "🤝 동점으로 무승부예요!" : winner === "pro" ? "🎉 찬성 팀이 승리했어요!" : "🎉 반대 팀이 승리했어요!"}</b><span>청중 판정단의 투표 결과입니다.</span></div> : null}
  </div>;
}
