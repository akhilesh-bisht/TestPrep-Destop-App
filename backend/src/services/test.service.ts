import type Database from 'better-sqlite3';
import * as XLSX from 'xlsx';
import { AppError } from '../helpers/errors';
import { QuestionRepository } from '../repositories/question.repository';
import { TestRepository } from '../repositories/test.repository';
import {
  createQuestionSchema,
  createTestSchema,
  updateTestSchema,
} from '../validators/test.validator';
import type { Question, Test } from '../types';

export class TestService {
  private testRepo: TestRepository;
  private questionRepo: QuestionRepository;

  constructor(db: Database.Database) {
    this.testRepo = new TestRepository(db);
    this.questionRepo = new QuestionRepository(db);
  }

  listTests(publishedOnly = false): Test[] {
    return this.testRepo.findAll(publishedOnly);
  }

  getTest(id: number): Test {
    const test = this.testRepo.findById(id);
    if (!test) throw new AppError('Test not found', 404);
    return test;
  }

  createTest(input: unknown, createdBy?: number): Test {
    const parsed = createTestSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }
    return this.testRepo.create({
      title: parsed.data.title,
      description: parsed.data.description,
      duration: parsed.data.duration,
      isPublished: parsed.data.isPublished ?? false,
      createdBy,
    });
  }

  updateTest(id: number, input: unknown): Test {
    const parsed = updateTestSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }
    const updated = this.testRepo.update(id, {
      title: parsed.data.title,
      description: parsed.data.description,
      duration: parsed.data.duration,
      isPublished: parsed.data.isPublished,
    });
    if (!updated) throw new AppError('Test not found', 404);
    return updated;
  }

  deleteTest(id: number): void {
    if (!this.testRepo.delete(id)) throw new AppError('Test not found', 404);
  }

  getQuestions(testId: number): Question[] {
    this.getTest(testId);
    return this.questionRepo.findByTestId(testId);
  }

  addQuestion(input: unknown): Question {
    const parsed = createQuestionSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }
    this.getTest(parsed.data.testId);
    const question = this.questionRepo.create({
      testId: parsed.data.testId,
      question: parsed.data.question,
      optionA: parsed.data.optionA,
      optionB: parsed.data.optionB,
      optionC: parsed.data.optionC,
      optionD: parsed.data.optionD,
      correctAnswer: parsed.data.correctAnswer,
      marks: parsed.data.marks,
    });
    this.testRepo.recalculateTotalMarks(parsed.data.testId);
    return question;
  }

  deleteQuestion(id: number): void {
    const q = this.questionRepo.findById(id);
    if (!q) throw new AppError('Question not found', 404);
    this.questionRepo.delete(id);
    this.testRepo.recalculateTotalMarks(q.test_id);
  }

  importFromExcel(testId: number, fileBuffer: Buffer): { imported: number } {
    this.getTest(testId);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    let imported = 0;
    for (const row of rows) {
      const question = row.question || row.Question;
      const optionA = row.optionA || row.option_a || row.OptionA || row.A;
      const optionB = row.optionB || row.option_b || row.OptionB || row.B;
      const optionC = row.optionC || row.option_c || row.OptionC || row.C;
      const optionD = row.optionD || row.option_d || row.OptionD || row.D;
      const correctAnswer = (row.correctAnswer || row.correct_answer || row.Answer || '')
        .toString()
        .toUpperCase()
        .charAt(0) as 'A' | 'B' | 'C' | 'D';
      const marks = parseInt(String(row.marks || row.Marks || 1), 10) || 1;

      if (!question || !optionA || !optionB || !optionC || !optionD) continue;
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) continue;

      this.questionRepo.create({
        testId,
        question: String(question),
        optionA: String(optionA),
        optionB: String(optionB),
        optionC: String(optionC),
        optionD: String(optionD),
        correctAnswer,
        marks,
      });
      imported++;
    }

    this.testRepo.recalculateTotalMarks(testId);
    return { imported };
  }
}
