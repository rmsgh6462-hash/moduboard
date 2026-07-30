export type PhaseKey = "team" | "strategy" | "debate" | "decision" | "ideas" | "shortlist" | "refine" | "final";
export interface Phase { key: PhaseKey; label: string; description: string; durationMinutes: number; }
export type Team = "pro" | "con";
export interface ActivityStudent { id: string; name: string; studentNum: number | null; }
export interface TopicPermission { canCreateTopic: boolean; }
export interface DebateComment { id: string; authorId: string; authorName: string; type: "question" | "rebuttal" | "team"; content: string; answer?: string; }
export interface DebatePost { id: string; authorId: string; authorName: string; team: Team; claim: string; evidence: string; mediaUrl?: string; comments: DebateComment[]; order: number; }
export interface DebateTopic { id: string; title: string; phases: Phase[]; currentPhase: number; phaseEndsAt: string; teams: Record<string, Team>; posts: DebatePost[]; leaders: Partial<Record<Team, string>>; decisionMode: "teacher" | "ai"; winner?: Team; evaluation?: string; }
export interface DiscussionIdea { id: string; authorId: string; authorName: string; title: string; content: string; mediaUrl?: string; votes: string[]; mergedFrom?: string[]; }
export interface DiscussionTopic { id: string; title: string; phases: Phase[]; currentPhase: number; phaseEndsAt: string; shortlistCount: number; ideas: DiscussionIdea[]; shortlistedIds: string[]; finalVotes: Record<string, string>; winnerId?: string; }
