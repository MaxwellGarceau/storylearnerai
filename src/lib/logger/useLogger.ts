import { useCallback, useRef } from 'react';
import { logger } from './FrontEndLogger';
import { LogLevel, LogChannel } from './types';

function useLogger() {
  const loggerRef = useRef(logger);

  const log = useCallback((level: LogLevel, channel: LogChannel, message: string, data?: unknown) => {
    loggerRef.current[level](channel, message, data);
  }, []);

  const error = useCallback((channel: LogChannel, message: string, data?: unknown) => {
    loggerRef.current.error(channel, message, data);
  }, []);

  const warn = useCallback((channel: LogChannel, message: string, data?: unknown) => {
    loggerRef.current.warn(channel, message, data);
  }, []);

  const info = useCallback((channel: LogChannel, message: string, data?: unknown) => {
    loggerRef.current.info(channel, message, data);
  }, []);

  const debug = useCallback((channel: LogChannel, message: string, data?: unknown) => {
    loggerRef.current.debug(channel, message, data);
  }, []);

  const time = useCallback((channel: LogChannel, label: string) => {
    loggerRef.current.time(channel, label);
  }, []);

  const timeEnd = useCallback((channel: LogChannel, label: string, data?: unknown) => {
    loggerRef.current.timeEnd(channel, label, data);
  }, []);

  const logError = useCallback((channel: LogChannel, error: Error, context?: unknown) => {
    loggerRef.current.logError(channel, error, context);
  }, []);

  const logApiRequest = useCallback((channel: LogChannel, method: string, url: string, data?: unknown) => {
    loggerRef.current.logApiRequest(channel, method, url, data);
  }, []);

  const logApiResponse = useCallback((channel: LogChannel, method: string, url: string, status: number, data?: unknown) => {
    loggerRef.current.logApiResponse(channel, method, url, status, data);
  }, []);

  const setUserId = useCallback((userId: string) => {
    loggerRef.current.setUserId(userId);
  }, []);

  const setRequestId = useCallback((requestId?: string) => {
    loggerRef.current.setRequestId(requestId);
  }, []);

  return {
    log,
    error,
    warn,
    info,
    debug,
    time,
    timeEnd,
    logError,
    logApiRequest,
    logApiResponse,
    setUserId,
    setRequestId,
  };
}
