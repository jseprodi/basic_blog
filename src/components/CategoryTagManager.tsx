'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { validateForm, validationRules } from '@/components/FormValidation';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface CategoryTagManagerProps {
  selectedCategoryId?: number | null;
  selectedTagIds: number[];
  onCategoryChange: (categoryId: number | null) => void;
  onTagsChange: (tagIds: number[]) => void;
}

export default function CategoryTagManager({
  selectedCategoryId,
  selectedTagIds,
  onCategoryChange,
  onTagsChange,
}: CategoryTagManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [tagError, setTagError] = useState('');
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const createCategory = async () => {
    if (!newCategory.trim()) return;

    // Validate category name
    const validation = validateForm({ name: newCategory.trim() }, {
      name: validationRules.categoryName
    });

    if (!validation.isValid) {
      setCategoryError(validation.errors[0]?.split(': ')[1] || 'Invalid category name');
      return;
    }

    setCategoryError('');

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (response.ok) {
        const category = await response.json();
        setCategories([...categories, category]);
        setNewCategory('');
        showSuccess('Category created successfully!');
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showError('An error occurred while creating the category');
    }
  };

  const createTag = async () => {
    if (!newTag.trim()) return;

    // Validate tag name
    const validation = validateForm({ name: newTag.trim() }, {
      name: validationRules.tagName
    });

    if (!validation.isValid) {
      setTagError(validation.errors[0]?.split(': ')[1] || 'Invalid tag name');
      return;
    }

    setTagError('');

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim() }),
      });

      if (response.ok) {
        const tag = await response.json();
        setTags([...tags, tag]);
        setNewTag('');
        showSuccess('Tag created successfully!');
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      showError('An error occurred while creating the tag');
    }
  };

  const toggleTag = (tagId: number) => {
    const newSelectedTags = selectedTagIds.includes(tagId)
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];
    onTagsChange(newSelectedTags);
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategoryId || ''}
          onChange={(e) => onCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Add new category */}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${
              categoryError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={createCategory}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Add
          </button>
        </div>
        {categoryError && (
          <div className="text-red-600 text-sm mt-1">{categoryError}</div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTagIds.includes(tag.id)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* Add new tag */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="New tag name"
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 ${
              tagError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={createTag}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Add
          </button>
        </div>
        {tagError && (
          <div className="text-red-600 text-sm mt-1">{tagError}</div>
        )}
      </div>
    </div>
  );
} 