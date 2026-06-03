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

const normalizeHeader = (key: string) =>
  key
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const getCellValue = (row: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    const value = row[normalizedAlias];
    if (value != null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return undefined;
};

const normalizeExcelRows = (sheet: XLSX.WorkSheet) => {
  const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
  return rawRows.map((rawRow) => {
    const normalizedRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(rawRow)) {
      normalizedRow[normalizeHeader(key)] = String(value ?? '').trim();
    }
    return normalizedRow;
  });
};

const parseCorrectAnswer = (value: string | undefined): 'A' | 'B' | 'C' | 'D' | null => {
  if (!value) return null;
  const normalized = normalizeHeader(value);
  if (['a', 'b', 'c', 'd'].includes(normalized)) {
    return normalized.toUpperCase() as 'A' | 'B' | 'C' | 'D';
  }

  const numeric = parseInt(normalized.replace(/[^0-9]/g, ''), 10);
  if ([1, 2, 3, 4].includes(numeric)) {
    return ['A', 'B', 'C', 'D'][numeric - 1] as 'A' | 'B' | 'C' | 'D';
  }

  return null;
};

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

  createTestFromExcel(
    input: unknown,
    fileBuffer: Buffer,
    createdBy?: number
  ): { test: Test; imported: number } {
    const parsed = createTestSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const test = this.testRepo.create({
      title: parsed.data.title,
      description: parsed.data.description,
      duration: parsed.data.duration,
      isPublished: parsed.data.isPublished ?? false,
      createdBy,
    });

    try {
      const result = this.importFromExcel(test.id, fileBuffer);
      if (result.imported === 0) {
        this.testRepo.delete(test.id);
        throw new AppError('No valid questions found in Excel file', 400);
      }
      return { test: this.testRepo.findById(test.id)!, imported: result.imported };
    } catch (error) {
      if (this.testRepo.findById(test.id)) {
        this.testRepo.delete(test.id);
      }
      throw error;
    }
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
    const rows = normalizeExcelRows(sheet);

    let imported = 0;
    for (const row of rows) {
      const question = getCellValue(row, ['question', 'Question', 'questiontext', 'q']);
      const optionA = getCellValue(row, [
        'optionA',
        'option_a',
        'OptionA',
        'A',
        'option1',
        'option 1',
        'opt1',
      ]);
      const optionB = getCellValue(row, [
        'optionB',
        'option_b',
        'OptionB',
        'B',
        'option2',
        'option 2',
        'opt2',
      ]);
      const optionC = getCellValue(row, [
        'optionC',
        'option_c',
        'OptionC',
        'C',
        'option3',
        'option 3',
        'opt3',
      ]);
      const optionD = getCellValue(row, [
        'optionD',
        'option_d',
        'OptionD',
        'D',
        'option4',
        'option 4',
        'opt4',
      ]);
      const correctAnswer = parseCorrectAnswer(
        getCellValue(row, [
          'correctAnswer',
          'correct_answer',
          'Answer',
          'correct',
          'answer',
          'correctOption',
          'correct option',
          'correct option number',
        ])
      );
      const marks =
        parseInt(String(getCellValue(row, ['marks', 'Marks', 'points', 'score']) ?? '1'), 10) || 1;

      if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) continue;

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
