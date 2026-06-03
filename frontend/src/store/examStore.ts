import { create } from 'zustand';
import type { Attempt, Question, Test } from '@/types';

interface ExamState {
  attempt: Attempt | null;
  test: Test | null;
  questions: Question[];
  answers: Record<number, string | null>;
  currentIndex: number;
  timeLeftSeconds: number;
  setSession: (data: {
    attempt: Attempt;
    test: Test;
    questions: Question[];
    answers: Record<number, string | null>;
    timeLeftSeconds: number;
  }) => void;
  setAnswer: (questionId: number, answer: string | null) => void;
  setCurrentIndex: (index: number) => void;
  setTimeLeft: (seconds: number) => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>((set) => ({
  attempt: null,
  test: null,
  questions: [],
  answers: {},
  currentIndex: 0,
  timeLeftSeconds: 0,
  setSession: (data) =>
    set({
      attempt: data.attempt,
      test: data.test,
      questions: data.questions,
      answers: data.answers,
      timeLeftSeconds: data.timeLeftSeconds,
      currentIndex: 0,
    }),
  setAnswer: (questionId, answer) =>
    set((s) => ({ answers: { ...s.answers, [questionId]: answer } })),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setTimeLeft: (seconds) => set({ timeLeftSeconds: seconds }),
  reset: () =>
    set({
      attempt: null,
      test: null,
      questions: [],
      answers: {},
      currentIndex: 0,
      timeLeftSeconds: 0,
    }),
}));
