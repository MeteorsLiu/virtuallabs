export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  userId: number;
  username: string;
  createdAt: string;
  role: {
    userId: number;
    role: string;
  };
  profile: {
    userId: number;
    gender?: string;
    email?: string;
    phone?: string;
  };
  studentInfo?: {
    userId: number;
    studentNumber: string;
  };
}

export interface Course {
  courseId: number;
  courseName: string;
  coverUrl?: string;
  description?: string;
  difficultyLevel: string;
  createdAt: string;
}

export interface CourseChapter {
  chapterId: number;
  courseId: number;
  chapterTitle: string;
  chapterDescription: string;
  videoUrl: string;
  sortOrder: number;
}

export interface Class {
  classId: number;
  className: string;
  headTeacherId?: number;
  createdAt: string;
  HeadTeacher: User
}

export interface Experiment {
  experimentId: number;
  experimentName: string;
  description: string;
  courseId?: number;
  createdAt: string;
  Course: Course
}

export interface VMDetailResponse {
  vmId: number
  vmName: string;
  experimentId: number;
  vmDetails: string;
  status: string;
  createdAt: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  role: UserRole;
  token: string;
  expiresAt: number;
}

export interface Assessment {
  assessmentId: number;
  courseId: number;
  chapterId?: number;
  title: string;
  description?: string;
  timeLimit?: number;
  createdAt: string;
}

export interface Question {
  questionId: number;
  assessmentId: number;
  content: string;
  type: 'single' | 'multiple';
  options: QuestionOption[];
  explanation?: string;
  sortOrder: number;
}

export interface QuestionOption {
  optionId: number;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface StudentAnswer {
  answerId: number;
  studentId: number;
  assessmentId: number;
  questionId: number;
  selectedOptions: number[];
  score: number;
  submittedAt: string;
}

export interface CreateAssessmentRequest {
  assessmentName: string
  assessmentType: string
  maxScore: number
  weight: number
  assessmentDate: string
}

export interface CreateQuestionRequest {
  assessmentId: number;
  content: string;
  questionType: 'single' | 'multiple';
  explanation?: string;
  options: QuestionOptionRequest[];
  sortOrder: number;
  courseId: number;
}

export interface QuestionOptionRequest {
  content: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface SubmitAnswerRequest {
  assessmentId: number;
  questionId: number;
  selectedOptions: number[];
}

export interface Enrollment {
  studentId: number;
  courseId: number;
  enrollmentTime: string;
  course?: Course; // 根据后端实际返回结构定义
}
