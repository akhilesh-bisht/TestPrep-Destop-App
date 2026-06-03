export type UserRole = 'admin' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Test {
  id: number;
  title: string;
  description: string | null;
  duration: number;
  total_marks: number;
  is_published: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  test_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  marks: number;
  created_at: string;
}

export type AttemptStatus = 'in_progress' | 'completed' | 'auto_submitted';

export interface Attempt {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  total_marks: number;
  percentage: number;
  correct_count: number;
  incorrect_count: number;
  status: AttemptStatus;
  started_at: string;
  completed_at: string | null;
}

export interface Answer {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_answer: 'A' | 'B' | 'C' | 'D' | null;
  is_correct: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  totalTests: number;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
  recentAttempts: Array<{
    id: number;
    studentName: string;
    testTitle: string;
    score: number;
    percentage: number;
    completed_at: string | null;
  }>;
}

export interface ResultSummary {
  attempt: Attempt;
  test: Test;
  user: UserPublic;
  answers: Array<{
    question: Question;
    selectedAnswer: string | null;
    isCorrect: boolean;
    marks: number;
  }>;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  percentage: number;
  score: number;
  totalMarks: number;
}

export interface PerformanceAnalytics {
  totalAttempts: number;
  averagePercentage: number;
  bestScore: number;
  testsCompleted: number;
  recentResults: Array<{
    testId: number;
    testTitle: string;
    percentage: number;
    completed_at: string | null;
  }>;
}
