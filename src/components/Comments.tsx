'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CommentSkeleton } from '@/components/LoadingSpinner';
import { useToast } from '@/components/ToastProvider';
import { validateForm, validationRules } from '@/components/FormValidation';

interface Comment {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (session?.user) {
      setAuthorName(session.user.name || '');
      setAuthorEmail(session.user.email || '');
    }
  }, [session]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setErrors({});

    // Validate form
    const formData = { 
      content: newComment, 
      authorName, 
      authorEmail 
    };
    const validation = validateForm(formData, {
      content: validationRules.commentContent,
      authorName: validationRules.authorName,
      authorEmail: validationRules.email
    });

    if (!validation.isValid) {
      const fieldErrors: Record<string, string[]> = {};
      validation.errors.forEach(error => {
        const [field, message] = error.split(': ');
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(message);
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          authorName,
          authorEmail,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment('');
        setError('');
        showSuccess('Comment posted successfully!');
      } else {
        const data = await response.json();
        const errorMessage = data.error || 'Failed to post comment';
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (error) {
      const errorMessage = 'An error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Comments</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="space-y-4">
          {!session && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.authorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.authorName && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.authorName.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="authorEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="authorEmail"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.authorEmail ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.authorEmail && (
                    <div className="text-red-600 text-sm mt-1">
                      {errors.authorEmail.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comment *
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Share your thoughts..."
            />
            {errors.content && (
              <div className="text-red-600 text-sm mt-1">
                {errors.content.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900">
                  {comment.user?.name || comment.authorName}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 