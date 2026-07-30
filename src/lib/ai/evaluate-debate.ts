import type { DebatePost, Team } from "@/types/activities";
export interface DebateEvaluation { winner: Team; summary: string; proScore: number; conScore: number; }
export async function evaluateDebateWithAI(topic: string, posts: DebatePost[]): Promise<DebateEvaluation> {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const score = (team: Team) => posts.filter((p) => p.team === team).reduce((sum, p) => sum + p.claim.length + p.evidence.length * 1.5 + p.comments.filter((c) => c.type === "question" && c.answer).length * 20, 0);
  const proScore = Math.round(score("pro")); const conScore = Math.round(score("con")); const winner: Team = proScore >= conScore ? "pro" : "con";
  return { winner, proScore, conScore, summary: `‘${topic}’ 토론에서 ${winner === "pro" ? "찬성" : "반대"}팀이 근거의 구체성과 질문에 대한 답변에서 조금 더 설득력 있는 모습을 보였습니다. 양 팀 모두 상대 의견을 존중하며 논리적으로 참여했습니다.` };
}
