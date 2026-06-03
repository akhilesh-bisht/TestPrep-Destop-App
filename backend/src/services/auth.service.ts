import type Database from 'better-sqlite3';
import { AppError } from '../helpers/errors';
import { comparePassword } from '../helpers/password';
import { UserRepository } from '../repositories/user.repository';
import { loginSchema, type LoginInput } from '../validators/auth.validator';
import type { UserPublic } from '../types';

export class AuthService {
  private userRepo: UserRepository;

  constructor(db: Database.Database) {
    this.userRepo = new UserRepository(db);
  }

  login(input: LoginInput): UserPublic {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Invalid input');
    }

    const { email, password, role } = parsed.data;
    const user = this.userRepo.findByEmail(email);
    if (!user || !comparePassword(password, user.password)) {
      throw new AppError('Invalid email or password', 401);
    }

    if (role && user.role !== role) {
      throw new AppError(`Please use ${user.role} login`, 403);
    }

    return this.userRepo.toPublic(user);
  }

  getProfile(userId: number): UserPublic {
    const user = this.userRepo.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return this.userRepo.toPublic(user);
  }
}
