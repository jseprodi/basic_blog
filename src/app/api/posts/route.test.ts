import { createPostSchema } from '@/lib/validation';

describe('createPostSchema', () => {
  it('should validate a correct post payload', () => {
    const valid = {
      title: 'Test Post',
      content: 'This is a test post.',
      excerpt: 'A test excerpt',
      featuredImage: 'https://example.com/image.jpg',
      published: true,
      categoryId: 1,
      tagIds: [1, 2],
    };
    expect(() => createPostSchema.parse(valid)).not.toThrow();
  });

  it('should fail if title is missing', () => {
    const invalid = {
      content: 'No title',
    };
    expect(() => createPostSchema.parse(invalid)).toThrow();
  });

  it('should fail if content is missing', () => {
    const invalid = {
      title: 'No content',
    };
    expect(() => createPostSchema.parse(invalid)).toThrow();
  });

  it('should fail if featuredImage is not a valid URL', () => {
    const invalid = {
      title: 'Bad image',
      content: 'Test',
      featuredImage: 'not-a-url',
    };
    expect(() => createPostSchema.parse(invalid)).toThrow();
  });

  it('should default published to false if not provided', () => {
    const valid = {
      title: 'Draft',
      content: 'Draft content',
    };
    const result = createPostSchema.parse(valid);
    expect(result.published).toBe(false);
  });
}); 