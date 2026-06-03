import bcrypt from 'bcryptjs';
import type Database from 'better-sqlite3';

export function runSeed(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
  if (count.c > 0) return;

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
  );

  insertUser.run('Admin User', 'admin@testprep.com', hash('admin123'), 'admin');
  insertUser.run('John Student', 'student@testprep.com', hash('student123'), 'student');
  insertUser.run('Jane Student', 'jane@testprep.com', hash('student123'), 'student');

  const insertTest = db.prepare(
    'INSERT INTO tests (title, description, duration, total_marks, is_published, created_by) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const testResult = insertTest.run(
    'General Knowledge Quiz',
    'A sample offline test covering basic general knowledge topics.',
    30,
    0,
    1,
    1
  );
  const testId = testResult.lastInsertRowid as number;

  const insertQuestion = db.prepare(`
    INSERT INTO questions (test_id, question, option_a, option_b, option_c, option_d, correct_answer, marks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const questions = [
    [
      'What is the capital of France?',
      'London',
      'Berlin',
      'Paris',
      'Madrid',
      'C',
      2,
    ],
    [
      'Which planet is known as the Red Planet?',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'B',
      2,
    ],
    [
      'What is 15 + 27?',
      '40',
      '42',
      '43',
      '41',
      'B',
      1,
    ],
    [
      'Who wrote Romeo and Juliet?',
      'Charles Dickens',
      'William Shakespeare',
      'Jane Austen',
      'Mark Twain',
      'B',
      2,
    ],
    [
      'What is the chemical symbol for water?',
      'O2',
      'H2O',
      'CO2',
      'NaCl',
      'B',
      3,
    ],
  ];

  let totalMarks = 0;
  for (const q of questions) {
    insertQuestion.run(testId, ...q);
    totalMarks += q[6] as number;
  }

  db.prepare('UPDATE tests SET total_marks = ? WHERE id = ?').run(totalMarks, testId);

  const insertTest2 = insertTest.run(
    'Mathematics Basics',
    'Fundamental arithmetic and algebra questions.',
    45,
    0,
    1,
    1
  );
  const testId2 = insertTest2.lastInsertRowid as number;

  const mathQuestions = [
    ['What is 8 × 7?', '54', '56', '58', '64', 'B', 2],
    ['Solve: 2x + 6 = 14', 'x = 2', 'x = 4', 'x = 6', 'x = 8', 'B', 3],
    ['What is √144?', '10', '11', '12', '14', 'C', 2],
  ];

  let totalMarks2 = 0;
  for (const q of mathQuestions) {
    insertQuestion.run(testId2, ...q);
    totalMarks2 += q[6] as number;
  }
  db.prepare('UPDATE tests SET total_marks = ? WHERE id = ?').run(totalMarks2, testId2);
}
