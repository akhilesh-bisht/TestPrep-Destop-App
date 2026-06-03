import type Database from 'better-sqlite3';
import { AttemptRepository } from '../repositories/attempt.repository';
import { TestRepository } from '../repositories/test.repository';
import { UserRepository } from '../repositories/user.repository';
import type { DashboardStats } from '../types';

export class DashboardService {
  private testRepo: TestRepository;
  private userRepo: UserRepository;
  private attemptRepo: AttemptRepository;

  constructor(db: Database.Database) {
    this.testRepo = new TestRepository(db);
    this.userRepo = new UserRepository(db);
    this.attemptRepo = new AttemptRepository(db);
  }

  getAdminStats(): DashboardStats {
    return {
      totalTests: this.testRepo.count(),
      totalStudents: this.userRepo.countByRole('student'),
      totalAttempts: this.attemptRepo.count(),
      averageScore: this.attemptRepo.averageScore(),
      recentAttempts: this.attemptRepo.getRecentAttempts(8),
    };
  }
}
