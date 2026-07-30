export type AssignmentMediaType="image"|"video"|"link";export type SubmissionStatus="draft"|"submitted"|"reviewed";
export interface AssignmentAttachment{id:string;type:AssignmentMediaType;url:string;name:string}
export interface Assignment{id:string;title:string;description:string;attachments:AssignmentAttachment[];dueDate:string;createdAt:string;createdBy:string}
export interface AssignmentSubmission{id:string;assignmentId:string;studentId:string;studentName:string;content:string;mediaUrls:{id:string;type:"image"|"video";url:string;name:string}[];links:string[];status:SubmissionStatus;teacherFeedback:string;updatedAt:string;submittedAt?:string}
export interface AssignmentStudent{id:string;name:string;studentNum:number|null}
