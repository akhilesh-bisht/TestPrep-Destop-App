import type Database from 'better-sqlite3';
import type { User, UserPublic, UserRole } from '../types';

export class UserRepository {
  constructor(private db: Database.Database) {}

  findByEmail(email: string): User | undefined {
    return this.db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.toLowerCase()) as User | undefined;
  }

  findById(id: number): User | undefined {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  }

  findAllByRole(role: UserRole): UserPublic[] {
    return this.db
      .prepare('SELECT id, name, email, role FROM users WHERE role = ? ORDER BY name')
      .all(role) as UserPublic[];
  }

  countByRole(role: UserRole): number {
    const row = this.db
      .prepare('SELECT COUNT(*) as count FROM users WHERE role = ?')
      .get(role) as { count: number };
    return row.count;
  }

  toPublic(user: User): UserPublic {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
