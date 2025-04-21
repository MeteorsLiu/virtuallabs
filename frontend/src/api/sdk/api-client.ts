import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { Assessment, AuthResponse, Class, Course, CourseChapter, CreateAssessmentRequest, CreateQuestionRequest, Enrollment, Experiment, Question, StudentGrade, User, VMDetailResponse } from '../../types';

export class EduAPIClient {
  instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);

    // Add token to requests if available
    this.instance.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    // this.instance.interceptors.response.use(
    //   (response) => response,
    //   (error) => {
    //     if (error.response?.status === 401) {
    //       localStorage.removeItem('accessToken');
    //       window.location.href = '/login';
    //     }
    //     return Promise.reject(error);
    //   }
    // );
  }

  // Auth
  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    const response = await this.instance.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: {
    username: string;
    password: string;
    role: string;
    studentNo?: string;
    gender: string;
    email: string;
    phone: string;
  }): Promise<AuthResponse> {
    const response = await this.instance.post('/auth/register', userData);
    return response.data;
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    const response = await this.instance.get('/classes/');
    return response.data;
  }

  async getClass(id: number): Promise<Class> {
    const response = await this.instance.get(`/classes/${id}`);
    return response.data;
  }

  async addStudentToClass(id: number, student: User): Promise<Class> {
    const response = await this.instance.put(`/classes/${id}/student`, student);
    return response.data;
  }

  async createClass(classData: {
    className: string;
    headTeacherId?: number;
    createdAt: string;
  }): Promise<Class> {
    const response = await this.instance.post('/classes/', classData);
    return response.data;
  }

  async updateClass(id: number, classData: Partial<Class>): Promise<Class> {
    const response = await this.instance.put(`/classes/${id}`, classData);
    return response.data;
  }

  async deleteClass(id: number): Promise<void> {
    await this.instance.delete(`/classes/${id}`);
  }

  // Students
  async getStudentsByClass(classId: number): Promise<User[]> {
    const response = await this.instance.get(`/classes/${classId}/students`);
    return response.data;
  }

  async getStudents(): Promise<User[]> {
    const response = await this.instance.get(`/students/`);
    return response.data;
  }

  async createStudent(studentData: {
    username: string;
    password: string;
    gender: string;
    email: string;
    phone: string;
    studentNumber: string;
  }): Promise<User> {
    const response = await this.instance.post('/students/', studentData);
    return response.data;
  }

  // Teachers
  async getTeachers(): Promise<User[]> {
    const response = await this.instance.get('/teachers/');
    return response.data;
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    const response = await this.instance.get('/courses/');
    return response.data;
  }

  async getCourseDetail(id: number): Promise<Course> {
    const response = await this.instance.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(courseData: {
    courseName: string;
    description?: string;
    difficultyLevel: string;
  }): Promise<Course> {
    const response = await this.instance.post('/courses/', courseData);
    return response.data;
  }

  async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
    const response = await this.instance.put(`/courses/${id}`, courseData);
    return response.data;
  }

  async deleteCourse(id: number): Promise<void> {
    await this.instance.delete(`/courses/${id}`);
  }

  // Course Chapters
  async getChapters(courseId: number): Promise<CourseChapter[]> {
    const response = await this.instance.get(`/courses/${courseId}/chapters`);
    return response.data;
  }

  async createChapter(courseId: number, chapterData: {
    chapterTitle: string;
    chapterDescription: string;
    videoUrl?: string;
    sortOrder: number;
  }): Promise<CourseChapter> {
    const response = await this.instance.post(`/courses/${courseId}/chapters`, chapterData);
    return response.data;
  }

  async updateChapter(courseId: number, chapterId: number, chapterData: Partial<CourseChapter>): Promise<CourseChapter> {
    const response = await this.instance.put(`/courses/${courseId}/chapters/${chapterId}`, chapterData);
    return response.data;
  }

  async deleteChapter(courseId: number, chapterId: number): Promise<void> {
    await this.instance.delete(`/courses/${courseId}/chapters/${chapterId}`);
  }

  // Experiments
  async getExperiments(): Promise<Experiment[]> {
    const response = await this.instance.get('/experiments/');
    return response.data;
  }

  async getExperiment(id: number): Promise<Experiment> {
    const response = await this.instance.get(`/experiments/${id}`);
    return response.data;
  }

  async createExperiment(experimentData: {
    experimentName: string;
    courseId: number;
    description: string;
  }): Promise<Experiment> {
    const response = await this.instance.post('/experiments/', experimentData);
    return response.data;
  }

  async updateExperiment(id: number, experimentData: Partial<Experiment>): Promise<Experiment> {
    const response = await this.instance.put(`/experiments/${id}`, experimentData);
    return response.data;
  }

  async deleteExperiment(id: number): Promise<void> {
    await this.instance.delete(`/experiments/${id}`);
  }

  // Virtual Machines
  async getVirtualMachine(experimentId: number): Promise<VMDetailResponse[]> {
    const response = await this.instance.get(`/virtualmachines/get-experiment-vms/${experimentId}`);
    return response.data;
  }

  async createVirtualMachine(vmData: {
    experimentId: number;
    vmDetails: string;
  }): Promise<VMDetailResponse> {
    const response = await this.instance.post('/virtualmachines/create-vm', vmData);
    return response.data;
  }


  async deleteVirtualMachine(id: number): Promise<void> {
    await this.instance.post(`/virtualmachines/delete-vm/${id}`);
  }


  async createQuestion(assessmentId: number, data: CreateQuestionRequest): Promise<Question> {
    const response = await this.instance.post(`/courses/assessments/question/`, {...data, assessmentId});
    return response.data;
  }

  async getQuestions(assessmentId: number): Promise<Question[]> {
    const response = await this.instance.get(`/courses/assessments/${assessmentId}/questions`);
    return response.data;
  }

   // Assessments
   async createAssessment(courseId: number , data: CreateAssessmentRequest): Promise<Assessment> {
    const response = await this.instance.post(`/courses/${courseId}/assessments`, data);
    return response.data;
  }

  async getAssessments(courseId: number): Promise<Assessment[]> {
    const params = { courseId };
    const response = await this.instance.get('/courses/assessments/', { params });
    return response.data;
  }

  async getStudentGrade(courseId: number): Promise<StudentGrade[]> {
    const response = await this.instance.get(`/courses/${courseId}/grades`);
    return response.data;
  }


  // Assessments
  async submitAnswer(assessmentId: number, answer: {
    questionId: number;
    optionIds: number[];
  }): Promise<Question> {
    const response = await this.instance.post(`/courses/assessments/${assessmentId}/submit`, answer);
    return response.data.question;
  }

  async enroll(courseId: number): Promise<Enrollment> {
    const response = await this.instance.post(`/courses/${courseId}/enroll`, {});
    return response.data;
  }

  async unenroll(courseId: number): Promise<Enrollment> {
    const response = await this.instance.delete(`/courses/${courseId}/enroll`, {});
    return response.data;
  }

  async getEnrollments(): Promise<Enrollment[]> {
    const response = await this.instance.get('/courses/enrollments');
    return response.data;
  }

  // File Upload
  async uploadFile(file: File, metadata: {
    uploadType: 'courseCover' | 'chapterVideo';
    targetId: number;
  }): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    const response = await this.instance.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}
