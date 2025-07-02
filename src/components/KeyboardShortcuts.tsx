'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from './ToastProvider';

interface KeyboardShortcutsProps {
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onNewPost?: () => void;
  onDashboard?: () => void;
  onHome?: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
}

export default function KeyboardShortcuts({
  onSave,
  onPublish,
  onPreview,
  onNewPost,
  onDashboard,
  onHome,
  onSearch,
  onHelp,
}: KeyboardShortcutsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showSuccess } = useToast();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields, textareas, or contenteditable
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      return;
    }

    // Ctrl/Cmd + S: Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if (onSave) {
        onSave();
        showSuccess('Saving...');
      }
    }

    // Ctrl/Cmd + Enter: Publish
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      if (onPublish) {
        onPublish();
      }
    }

    // Ctrl/Cmd + P: Preview
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      if (onPreview) {
        onPreview();
      }
    }

    // Ctrl/Cmd + N: New Post
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      if (onNewPost) {
        onNewPost();
      } else if (session) {
        router.push('/dashboard/new');
      }
    }

    // Ctrl/Cmd + D: Dashboard
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault();
      if (onDashboard) {
        onDashboard();
      } else if (session) {
        router.push('/dashboard');
      }
    }

    // Ctrl/Cmd + H: Home
    if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
      event.preventDefault();
      if (onHome) {
        onHome();
      } else {
        router.push('/');
      }
    }

    // Ctrl/Cmd + K: Search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      if (onSearch) {
        onSearch();
      } else {
        // Focus search bar if it exists
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    }

    // F1 or Ctrl/Cmd + ?: Help
    if (event.key === 'F1' || ((event.ctrlKey || event.metaKey) && event.key === '?')) {
      event.preventDefault();
      if (onHelp) {
        onHelp();
      } else {
        showKeyboardShortcuts();
      }
    }

    // Escape: Close modals, clear search, etc.
    if (event.key === 'Escape') {
      // Clear search if focused
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
      }
    }
  }, [onSave, onPublish, onPreview, onNewPost, onDashboard, onHome, onSearch, onHelp, router, session, showSuccess]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const showKeyboardShortcuts = () => {
    const shortcuts = [
      { key: 'Ctrl/Cmd + S', description: 'Save post' },
      { key: 'Ctrl/Cmd + Enter', description: 'Publish post' },
      { key: 'Ctrl/Cmd + P', description: 'Preview post' },
      { key: 'Ctrl/Cmd + N', description: 'New post' },
      { key: 'Ctrl/Cmd + D', description: 'Go to dashboard' },
      { key: 'Ctrl/Cmd + H', description: 'Go to home' },
      { key: 'Ctrl/Cmd + K', description: 'Search' },
      { key: 'F1 or Ctrl/Cmd + ?', description: 'Show keyboard shortcuts' },
      { key: 'Escape', description: 'Clear search / Close modals' },
    ];

    const shortcutsText = shortcuts
      .map(shortcut => `${shortcut.key}: ${shortcut.description}`)
      .join('\n');

    alert(`Keyboard Shortcuts:\n\n${shortcutsText}`);
  };

  // This component doesn't render anything, it just handles keyboard events
  return null;
}

// Hook for using keyboard shortcuts in components
export function useKeyboardShortcuts(callbacks: Partial<KeyboardShortcutsProps>) {
  return (
    <KeyboardShortcuts
      onSave={callbacks.onSave}
      onPublish={callbacks.onPublish}
      onPreview={callbacks.onPreview}
      onNewPost={callbacks.onNewPost}
      onDashboard={callbacks.onDashboard}
      onHome={callbacks.onHome}
      onSearch={callbacks.onSearch}
      onHelp={callbacks.onHelp}
    />
  );
} 