import { createCommentSchema } from '@/lib/validation';

describe('createCommentSchema', () => {
  it('should validate a correct comment payload', () => {
    const valid = {
      content: 'Nice post!',
      authorName: 'Alice',
      authorEmail: 'alice@example.com',
      postId: 1,
    };
    expect(() => createCommentSchema.parse(valid)).not.toThrow();
  });

  it('should fail if content is missing', () => {
    const invalid = {
      authorName: 'Bob',
      authorEmail: 'bob@example.com',
      postId: 1,
    };
    expect(() => createCommentSchema.parse(invalid)).toThrow();
  });

  it('should fail if authorName is missing', () => {
    const invalid = {
      content: 'Missing name',
      authorEmail: 'bob@example.com',
      postId: 1,
    };
    expect(() => createCommentSchema.parse(invalid)).toThrow();
  });

  it('should fail if authorEmail is invalid', () => {
    const invalid = {
      content: 'Bad email',
      authorName: 'Bob',
      authorEmail: 'not-an-email',
      postId: 1,
    };
    expect(() => createCommentSchema.parse(invalid)).toThrow();
  });

  it('should fail if postId is not a positive integer', () => {
    const invalid = {
      content: 'Bad postId',
      authorName: 'Bob',
      authorEmail: 'bob@example.com',
      postId: 0,
    };
    expect(() => createCommentSchema.parse(invalid)).toThrow();
  });
}); 