import type Database from 'better-sqlite3';
import { AppError } from '../helpers/errors';
import { AnswerRepository } from '../repositories/answer.repository';
import { AttemptRepository } from '../repositories/attempt.repository';
import { QuestionRepository } from '../repositories/question.repository';
import { TestRepository } from '../repositories/test.repository';
import { UserRepository } from '../repositories/user.repository';
import { saveAnswerSchema } from '../validators/test.validator';
import type {
  Attempt,
  PerformanceAnalytics,
  ResultSummary,
} from '../types';

export class AttemptService {
  private attemptRepo: AttemptRepository;
  private answerRepo: AnswerRepository;
  private testRepo: TestRepository;
  private questionRepo: QuestionRepository;
  private userRepo: UserRepository;

  constructor(db: Database.Database) {
    this.attemptRepo = new AttemptRepository(db);
    this.answerRepo = new AnswerRepository(db);
    this.testRepo = new TestRepository(db);
    this.questionRepo = new QuestionRepository(db);
    this.userRepo = new UserRepository(db);
  }

  startAttempt(userId: number, testId: number): Attempt {
    const test = this.testRepo.findById(testId);
    if (!test) throw new AppError('Test not found', 404);
    if (!test.is_published) throw new AppError('Test is not available', 403);

    const questions = this.questionRepo.findByTestId(testId);
    if (questions.length === 0) throw new AppError('Test has no questions', 400);

    const existing = this.attemptRepo.findByUserAndTest(userId, testId, true);
    if (existing) return existing;

    return this.attemptRepo.create(userId, testId, test.total_marks);
  }

  saveAnswer(input: unknown): void {
    const parsed = saveAnswerSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const attempt = this.attemptRepo.findById(parsed.data.attemptId);
    if (!attempt) throw new AppError('Attempt not found', 404);
    if (attempt.status !== 'in_progress') {
      throw new AppError('Attempt is already completed', 400);
    }

    this.answerRepo.upsert(
      parsed.data.attemptId,
      parsed.data.questionId,
      parsed.data.selectedAnswer
    );
  }

  submitAttempt(attemptId: number, autoSubmit = false): Attempt {
    const attempt = this.attemptRepo.findById(attemptId);
    if (!attempt) throw new AppError('Attempt not found', 404);
    if (attempt.status !== 'in_progress') {
      throw new AppError('Attempt already submitted', 400);
    }

    return this.calculateAndFinalize(attempt, autoSubmit ? 'auto_submitted' : 'completed');
  }

  private calculateAndFinalize(
    attempt: Attempt,
    status: 'completed' | 'auto_submitted'
  ): Attempt {
    const questions = this.questionRepo.findByTestId(attempt.test_id);
    const savedAnswers = this.answerRepo.findByAttemptId(attempt.id);
    const answerMap = new Map(savedAnswers.map((a) => [a.question_id, a]));

    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    const correctnessUpdates: Array<{ questionId: number; isCorrect: number }> = [];

    for (const q of questions) {
      const ans = answerMap.get(q.id);
      const selected = ans?.selected_answer ?? null;
      let isCorrect = 0;

      if (selected) {
        if (selected === q.correct_answer) {
          isCorrect = 1;
          score += q.marks;
          correctCount++;
        } else {
          incorrectCount++;
        }
        correctnessUpdates.push({ questionId: q.id, isCorrect });
      } else if (!ans) {
        this.answerRepo.upsert(attempt.id, q.id, null);
      }
    }

    const totalMarks = attempt.total_marks || questions.reduce((s, q) => s + q.marks, 0);
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 10000) / 100 : 0;

    if (correctnessUpdates.length > 0) {
      this.answerRepo.bulkUpdateCorrectness(attempt.id, correctnessUpdates);
    }

    const updated = this.attemptRepo.updateResult(attempt.id, {
      score,
      percentage,
      correctCount,
      incorrectCount,
      status,
    });

    return updated!;
  }

  getAttemptWithAnswers(attemptId: number) {
    const attempt = this.attemptRepo.findById(attemptId);
    if (!attempt) throw new AppError('Attempt not found', 404);
    const test = this.testRepo.findById(attempt.test_id)!;
    const questions = this.questionRepo.findByTestId(attempt.test_id);
    const answers = this.answerRepo.findByAttemptId(attemptId);
    const answerMap = new Map(answers.map((a) => [a.question_id, a]));

    return {
      attempt,
      test,
      questions,
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedAnswer: answerMap.get(q.id)?.selected_answer ?? null,
      })),
    };
  }

  getResultSummary(attemptId: number): ResultSummary {
    const attempt = this.attemptRepo.findById(attemptId);
    if (!attempt) throw new AppError('Attempt not found', 404);
    if (attempt.status === 'in_progress') {
      throw new AppError('Attempt is still in progress', 400);
    }

    const test = this.testRepo.findById(attempt.test_id)!;
    const user = this.userRepo.findById(attempt.user_id)!;
    const questions = this.questionRepo.findByTestId(attempt.test_id);
    const savedAnswers = this.answerRepo.findByAttemptId(attemptId);
    const answerMap = new Map(savedAnswers.map((a) => [a.question_id, a]));

    let unansweredCount = 0;
    const answers = questions.map((q) => {
      const ans = answerMap.get(q.id);
      const selectedAnswer = ans?.selected_answer ?? null;
      const isCorrect = selectedAnswer === q.correct_answer;
      if (!selectedAnswer) unansweredCount++;
      return {
        question: q,
        selectedAnswer,
        isCorrect,
        marks: q.marks,
      };
    });

    return {
      attempt,
      test,
      user: this.userRepo.toPublic(user),
      answers,
      correctCount: attempt.correct_count,
      incorrectCount: attempt.incorrect_count,
      unansweredCount,
      percentage: attempt.percentage,
      score: attempt.score,
      totalMarks: attempt.total_marks,
    };
  }

  getUserHistory(userId: number): Attempt[] {
    return this.attemptRepo.findByUserId(userId).filter((a) => a.status !== 'in_progress');
  }

  getAllAttempts() {
    return this.attemptRepo.findAllWithDetails();
  }

  getPerformanceAnalytics(userId: number): PerformanceAnalytics {
    const attempts = this.attemptRepo
      .findByUserId(userId)
      .filter((a) => a.status !== 'in_progress');

    const percentages = attempts.map((a) => a.percentage);
    const averagePercentage =
      percentages.length > 0
        ? Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100) / 100
        : 0;

    const recentResults = attempts.slice(0, 10).map((a) => {
      const test = this.testRepo.findById(a.test_id)!;
      return {
        testId: a.test_id,
        testTitle: test.title,
        percentage: a.percentage,
        completed_at: a.completed_at,
      };
    });

    return {
      totalAttempts: attempts.length,
      averagePercentage,
      bestScore: percentages.length > 0 ? Math.max(...percentages) : 0,
      testsCompleted: new Set(attempts.map((a) => a.test_id)).size,
      recentResults,
    };
  }
}
