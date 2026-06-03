import type Database from 'better-sqlite3';
import type { Answer } from '../types';

export class AnswerRepository {
  constructor(private db: Database.Database) {}

  findByAttemptId(attemptId: number): Answer[] {
    return this.db
      .prepare('SELECT * FROM answers WHERE attempt_id = ?')
      .all(attemptId) as Answer[];
  }

  upsert(attemptId: number, questionId: number, selectedAnswer: 'A' | 'B' | 'C' | 'D' | null): Answer {
    const existing = this.db
      .prepare('SELECT * FROM answers WHERE attempt_id = ? AND question_id = ?')
      .get(attemptId, questionId) as Answer | undefined;

    if (existing) {
      this.db
        .prepare('UPDATE answers SET selected_answer = ? WHERE id = ?')
        .run(selectedAnswer, existing.id);
      return this.db.prepare('SELECT * FROM answers WHERE id = ?').get(existing.id) as Answer;
    }

    const result = this.db
      .prepare(
        'INSERT INTO answers (attempt_id, question_id, selected_answer) VALUES (?, ?, ?)'
      )
      .run(attemptId, questionId, selectedAnswer);
    return this.db
      .prepare('SELECT * FROM answers WHERE id = ?')
      .get(result.lastInsertRowid) as Answer;
  }

  bulkUpdateCorrectness(
    attemptId: number,
    updates: Array<{ questionId: number; isCorrect: number }>
  ): void {
    const stmt = this.db.prepare(
      'UPDATE answers SET is_correct = ? WHERE attempt_id = ? AND question_id = ?'
    );
    const tx = this.db.transaction(() => {
      for (const u of updates) {
        stmt.run(u.isCorrect, attemptId, u.questionId);
      }
    });
    tx();
  }
}
