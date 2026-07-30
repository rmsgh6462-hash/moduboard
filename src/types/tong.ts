export type TongOption = "A" | "B";

export interface DailyQuestion {
  id: string;
  date: string;
  prompt: string;
  optionA: string;
  optionB: string;
  source?: "daily" | "random" | "teacher";
  createdAt?: string;
}

export interface UserVote {
  userId: string;
  questionId: string;
  selectedOption: TongOption;
  votedAt: string;
}

export interface ChemistryRank {
  targetUserId: string;
  targetUserName: string;
  matchCount: number;
  totalQuestions: number;
  matchRate: number;
}

export interface TongStudent {
  id: string;
  name: string;
  studentNum: number | null;
}
