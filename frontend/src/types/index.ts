export type UserRole = 'student' | 'teacher' | 'admin';


export interface User {
  userId: number;
  username: string;
  createdAt: string;
  role: UserRole;
  profile: UserProfile;
  studentInfo?: StudentInformation;
}


export interface UserProfile {
  userId: number;
  gender: string;
  email: string;
  phone: string;
}

export interface StudentInformation {
  userId: number;
  studentNumber: string;
}

export interface Class {
  classId: number;
  className: string;
  headTeacherId?: number;
  createdAt: string;
  HeadTeacher?: User;
}

export interface StudentClass {
  studentId: number;
  classId: number;
  enrollmentTime: string;
  student: User;
  class: Class;
}

export interface TeacherClass {
  teacherId: number;
  classId: number;
  teacher: User;
  class: Class;
}

export interface Course {
  courseId: number;
  courseName: string;
  coverUrl: string;
  description: string;
  difficultyLevel: string;
  createdAt: string;
  chapters?: CourseChapter[];
  assessments?: CourseAssessment[];
}

export interface CourseChapter {
  chapterId: number;
  courseId: number;
  chapterTitle: string;
  chapterDescription: string;
  videoUrl?: string;
  sortOrder: number;
  createdAt: string;
  course: Course;
}

export interface CourseAssessment {
  assessmentId: number;
  courseId: number;
  assessmentName: string;
  assessmentType: string;
  maxScore: number;
  weight: number;
  assessmentDate: string;
  createdAt: string;
  course: Course;
}

export interface StudentGrade {
  gradeId: number;
  studentId: number;
  assessmentId: number;
  score: number;
  gradedBy?: number;
  gradeComment: string;
  createdAt: string;
  updatedAt: string;
  student: User;
  Assessment: CourseAssessment;
  grader?: User;
}

export interface TeacherCourse {
  teacherId: number;
  courseId: number;
  teacher: User;
  course: Course;
}

export interface Enrollment {
  studentId: number;
  courseId: number;
  enrollmentTime: string;
  student: User;
  course: Course;
}

export interface Experiment {
  experimentId: number;
  experimentName: string;
  courseId: number;
  description: string;
  createdAt: string;
  Course: Course;
}

export interface TeacherExperiment {
  teacherId: number;
  experimentId: number;
  teacher: User;
  experiment: Experiment;
}

export interface VirtualMachine {
  vmId: number;
  vmName: string;
  experimentId: number;
  vmDetails: string;
  status: string;
  statusMsg: string;
  lastUpdated: string;
  experiment: Experiment;
}

export interface StudentVirtualMachine {
  studentId: number;
  vmId: number;
  accessStartTime: string;
  student: User;
  virtualMachine: VirtualMachine;
}

export interface Question {
  questionId: number;
  courseId: number;
  questionType: string;
  content: string;
  explanation?: string;
  createdAt: string;
  assessmentId: number;
  course?: Course;
  chapterId?: number;
  chapter?: CourseChapter;
  options?: QuestionOption[];
}

export interface QuestionOption {
  optionId: number;
  questionId: number;
  content: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface StudentAnswer {
  answerId: number;
  studentId: number;
  questionId: number;
  answerTime: string;
  student: User;
  question: Question;
  selections?: StudentAnswerOption[];
}

export interface StudentAnswerOption {
  answerOptionId: number;
  answerId: number;
  optionId: number;
  option: QuestionOption;
}


export interface Assessment {
  assessmentId: number
  courseId: number
  assessmentName: string
  assessmentType: string
  maxScore: number
  weight: number
  assessmentDate: string
  course: Course
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

