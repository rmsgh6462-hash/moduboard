export type WordCloudMask = "heart" | "cloud" | "star" | "circle" | "text";
export interface WordCloudWord { text: string; value: number }
export interface WordSubmission { id: string; userId: string; userName: string; text: string; createdAt: string }
export interface WordCloudSession { id: string; topic: string; maxSubmissionsPerStudent: 0 | 1 | 3; maskShape: WordCloudMask; maskText?: string; words: WordCloudWord[] }
