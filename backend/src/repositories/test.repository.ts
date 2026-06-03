import type Database from 'better-sqlite3';
import type { Test } from '../types';

export class TestRepository {
  constructor(private db: Database.Database) {}

  findAll(publishedOnly = false): Test[] {
    if (publishedOnly) {
      return this.db
        .prepare('SELECT * FROM tests WHERE is_published = 1 ORDER BY updated_at DESC')
        .all() as Test[];
    }
    return this.db.prepare('SELECT * FROM tests ORDER BY updated_at DESC').all() as Test[];
  }

  findById(id: number): Test | undefined {
    return this.db.prepare('SELECT * FROM tests WHERE id = ?').get(id) as Test | undefined;
  }

  create(data: {
    title: string;
    description?: string;
    duration: number;
    isPublished?: boolean;
    createdBy?: number;
  }): Test {
    const result = this.db
      .prepare(
        `INSERT INTO tests (title, description, duration, is_published, created_by)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(
        data.title,
        data.description ?? null,
        data.duration,
        data.isPublished ? 1 : 0,
        data.createdBy ?? null
      );
    return this.findById(result.lastInsertRowid as number)!;
  }

  update(
    id: number,
    data: Partial<{
      title: string;
      description: string;
      duration: number;
      isPublished: boolean;
      totalMarks: number;
    }>
  ): Test | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    this.db
      .prepare(
        `UPDATE tests SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          duration = COALESCE(?, duration),
          is_published = COALESCE(?, is_published),
          total_marks = COALESCE(?, total_marks),
          updated_at = datetime('now')
         WHERE id = ?`
      )
      .run(
        data.title ?? null,
        data.description ?? null,
        data.duration ?? null,
        data.isPublished !== undefined ? (data.isPublished ? 1 : 0) : null,
        data.totalMarks ?? null,
        id
      );
    return this.findById(id);
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM tests WHERE id = ?').run(id);
    return result.changes > 0;
  }

  recalculateTotalMarks(testId: number): number {
    const row = this.db
      .prepare('SELECT COALESCE(SUM(marks), 0) as total FROM questions WHERE test_id = ?')
      .get(testId) as { total: number };
    this.db
      .prepare("UPDATE tests SET total_marks = ?, updated_at = datetime('now') WHERE id = ?")
      .run(row.total, testId);
    return row.total;
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM tests').get() as { count: number };
    return row.count;
  }
}
