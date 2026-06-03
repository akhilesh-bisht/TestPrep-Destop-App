import type Database from 'better-sqlite3';
import { toErrorMessage } from './helpers/errors';
import { AuthService } from './services/auth.service';
import { AttemptService } from './services/attempt.service';
import { DashboardService } from './services/dashboard.service';
import { TestService } from './services/test.service';
import type { ApiResponse } from './types';

export class App {
  private auth: AuthService;
  private tests: TestService;
  private attempts: AttemptService;
  private dashboard: DashboardService;

  constructor(private db: Database.Database) {
    this.auth = new AuthService(db);
    this.tests = new TestService(db);
    this.attempts = new AttemptService(db);
    this.dashboard = new DashboardService(db);
  }

  private wrap<T>(fn: () => T): ApiResponse<T> {
    try {
      return { success: true, data: fn() };
    } catch (err) {
      return { success: false, error: toErrorMessage(err) };
    }
  }

  // Auth
  login(payload: unknown) {
    return this.wrap(() => this.auth.login(payload as Parameters<AuthService['login']>[0]));
  }

  getProfile(userId: number) {
    return this.wrap(() => this.auth.getProfile(userId));
  }

  // Dashboard
  getAdminStats() {
    return this.wrap(() => this.dashboard.getAdminStats());
  }

  // Tests
  listTests(publishedOnly?: boolean) {
    return this.wrap(() => this.tests.listTests(publishedOnly));
  }

  getTest(id: number) {
    return this.wrap(() => this.tests.getTest(id));
  }

  createTest(payload: unknown, createdBy?: number) {
    return this.wrap(() => this.tests.createTest(payload, createdBy));
  }

  createTestFromExcel(payload: unknown, fileBuffer: Buffer, createdBy?: number) {
    return this.wrap(() => this.tests.createTestFromExcel(payload, fileBuffer, createdBy));
  }

  updateTest(id: number, payload: unknown) {
    return this.wrap(() => this.tests.updateTest(id, payload));
  }

  deleteTest(id: number) {
    return this.wrap(() => {
      this.tests.deleteTest(id);
      return { deleted: true };
    });
  }

  getQuestions(testId: number) {
    return this.wrap(() => this.tests.getQuestions(testId));
  }

  addQuestion(payload: unknown) {
    return this.wrap(() => this.tests.addQuestion(payload));
  }

  deleteQuestion(id: number) {
    return this.wrap(() => {
      this.tests.deleteQuestion(id);
      return { deleted: true };
    });
  }

  importQuestions(testId: number, fileBuffer: Buffer) {
    return this.wrap(() => this.tests.importFromExcel(testId, fileBuffer));
  }

  // Attempts
  startAttempt(userId: number, testId: number) {
    return this.wrap(() => this.attempts.startAttempt(userId, testId));
  }

  saveAnswer(payload: unknown) {
    return this.wrap(() => {
      this.attempts.saveAnswer(payload);
      return { saved: true };
    });
  }

  submitAttempt(attemptId: number, autoSubmit?: boolean) {
    return this.wrap(() => this.attempts.submitAttempt(attemptId, autoSubmit));
  }

  getAttemptSession(attemptId: number) {
    return this.wrap(() => this.attempts.getAttemptWithAnswers(attemptId));
  }

  getResult(attemptId: number) {
    return this.wrap(() => this.attempts.getResultSummary(attemptId));
  }

  getUserHistory(userId: number) {
    return this.wrap(() => this.attempts.getUserHistory(userId));
  }

  getAllAttempts() {
    return this.wrap(() => this.attempts.getAllAttempts());
  }

  getAnalytics(userId: number) {
    return this.wrap(() => this.attempts.getPerformanceAnalytics(userId));
  }
}
