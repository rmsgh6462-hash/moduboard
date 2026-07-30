/**
 * Supabase client schema foundation for the integrated Moduboard model.
 * DB names are snake_case. Regenerate this file with `supabase gen types typescript`
 * after migrations become the source of truth.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type UUID = string;
type Timestamp = string;
type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row>; Relationships: [] };

export interface UserRow { id:UUID; role:"teacher"|"student"; name:string; login_id:string|null; points:number; created_at:Timestamp }
export interface ClassRow { id:UUID; teacher_id:UUID; school_name:string; grade:number; class_number:number; name:string; timezone:string; created_at:Timestamp }
export interface MembershipRow { id:UUID; class_id:UUID; user_id:UUID; student_number:number|null; can_create_board:boolean; can_create_topic:boolean; can_create_vote:boolean; can_create_debate:boolean; can_create_discussion:boolean; can_create_word_cloud:boolean; joined_at:Timestamp }
export interface BoardRow { id:UUID; class_id:UUID; created_by:UUID; title:string; description:string; layout:"column"|"grid"|"mindmap"; sort_order:"oldest"|"newest"; background:string; thumbnail_url:string|null; is_locked:boolean; is_hidden:boolean; allow_video:boolean; allow_pdf:boolean; allow_hwp:boolean; allow_image:boolean; allow_comments:boolean; allow_likes:boolean; created_at:Timestamp; updated_at:Timestamp }
export interface BoardColumnRow { id:UUID; board_id:UUID; title:string; position:number }
export interface MindmapNodeRow { id:UUID; board_id:UUID; parent_id:UUID|null; created_by:UUID; text:string; x:number; y:number; color:string; created_at:Timestamp }
export interface PostRow { id:UUID; board_id:UUID; column_id:UUID|null; author_id:UUID; title:string; content:string; color:string; x:number; y:number; media_position:"top"|"bottom"; created_at:Timestamp; updated_at:Timestamp }
export interface AttachmentRow { id:UUID; owner_id:UUID; storage_path:string; public_url:string|null; file_name:string; mime_type:string; media_type:"image"|"video"|"pdf"|"hwp"|"mindmap"; size_bytes:number; metadata:Json; created_at:Timestamp }
export interface PollRow { id:UUID; class_id:UUID; created_by:UUID; title:string; description:string; vote_type:"binary"|"custom"; allow_abstain:boolean; is_anonymous:boolean; deadline:Timestamp|null; created_at:Timestamp }
export interface PollOptionRow { id:UUID; poll_id:UUID; text:string; position:number }
export interface PollVoteRow { id:UUID; poll_id:UUID; voter_id:UUID; option_id:UUID|null; is_abstain:boolean; created_at:Timestamp }
export interface DebateRow { id:UUID; class_id:UUID; created_by:UUID; topic:string; description:string; phase:"team_assignment"|"team_strategy"|"main_debate"|"decision"; max_team_size:number; decision_mode:"audience_vote"|"teacher_judge"; allow_nonparticipants_vote:boolean; winner:"pro"|"con"|"draw"|null; teacher_feedback:string|null; version:number; created_at:Timestamp }
export interface DebateParticipantRow { debate_id:UUID; user_id:UUID; role:"pro"|"con"|"audience"; is_leader:boolean; presentation_order:number|null; assigned_at:Timestamp }
export interface DebatePostRow { id:UUID; debate_id:UUID; author_id:UUID; team:"pro"|"con"; claim:string; evidence:string; presentation_order:number|null; revealed_at:Timestamp|null; created_at:Timestamp }
export interface DebateCommentRow { id:UUID; post_id:UUID; author_id:UUID; kind:"team"|"question"|"rebuttal"|"answer"; parent_id:UUID|null; content:string; created_at:Timestamp }
export interface DiscussionRow { id:UUID; class_id:UUID; created_by:UUID; topic:string; description:string; phase:"idea_generation"|"shortlisting"|"refinement"|"final_vote"; shortlist_count:number; winning_idea_id:UUID|null; version:number; created_at:Timestamp }
export interface DiscussionIdeaRow { id:UUID; discussion_id:UUID; author_id:UUID; title:string; content:string; merged_into_id:UUID|null; shortlisted:boolean; created_at:Timestamp; updated_at:Timestamp }
export interface DiscussionVoteRow { id:UUID; discussion_id:UUID; voter_id:UUID; idea_id:UUID; round:"shortlist"|"final"; created_at:Timestamp }
export interface TongQuestionRow { id:UUID; class_id:UUID; question:string; option_a:string; option_b:string; release_at:Timestamp; source:"scheduled"|"teacher_random"|"teacher_manual"; created_by:UUID|null; created_at:Timestamp }
export interface TongVoteRow { question_id:UUID; user_id:UUID; choice:"A"|"B"; voted_at:Timestamp }
export interface ShopItemRow { id:UUID; type:"background"|"character"|"furniture"|"wall_decor"|"door_theme"; name:string; price:number; asset_url:string; slot_key:string|null; metadata:Json; active:boolean }
export interface InventoryRow { user_id:UUID; item_id:UUID; purchased_at:Timestamp }
export interface MyRoomRow { user_id:UUID; background_item_id:UUID|null; character_item_id:UUID|null; placed_items:Json; door_title:string; door_theme_item_id:UUID|null; updated_at:Timestamp }
export interface GuestbookRow { id:UUID; target_user_id:UUID; author_id:UUID; content:string; is_secret:boolean; created_at:Timestamp; deleted_at:Timestamp|null }
export interface PointLedgerRow { id:UUID; user_id:UUID; amount:number; activity:string; reference_type:string|null; reference_id:UUID|null; created_at:Timestamp }
export interface WordCloudSessionRow { id:UUID; class_id:UUID; created_by:UUID; topic:string; max_submissions_per_student:number; mask_shape:"heart"|"cloud"|"star"|"circle"; opens_at:Timestamp|null; closes_at:Timestamp|null; created_at:Timestamp }
export interface WordCloudSubmissionRow { id:UUID; session_id:UUID; user_id:UUID; text:string; normalized_text:string; created_at:Timestamp }

export interface Database {
  public: {
    Tables: {
      users:Table<UserRow>; classes:Table<ClassRow>; class_memberships:Table<MembershipRow>;
      boards:Table<BoardRow>; board_columns:Table<BoardColumnRow>; board_mindmap_nodes:Table<MindmapNodeRow>;
      posts:Table<PostRow>; attachments:Table<AttachmentRow>;
      polls:Table<PollRow>; poll_options:Table<PollOptionRow>; poll_votes:Table<PollVoteRow>;
      debates:Table<DebateRow>; debate_participants:Table<DebateParticipantRow>; debate_posts:Table<DebatePostRow>; debate_comments:Table<DebateCommentRow>;
      discussions:Table<DiscussionRow>; discussion_ideas:Table<DiscussionIdeaRow>; discussion_votes:Table<DiscussionVoteRow>;
      tong_questions:Table<TongQuestionRow>; tong_votes:Table<TongVoteRow>;
      shop_items:Table<ShopItemRow>; user_inventory:Table<InventoryRow>; my_rooms:Table<MyRoomRow>; guestbook_entries:Table<GuestbookRow>; point_ledger:Table<PointLedgerRow>;
      word_cloud_sessions:Table<WordCloudSessionRow>; word_cloud_submissions:Table<WordCloudSubmissionRow>;
    };
    Views: {
      tong_chemistry:{ Row:{user_a:UUID;user_b:UUID;match_count:number;compared_count:number}; Relationships:[] };
      word_cloud_word_counts:{ Row:{session_id:UUID;text:string;value:number}; Relationships:[] };
    };
    Functions: {
      advance_debate_phase:{ Args:{debate_id:UUID;expected_phase:string;actor_id:UUID}; Returns:DebateRow };
      advance_discussion_phase:{ Args:{discussion_id:UUID;expected_phase:string;actor_id:UUID}; Returns:DiscussionRow };
      purchase_shop_item:{ Args:{item_id:UUID}; Returns:{balance:number} };
    };
    Enums: {
      user_role:"teacher"|"student"; board_layout:"column"|"grid"|"mindmap";
      poll_type:"binary"|"custom"; debate_role:"pro"|"con"|"audience";
      word_cloud_mask:"heart"|"cloud"|"star"|"circle";
    };
    CompositeTypes: Record<string,never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
