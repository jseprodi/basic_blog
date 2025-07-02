import { reportError, reportMessage, addBreadcrumb, setUser, setTag, setContext } from './error-reporting';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
}));

describe('Error Reporting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reportError', () => {
    it('should capture exception with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'test' };
      
      reportError(error, context);
      
      const { captureException } = require('@sentry/nextjs');
      expect(captureException).toHaveBeenCalledWith(error, {
        contexts: {
          custom: context,
        },
      });
    });

    it('should capture exception without context', () => {
      const error = new Error('Test error');
      
      reportError(error);
      
      const { captureException } = require('@sentry/nextjs');
      expect(captureException).toHaveBeenCalledWith(error, {
        contexts: {
          custom: {},
        },
      });
    });
  });

  describe('reportMessage', () => {
    it('should capture message with default level', () => {
      const message = 'Test message';
      
      reportMessage(message);
      
      const { captureMessage } = require('@sentry/nextjs');
      expect(captureMessage).toHaveBeenCalledWith(message, {
        level: 'info',
        contexts: {
          custom: {},
        },
      });
    });

    it('should capture message with custom level and context', () => {
      const message = 'Test message';
      const level = 'error';
      const context = { userId: '123' };
      
      reportMessage(message, level, context);
      
      const { captureMessage } = require('@sentry/nextjs');
      expect(captureMessage).toHaveBeenCalledWith(message, {
        level,
        contexts: {
          custom: context,
        },
      });
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb with data', () => {
      const message = 'Test breadcrumb';
      const category = 'test';
      const data = { userId: '123' };
      
      addBreadcrumb(message, category, data);
      
      const { addBreadcrumb: sentryAddBreadcrumb } = require('@sentry/nextjs');
      expect(sentryAddBreadcrumb).toHaveBeenCalledWith({
        message,
        category,
        data,
        level: 'info',
      });
    });
  });

  describe('setUser', () => {
    it('should set user context', () => {
      const user = { id: '123', email: 'test@example.com' };
      
      setUser(user);
      
      const { setUser: sentrySetUser } = require('@sentry/nextjs');
      expect(sentrySetUser).toHaveBeenCalledWith(user);
    });
  });

  describe('setTag', () => {
    it('should set tag', () => {
      const key = 'environment';
      const value = 'production';
      
      setTag(key, value);
      
      const { setTag: sentrySetTag } = require('@sentry/nextjs');
      expect(sentrySetTag).toHaveBeenCalledWith(key, value);
    });
  });

  describe('setContext', () => {
    it('should set context', () => {
      const name = 'user';
      const context = { id: '123', role: 'admin' };
      
      setContext(name, context);
      
      const { setContext: sentrySetContext } = require('@sentry/nextjs');
      expect(sentrySetContext).toHaveBeenCalledWith(name, context);
    });
  });
}); 