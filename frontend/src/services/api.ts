import type { ApiResponse } from '@/types';

async function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!window.electronAPI) {
    throw new Error('Desktop API not available. Run the app via Electron.');
  }
  const response = (await window.electronAPI.invoke(channel, ...args)) as ApiResponse<T>;
  if (!response.success) {
    throw new Error(response.error || 'Request failed');
  }
  return response.data as T;
}

export const api = {
  login: (payload: { email: string; password: string; role?: string }) =>
    invoke('auth:login', payload),
  getProfile: (userId: number) => invoke('auth:profile', userId),
  getAdminStats: () => invoke('dashboard:adminStats'),
  listTests: (publishedOnly?: boolean) => invoke('tests:list', publishedOnly),
  getTest: (id: number) => invoke('tests:get', id),
  createTest: (payload: unknown, createdBy?: number) => invoke('tests:create', payload, createdBy),
  createTestWithExcel: (payload: unknown, buffer: ArrayBuffer, createdBy?: number) =>
    invoke('tests:createFromExcel', payload, buffer, createdBy),
  updateTest: (id: number, payload: unknown) => invoke('tests:update', id, payload),
  deleteTest: (id: number) => invoke('tests:delete', id),
  getQuestions: (testId: number) => invoke('questions:list', testId),
  addQuestion: (payload: unknown) => invoke('questions:add', payload),
  deleteQuestion: (id: number) => invoke('questions:delete', id),
  importQuestions: (testId: number, buffer: ArrayBuffer) =>
    invoke('questions:import', testId, buffer),
  startAttempt: (userId: number, testId: number) => invoke('attempts:start', userId, testId),
  saveAnswer: (payload: unknown) => invoke('attempts:saveAnswer', payload),
  submitAttempt: (attemptId: number, autoSubmit?: boolean) =>
    invoke('attempts:submit', attemptId, autoSubmit),
  getAttemptSession: (attemptId: number) => invoke('attempts:session', attemptId),
  getResult: (attemptId: number) => invoke('attempts:result', attemptId),
  getUserHistory: (userId: number) => invoke('attempts:history', userId),
  getAllAttempts: () => invoke('attempts:all'),
  getAnalytics: (userId: number) => invoke('analytics:user', userId),
  openExcelFile: async () => {
    if (!window.electronAPI?.openExcelFile) return null;
    return window.electronAPI.openExcelFile();
  },
};
