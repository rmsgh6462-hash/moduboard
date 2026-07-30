"use client";
import { useState } from "react";
import { Crown, MessageSquareText, Scale } from "lucide-react";
import type { DebateDecision } from "@/types/activities";

export function TeacherDebateJudge({publishedWinner,publishedFeedback,onPublish}:{publishedWinner?:DebateDecision;publishedFeedback:string;onPublish:(winner:DebateDecision,feedback:string)=>void}){
  const [winner,setWinner]=useState<DebateDecision>(publishedWinner??"draw"),[feedback,setFeedback]=useState(publishedFeedback);
  return <div className="teacher-judge-form"><div className="teacher-judge-heading"><Scale/><div><h3>교사 직접 판정</h3><p>토론 과정과 참여도를 종합하여 결정해 주세요.</p></div></div><div className="teacher-winner-options"><button className={winner==="pro"?"selected pro":"pro"} onClick={()=>setWinner("pro")}>👍 찬성 승리</button><button className={winner==="con"?"selected con":"con"} onClick={()=>setWinner("con")}>👎 반대 승리</button><button className={winner==="draw"?"selected draw":"draw"} onClick={()=>setWinner("draw")}>🤝 무승부</button></div><label><span><MessageSquareText/>교사 총평</span><textarea value={feedback} onChange={event=>setFeedback(event.target.value)} placeholder="잘한 점과 다음에 생각해 볼 점을 학생들에게 따뜻하게 전해 주세요."/></label><button className="publish-judge" disabled={!feedback.trim()} onClick={()=>onPublish(winner,feedback.trim())}><Crown/>판정과 총평 공개하기</button></div>
}
