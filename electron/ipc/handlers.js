const { ipcMain } = require('electron');
const path = require('path');

let appInstance = null;

function getBackend() {
  const backendPath = path.join(process.cwd(), 'backend', 'dist', 'index.js');
  return require(backendPath);
}

function ensureApp(paths) {
  if (!appInstance) {
    const { initApp, App } = getBackend();
    const db = initApp(paths.dbPath, paths.migrationsDir);
    appInstance = new App(db);
  }
  return appInstance;
}

function registerIpcHandlers(paths) {
  const channels = {
    'auth:login': (payload) => ensureApp(paths).login(payload),
    'auth:profile': (userId) => ensureApp(paths).getProfile(userId),
    'dashboard:adminStats': () => ensureApp(paths).getAdminStats(),
    'tests:list': (publishedOnly) => ensureApp(paths).listTests(publishedOnly),
    'tests:get': (id) => ensureApp(paths).getTest(id),
    'tests:create': (payload, createdBy) => ensureApp(paths).createTest(payload, createdBy),
    'tests:createFromExcel': (payload, fileBuffer, createdBy) =>
      ensureApp(paths).createTestFromExcel(payload, Buffer.from(fileBuffer), createdBy),
    'tests:update': (id, payload) => ensureApp(paths).updateTest(id, payload),
    'tests:delete': (id) => ensureApp(paths).deleteTest(id),
    'questions:list': (testId) => ensureApp(paths).getQuestions(testId),
    'questions:add': (payload) => ensureApp(paths).addQuestion(payload),
    'questions:delete': (id) => ensureApp(paths).deleteQuestion(id),
    'questions:import': (testId, buffer) =>
      ensureApp(paths).importQuestions(testId, Buffer.from(buffer)),
    'attempts:start': (userId, testId) => ensureApp(paths).startAttempt(userId, testId),
    'attempts:saveAnswer': (payload) => ensureApp(paths).saveAnswer(payload),
    'attempts:submit': (attemptId, autoSubmit) =>
      ensureApp(paths).submitAttempt(attemptId, autoSubmit),
    'attempts:session': (attemptId) => ensureApp(paths).getAttemptSession(attemptId),
    'attempts:result': (attemptId) => ensureApp(paths).getResult(attemptId),
    'attempts:history': (userId) => ensureApp(paths).getUserHistory(userId),
    'attempts:all': () => ensureApp(paths).getAllAttempts(),
    'analytics:user': (userId) => ensureApp(paths).getAnalytics(userId),
  };

  for (const [channel, handler] of Object.entries(channels)) {
    ipcMain.handle(channel, async (_event, ...args) => handler(...args));
  }
}

module.exports = { registerIpcHandlers };
