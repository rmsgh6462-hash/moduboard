import type { ChemistryRank, TongStudent, UserVote } from "@/types/tong";

export function calculateMatchCount(currentUserId: string, targetUserId: string, votes: UserVote[]) {
  const mine = new Map(votes.filter((vote) => vote.userId === currentUserId).map((vote) => [vote.questionId, vote.selectedOption]));
  const theirs = votes.filter((vote) => vote.userId === targetUserId && mine.has(vote.questionId));
  const matchCount = theirs.filter((vote) => mine.get(vote.questionId) === vote.selectedOption).length;
  return { matchCount, totalQuestions: theirs.length, matchRate: theirs.length ? Math.round(matchCount / theirs.length * 100) : 0 };
}

export function buildChemistryRanking(currentUserId: string, students: TongStudent[], votes: UserVote[]): ChemistryRank[] {
  return students.filter((student) => student.id !== currentUserId).map((student) => ({ targetUserId: student.id, targetUserName: student.name, ...calculateMatchCount(currentUserId, student.id, votes) })).sort((a, b) => b.matchCount - a.matchCount || b.matchRate - a.matchRate || a.targetUserName.localeCompare(b.targetUserName, "ko"));
}
