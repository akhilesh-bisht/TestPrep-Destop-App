import { z } from 'zod';

export const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  duration: z.number().int().min(1).max(600),
  isPublished: z.boolean().optional(),
});

export const updateTestSchema = createTestSchema.partial();

export const createQuestionSchema = z.object({
  testId: z.number().int().positive(),
  question: z.string().min(1),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctAnswer: z.enum(['A', 'B', 'C', 'D']),
  marks: z.number().int().min(1).max(100).default(1),
});

export const saveAnswerSchema = z.object({
  attemptId: z.number().int().positive(),
  questionId: z.number().int().positive(),
  selectedAnswer: z.enum(['A', 'B', 'C', 'D']).nullable(),
});

export type CreateTestInput = z.infer<typeof createTestSchema>;
export type UpdateTestInput = z.infer<typeof updateTestSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
