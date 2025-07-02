export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  // Required validation
  if (rules.required && (!value || value.trim() === '')) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and not required
  if (!value || value.trim() === '') {
    return { isValid: true, errors: [] };
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('Invalid format');
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult => {
  const errors: string[] = [];
  let isValid = true;

  for (const [field, fieldRules] of Object.entries(rules)) {
    const fieldValue = data[field];
    const fieldValidation = validateField(fieldValue, fieldRules);
    
    if (!fieldValidation.isValid) {
      isValid = false;
      errors.push(...fieldValidation.errors.map(error => `${field}: ${error}`));
    }
  }

  return { isValid, errors };
};

// Common validation rules
export const validationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  content: {
    required: true,
    minLength: 10
  },
  excerpt: {
    maxLength: 500
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    required: true,
    minLength: 6
  },
  url: {
    pattern: /^https?:\/\/.+/,
    custom: (value: string) => {
      try {
        new URL(value);
        return null;
      } catch {
        return 'Please enter a valid URL';
      }
    }
  },
  categoryName: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  tagName: {
    required: true,
    minLength: 2,
    maxLength: 30
  },
  commentContent: {
    required: true,
    minLength: 1,
    maxLength: 1000
  },
  authorName: {
    required: true,
    minLength: 2,
    maxLength: 100
  }
}; 