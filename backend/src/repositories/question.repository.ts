import type Database from 'better-sqlite3';
import type { Question } from '../types';

export class QuestionRepository {
  constructor(private db: Database.Database) {}

  findByTestId(testId: number): Question[] {
    return this.db
      .prepare('SELECT * FROM questions WHERE test_id = ? ORDER BY id')
      .all(testId) as Question[];
  }

  findById(id: number): Question | undefined {
    return this.db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as Question | undefined;
  }

  create(data: {
    testId: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    marks: number;
  }): Question {
    const result = this.db
      .prepare(
        `INSERT INTO questions (test_id, question, option_a, option_b, option_c, option_d, correct_answer, marks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        data.testId,
        data.question,
        data.optionA,
        data.optionB,
        data.optionC,
        data.optionD,
        data.correctAnswer,
        data.marks
      );
    return this.findById(result.lastInsertRowid as number)!;
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM questions WHERE id = ?').run(id);
    return result.changes > 0;
  }

  deleteByTestId(testId: number): void {
    this.db.prepare('DELETE FROM questions WHERE test_id = ?').run(testId);
  }
}
