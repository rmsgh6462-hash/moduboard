export type WordCloudMask = "heart" | "cloud" | "star" | "circle";
export interface WordCloudWord { text: string; value: number }
export interface WordSubmission { id: string; userId: string; userName: string; text: string; createdAt: string }
export interface WordCloudSession { id: string; topic: string; maxSubmissionsPerStudent: number; maskShape: WordCloudMask; words: WordCloudWord[] }
