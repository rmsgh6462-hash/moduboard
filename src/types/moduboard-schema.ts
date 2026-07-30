/** Moduboard v1 integrated domain contract. DB rows use snake_case; API DTOs use camelCase. */
export type UUID = string;
export type ISODateTime = string;
export type UserRole = "teacher" | "student";
export type BoardLayout = "column" | "grid" | "mindmap";
export type MediaType = "image" | "video" | "pdf" | "hwp" | "mindmap";
export type MediaPosition = "top" | "bottom";
export type PollType = "binary" | "custom";
export type DebatePhase = "team_assignment" | "team_strategy" | "main_debate" | "decision";
export type DebateRole = "pro" | "con" | "audience";
export type DebateDecisionMode = "audience_vote" | "teacher_judge";
export type DebateWinner = "pro" | "con" | "draw";
export type DiscussionPhase = "idea_generation" | "shortlisting" | "refinement" | "final_vote";
export type WordCloudMask = "heart" | "cloud" | "star" | "circle";
export type ShopItemType = "background" | "character" | "furniture" | "wall_decor" | "door_theme";
export type PointActivity = "attendance" | "poll_vote" | "board_post" | "comment" | "debate_post" | "discussion_post" | "tong_vote" | "purchase" | "teacher_adjustment";

export interface ClassPermissions {
  canCreateBoard: boolean;
  canCreateTopic: boolean;
  canCreateVote: boolean;
  canCreateDebate: boolean;
  canCreateDiscussion: boolean;
  canCreateWordCloud: boolean;
}
export interface User { id:UUID; role:UserRole; name:string; loginId:string|null; points:number; createdAt:ISODateTime }
export interface ClassRoom { id:UUID; teacherId:UUID; schoolName:string; grade:number; classNumber:number; name:string; timezone:string; createdAt:ISODateTime }
export interface ClassMembership { id:UUID; classId:UUID; userId:UUID; studentNumber:number|null; permissions:ClassPermissions; joinedAt:ISODateTime }

export interface BoardSettings { isLocked:boolean; isHidden:boolean; allowVideo:boolean; allowPdf:boolean; allowHwp:boolean; allowImage:boolean; allowComments:boolean; allowLikes:boolean; audienceUserIds:UUID[] }
export interface Board { id:UUID; classId:UUID; createdBy:UUID; title:string; description:string; layout:BoardLayout; sortOrder:"oldest"|"newest"; background:string; thumbnailUrl:string|null; settings:BoardSettings; createdAt:ISODateTime; updatedAt:ISODateTime }
export interface BoardColumn { id:UUID; boardId:UUID; title:string; position:number }
export interface MindmapNode { id:UUID; boardId:UUID; parentId:UUID|null; text:string; x:number; y:number; color:string; createdBy:UUID }
export interface Attachment { id:UUID; ownerId:UUID; storagePath:string; publicUrl:string|null; fileName:string; mimeType:string; mediaType:MediaType; sizeBytes:number; metadata:Record<string,unknown>; createdAt:ISODateTime }
export interface PostItCard { id:UUID; boardId:UUID; columnId:UUID|null; authorId:UUID; title:string; content:string; color:string; x:number; y:number; mediaPosition:MediaPosition; attachments:Attachment[]; createdAt:ISODateTime; updatedAt:ISODateTime }
export interface PostComment { id:UUID; postId:UUID; authorId:UUID; content:string; createdAt:ISODateTime }

export interface PollOption { id:UUID; pollId:UUID; text:string; position:number }
export interface Poll { id:UUID; classId:UUID; createdBy:UUID; title:string; description:string; voteType:PollType; options:PollOption[]; allowAbstain:boolean; isAnonymous:boolean; deadline:ISODateTime|null; createdAt:ISODateTime }
export interface PollVote { id:UUID; pollId:UUID; voterId:UUID; optionId:UUID|null; isAbstain:boolean; createdAt:ISODateTime }
export interface PollResult { pollId:UUID; totalEligible:number; totalVoted:number; options:Array<{optionId:UUID;text:string;count:number;percentage:number}>; abstainCount:number; notVotedUserIds:UUID[] }

export interface PhaseSchedule { phase:string; startsAt:ISODateTime|null; endsAt:ISODateTime|null; durationMinutes:number; advancedBy:UUID|null }
export interface Debate { id:UUID; classId:UUID; createdBy:UUID; topic:string; description:string; phase:DebatePhase; maxTeamSize:number; decisionMode:DebateDecisionMode; allowNonParticipantsVote:boolean; schedules:PhaseSchedule[]; winner:DebateWinner|null; teacherFeedback:string|null; createdAt:ISODateTime }
export interface DebateParticipant { debateId:UUID; userId:UUID; role:DebateRole; isLeader:boolean; presentationOrder:number|null; assignedAt:ISODateTime }
export interface DebatePost { id:UUID; debateId:UUID; authorId:UUID; team:"pro"|"con"; claim:string; evidence:string; presentationOrder:number|null; revealedAt:ISODateTime|null; attachments:Attachment[]; createdAt:ISODateTime }
export interface DebateComment { id:UUID; postId:UUID; authorId:UUID; kind:"team"|"question"|"rebuttal"|"answer"; parentId:UUID|null; content:string; createdAt:ISODateTime }
export interface DebateAudienceVote { debateId:UUID; voterId:UUID; choice:"pro"|"con"; createdAt:ISODateTime }

export interface Discussion { id:UUID; classId:UUID; createdBy:UUID; topic:string; description:string; phase:DiscussionPhase; shortlistCount:number; schedules:PhaseSchedule[]; winningIdeaId:UUID|null; createdAt:ISODateTime }
export interface DiscussionIdea { id:UUID; discussionId:UUID; authorId:UUID; title:string; content:string; mergedIntoId:UUID|null; shortlisted:boolean; attachments:Attachment[]; createdAt:ISODateTime }
export interface DiscussionVote { id:UUID; discussionId:UUID; voterId:UUID; ideaId:UUID; round:"shortlist"|"final"; createdAt:ISODateTime }

export interface TongQuestion { id:UUID; classId:UUID; question:string; optionA:string; optionB:string; releaseAt:ISODateTime; source:"scheduled"|"teacher_random"|"teacher_manual"; createdBy:UUID|null }
export interface TongVote { questionId:UUID; userId:UUID; choice:"A"|"B"; votedAt:ISODateTime }
export interface ChemistryRank { targetUserId:UUID; targetUserName:string; matchCount:number; comparedCount:number; matchPercentage:number }

export interface ShopItem { id:UUID; type:ShopItemType; name:string; price:number; assetUrl:string; slotKey:string|null; metadata:Record<string,unknown>; active:boolean }
export interface UserInventory { userId:UUID; itemId:UUID; purchasedAt:ISODateTime }
export interface MyRoomConfig { userId:UUID; backgroundItemId:UUID|null; characterItemId:UUID|null; placedItems:Record<string,UUID>; doorTitle:string; doorThemeItemId:UUID|null; updatedAt:ISODateTime }
export interface GuestbookEntry { id:UUID; targetUserId:UUID; authorId:UUID; content:string; isSecret:boolean; createdAt:ISODateTime; deletedAt:ISODateTime|null }
export interface PointLedgerEntry { id:UUID; userId:UUID; amount:number; activity:PointActivity; referenceType:string|null; referenceId:UUID|null; createdAt:ISODateTime }

export interface WordCloudSession { id:UUID; classId:UUID; createdBy:UUID; topic:string; maxSubmissionsPerStudent:number; maskShape:WordCloudMask; opensAt:ISODateTime|null; closesAt:ISODateTime|null; createdAt:ISODateTime }
export interface WordCloudSubmission { id:UUID; sessionId:UUID; userId:UUID; text:string; normalizedText:string; createdAt:ISODateTime }
export interface WordCloudWord { text:string; value:number }

export interface ApiSuccess<T> { ok:true; data:T }
export interface ApiFailure { ok:false; error:{code:string;message:string;fields?:Record<string,string>} }
export type ApiResponse<T> = ApiSuccess<T>|ApiFailure;
export interface CursorPage<T> { items:T[]; nextCursor:string|null }
export type CreatePollRequest = Pick<Poll,"classId"|"title"|"description"|"voteType"|"allowAbstain"|"isAnonymous"|"deadline"> & { options:string[] };
export interface CastPollVoteRequest { optionId:UUID|null; abstain?:boolean }
export type CreateWordCloudRequest = Pick<WordCloudSession,"classId"|"topic"|"maxSubmissionsPerStudent"|"maskShape"|"opensAt"|"closesAt">;
export interface SubmitWordRequest { text:string }
export interface AdvancePhaseRequest { expectedPhase:DebatePhase|DiscussionPhase; force:boolean }
