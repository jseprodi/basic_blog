import { z } from 'zod';

// Base schemas for common fields
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const nameSchema = z.string().min(1, 'Name is required').max(100, 'Name too long');
export const titleSchema = z.string().min(1, 'Title is required').max(200, 'Title too long');
export const contentSchema = z.string().min(1, 'Content is required');
export const slugSchema = z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

// User validation schemas
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  name: nameSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Post validation schemas
export const createPostSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  featuredImage: z.string().url('Invalid image URL').optional().or(z.literal('')),
  published: z.boolean().default(false),
  categoryId: z.number().int().positive().optional(),
  tagIds: z.array(z.number().int().positive()).default([]),
});

export const updatePostSchema = z.object({
  title: titleSchema.optional(),
  content: contentSchema.optional(),
  excerpt: z.string().max(500, 'Excerpt too long').optional(),
  featuredImage: z.string().url('Invalid image URL').optional(),
  published: z.boolean().optional(),
  categoryId: z.number().int().positive().optional(),
  tagIds: z.array(z.number().int().positive()).optional(),
});

// Category validation schemas
export const createCategorySchema = z.object({
  name: nameSchema,
  slug: slugSchema,
});

export const updateCategorySchema = z.object({
  name: nameSchema.optional(),
  slug: slugSchema.optional(),
});

// Tag validation schemas
export const createTagSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
});

export const updateTagSchema = z.object({
  name: nameSchema.optional(),
  slug: slugSchema.optional(),
});

// Comment validation schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
  authorName: nameSchema,
  authorEmail: emailSchema,
  postId: z.number().int().positive('Invalid post ID'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(1000, 'Comment too long'),
  approved: z.boolean().optional(),
});

// Search validation schema
export const searchSchema = z.object({
  search: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
});

// Pagination validation schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// File upload validation schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
    'File must be an image (JPEG, PNG, WebP, or GIF)'
  ),
});

// Utility function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid request body' };
  }
}

// Utility function to validate query parameters
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid query parameters' };
  }
}

// Sanitize HTML content to prevent XSS
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Type exports for use in API routes
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>; 