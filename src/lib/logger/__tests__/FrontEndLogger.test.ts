import { beforeEach, describe, expect, test, vi } from 'vitest';

// Tests added by the assistant.
// These tests focus on the public behavior of the logger:
// - level filtering
// - channel filtering
// - context propagation
// - timers (time/timeEnd)
// - API helpers and status-based level selection

let logger: typeof import('@@/lib/logger').logger; // temp type; reassigned after import

// Use module alias to import fresh instance each test without state leakage
const importLogger = async () => {
  const mod = await import('@/lib/logger');
  return mod.logger;
};

// Spies for console methods so we do not print during tests
let infoSpy: ReturnType<typeof vi.spyOn>;
let debugSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  vi.resetModules();
  infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  logger = await importLogger();
});

describe('FrontEndLogger', () => {
  test('filters by level: warn allows warn/error, filters info/debug', () => {
    logger.setLevel('warn');

    logger.debug('general', 'debug message');
    logger.info('general', 'info message');
    logger.warn('general', 'warn message');
    logger.error('general', 'error message');

    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test('disables channel: messages to disabled channel are suppressed', () => {
    logger.disableChannel('ui');
    // A debug log is emitted for channel change; clear it to isolate the assertion
    infoSpy.mockClear();
    debugSpy.mockClear();
    warnSpy.mockClear();
    errorSpy.mockClear();

    logger.info('ui', 'should be suppressed');
    expect(infoSpy).not.toHaveBeenCalled();
    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test('context propagation: userId, sessionId, requestId present in metadata', () => {
    logger.setUserId('user-123');
    logger.setSessionId('session-abc');
    logger.setRequestId('req-xyz');

    infoSpy.mockClear();
    logger.info('general', 'context test');

    expect(infoSpy).toHaveBeenCalled();
    const args = infoSpy.mock.calls[0];
    // Expect console signature: prefix, message, meta
    const meta = args[2] as Record<string, unknown>;
    expect(meta).toEqual(
      expect.objectContaining({
        userId: 'user-123',
        sessionId: 'session-abc',
        requestId: 'req-xyz',
      })
    );
  });

  test('timers: time/timeEnd without data includes performance in meta', () => {
    logger.time('performance', 'expensive-op');
    // Clear the debug message emitted by time()
    debugSpy.mockClear();
    infoSpy.mockClear();

    logger.timeEnd('performance', 'expensive-op');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    const call = infoSpy.mock.calls[0];
    const meta = call[2] as Record<string, unknown>;
    expect(meta).toEqual(
      expect.objectContaining({
        performance: expect.objectContaining({ duration: expect.any(Number) }),
      })
    );
  });

  test('timers: timeEnd with data logs provided data (ConsoleWrapper behavior)', () => {
    logger.time('performance', 'expensive-op');
    debugSpy.mockClear();
    infoSpy.mockClear();

    logger.timeEnd('performance', 'expensive-op', { foo: 'bar' });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    const call = infoSpy.mock.calls[0];
    const meta = call[2] as Record<string, unknown>;
    expect(meta).toEqual({ foo: 'bar' });
  });

  test('timeEnd without prior time warns', () => {
    warnSpy.mockClear();
    logger.timeEnd('performance', 'missing-timer');
    expect(warnSpy).toHaveBeenCalled();
  });

  test('API helpers: request logs info, response >=400 logs error', () => {
    infoSpy.mockClear();
    errorSpy.mockClear();

    logger.logApiRequest('api', 'GET', '/users');
    expect(infoSpy).toHaveBeenCalled();
    const reqMsg = infoSpy.mock.calls[0][1];
    expect(String(reqMsg)).toContain('API Request: GET /users');

    logger.logApiResponse('api', 'GET', '/users', 200);
    const lastInfoMsg = infoSpy.mock.calls[infoSpy.mock.calls.length - 1][1];
    expect(String(lastInfoMsg)).toContain('API Response: GET /users - 200');

    logger.logApiResponse('api', 'POST', '/users', 500);
    const errMsg = errorSpy.mock.calls[0][1];
    expect(String(errMsg)).toContain('API Response: POST /users - 500');
  });
});
