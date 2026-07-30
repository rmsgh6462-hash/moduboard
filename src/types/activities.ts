export type PhaseKey = "team" | "strategy" | "debate" | "decision" | "ideas" | "shortlist" | "refine" | "final";
export interface Phase { key: PhaseKey; label: string; description: string; durationMinutes: number; }
export type Team = "pro" | "con";
export type DebateUserRole = "pro" | "con" | "audience";
export type DebateDecision = Team | "draw";
export interface ActivityStudent { id: string; name: string; studentNum: number | null; }
export interface TopicPermission { canCreateTopic: boolean; }
export interface DebateComment { id: string; authorId: string; authorName: string; type: "question" | "rebuttal" | "team"; content: string; answer?: string; }
export interface DebatePost { id: string; authorId: string; authorName: string; team: Team; claim: string; evidence: string; contentBlocks?: DiscussionContentBlock[]; mediaUrl?: string; comments: DebateComment[]; order: number; }
export interface DebateTopic { id: string; title: string; phases: Phase[]; currentPhase: number; phaseEndsAt: string; maxTeamSize: number; userRoles: Record<string, DebateUserRole>; posts: DebatePost[]; leaders: Partial<Record<Team, string>>; decisionMode: "teacher" | "audience"; audienceVotes: Record<string, Team>; audienceVoteClosed: boolean; allowUnassignedAudienceVote: boolean; winner?: DebateDecision; teacherFeedback?: string; }
export interface DiscussionContentBlock { id: string; type: "text" | "image" | "video"; content?: string; url?: string; fileName?: string; }
export interface DiscussionIdea { id: string; authorId: string; authorName: string; title: string; content: string; contentBlocks?: DiscussionContentBlock[]; mediaUrl?: string; votes: string[]; mergedFrom?: string[]; }
export interface DiscussionTopic { id: string; title: string; phases: Phase[]; currentPhase: number; phaseEndsAt: string; shortlistCount: number; ideas: DiscussionIdea[]; shortlistedIds: string[]; finalVotes: Record<string, string>; winnerId?: string; }
