import type Database from 'better-sqlite3';
import type { Attempt, AttemptStatus } from '../types';

export class AttemptRepository {
  constructor(private db: Database.Database) {}

  findById(id: number): Attempt | undefined {
    return this.db.prepare('SELECT * FROM attempts WHERE id = ?').get(id) as Attempt | undefined;
  }

  findByUserAndTest(userId: number, testId: number, inProgressOnly = false): Attempt | undefined {
    if (inProgressOnly) {
      return this.db
        .prepare(
          `SELECT * FROM attempts WHERE user_id = ? AND test_id = ? AND status = 'in_progress'`
        )
        .get(userId, testId) as Attempt | undefined;
    }
    return this.db
      .prepare('SELECT * FROM attempts WHERE user_id = ? AND test_id = ? ORDER BY id DESC LIMIT 1')
      .get(userId, testId) as Attempt | undefined;
  }

  findByUserId(userId: number): Attempt[] {
    return this.db
      .prepare('SELECT * FROM attempts WHERE user_id = ? ORDER BY started_at DESC')
      .all(userId) as Attempt[];
  }

  findAllWithDetails(): Array<
    Attempt & { student_name: string; test_title: string }
  > {
    return this.db
      .prepare(
        `SELECT a.*, u.name as student_name, t.title as test_title
         FROM attempts a
         JOIN users u ON u.id = a.user_id
         JOIN tests t ON t.id = a.test_id
         ORDER BY a.started_at DESC`
      )
      .all() as Array<Attempt & { student_name: string; test_title: string }>;
  }

  create(userId: number, testId: number, totalMarks: number): Attempt {
    const result = this.db
      .prepare(
        `INSERT INTO attempts (user_id, test_id, total_marks, status) VALUES (?, ?, ?, 'in_progress')`
      )
      .run(userId, testId, totalMarks);
    return this.findById(result.lastInsertRowid as number)!;
  }

  updateResult(
    id: number,
    data: {
      score: number;
      percentage: number;
      correctCount: number;
      incorrectCount: number;
      status: AttemptStatus;
    }
  ): Attempt | undefined {
    this.db
      .prepare(
        `UPDATE attempts SET
          score = ?, percentage = ?, correct_count = ?, incorrect_count = ?,
          status = ?, completed_at = datetime('now')
         WHERE id = ?`
      )
      .run(
        data.score,
        data.percentage,
        data.correctCount,
        data.incorrectCount,
        data.status,
        id
      );
    return this.findById(id);
  }

  count(): number {
    const row = this.db
      .prepare("SELECT COUNT(*) as count FROM attempts WHERE status != 'in_progress'")
      .get() as { count: number };
    return row.count;
  }

  averageScore(): number {
    const row = this.db
      .prepare(
        "SELECT COALESCE(AVG(percentage), 0) as avg FROM attempts WHERE status != 'in_progress'"
      )
      .get() as { avg: number };
    return Math.round(row.avg * 100) / 100;
  }

  getRecentAttempts(limit = 10): Array<{
    id: number;
    studentName: string;
    testTitle: string;
    score: number;
    percentage: number;
    completed_at: string | null;
  }> {
    return this.db
      .prepare(
        `SELECT a.id, u.name as studentName, t.title as testTitle, a.score, a.percentage, a.completed_at
         FROM attempts a
         JOIN users u ON u.id = a.user_id
         JOIN tests t ON t.id = a.test_id
         WHERE a.status != 'in_progress'
         ORDER BY a.completed_at DESC
         LIMIT ?`
      )
      .all(limit) as Array<{
      id: number;
      studentName: string;
      testTitle: string;
      score: number;
      percentage: number;
      completed_at: string | null;
    }>;
  }
}
