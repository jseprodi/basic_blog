interface ModerationResult {
  isApproved: boolean;
  isFlagged: boolean;
  flags: string[];
  confidence: number;
  reason?: string;
}

interface ModerationRule {
  type: 'keyword' | 'regex' | 'length' | 'spam';
  pattern: string | RegExp;
  action: 'flag' | 'reject' | 'review';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

class ContentModerationService {
  private rules: ModerationRule[] = [
    // Spam patterns
    {
      type: 'regex',
      pattern: /\b(?:buy\s+now|click\s+here|free\s+offer|limited\s+time|act\s+now)\b/i,
      action: 'flag',
      severity: 'medium',
      description: 'Spam keywords detected',
    },
    {
      type: 'regex',
      pattern: /\b(?:http|https|www\.)\S+/g,
      action: 'flag',
      severity: 'low',
      description: 'URLs detected',
    },
    {
      type: 'regex',
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
      action: 'flag',
      severity: 'low',
      description: 'Email address detected',
    },
    // Inappropriate content
    {
      type: 'keyword',
      pattern: 'spam',
      action: 'reject',
      severity: 'high',
      description: 'Spam content detected',
    },
    // Length checks
    {
      type: 'length',
      pattern: '1000',
      action: 'flag',
      severity: 'low',
      description: 'Comment too long',
    },
  ];

  // Moderate text content
  async moderateText(text: string, contentType: 'comment' | 'post' = 'comment'): Promise<ModerationResult> {
    const flags: string[] = [];
    let confidence = 0;
    let isFlagged = false;
    let isApproved = true;

    // Check each rule
    for (const rule of this.rules) {
      const matches = this.checkRule(text, rule);
      
      if (matches.length > 0) {
        isFlagged = true;
        flags.push(rule.description);
        
        // Adjust confidence based on severity
        switch (rule.severity) {
          case 'high':
            confidence += 0.8;
            if (rule.action === 'reject') {
              isApproved = false;
            }
            break;
          case 'medium':
            confidence += 0.5;
            break;
          case 'low':
            confidence += 0.2;
            break;
        }
      }
    }

    // Additional checks for comments
    if (contentType === 'comment') {
      // Check for repetitive characters
      if (this.hasRepetitiveCharacters(text)) {
        isFlagged = true;
        flags.push('Repetitive characters detected');
        confidence += 0.3;
      }

      // Check for all caps
      if (this.isAllCaps(text)) {
        isFlagged = true;
        flags.push('All caps text detected');
        confidence += 0.2;
      }

      // Check for excessive punctuation
      if (this.hasExcessivePunctuation(text)) {
        isFlagged = true;
        flags.push('Excessive punctuation detected');
        confidence += 0.2;
      }
    }

    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      isApproved,
      isFlagged,
      flags,
      confidence,
      reason: flags.length > 0 ? flags.join('; ') : undefined,
    };
  }

  // Moderate user behavior
  async moderateUserBehavior(userId: string, action: 'comment' | 'post' | 'login'): Promise<ModerationResult> {
    // This would typically check against a database of user behavior
    // For now, return a basic result
    return {
      isApproved: true,
      isFlagged: false,
      flags: [],
      confidence: 0,
    };
  }

  // Check if content contains repetitive characters
  private hasRepetitiveCharacters(text: string): boolean {
    const repetitivePatterns = [
      /(.)\1{4,}/g, // Same character repeated 5+ times
      /(..)\1{3,}/g, // Same pair repeated 4+ times
    ];

    return repetitivePatterns.some(pattern => pattern.test(text));
  }

  // Check if text is all caps
  private isAllCaps(text: string): boolean {
    const words = text.split(/\s+/).filter(word => word.length > 2);
    if (words.length === 0) return false;
    
    const allCapsWords = words.filter(word => word === word.toUpperCase());
    return allCapsWords.length / words.length > 0.7; // 70% of words are caps
  }

  // Check for excessive punctuation
  private hasExcessivePunctuation(text: string): boolean {
    const punctuationCount = (text.match(/[!?.,;:]/g) || []).length;
    const wordCount = text.split(/\s+/).length;
    
    return punctuationCount / wordCount > 0.3; // More than 30% punctuation
  }

  // Check a specific rule against text
  private checkRule(text: string, rule: ModerationRule): string[] {
    const matches: string[] = [];

    switch (rule.type) {
      case 'keyword':
        if (typeof rule.pattern === 'string' && text.toLowerCase().includes(rule.pattern.toLowerCase())) {
          matches.push(rule.pattern);
        }
        break;
      
      case 'regex':
        const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'gi') : rule.pattern;
        const found = text.match(regex);
        if (found) {
          matches.push(...found);
        }
        break;
      
      case 'length':
        const maxLength = parseInt(rule.pattern as string);
        if (text.length > maxLength) {
          matches.push(`Length ${text.length} exceeds ${maxLength}`);
        }
        break;
    }

    return matches;
  }

  // Add custom rule
  addRule(rule: ModerationRule): void {
    this.rules.push(rule);
  }

  // Remove rule by description
  removeRule(description: string): void {
    this.rules = this.rules.filter(rule => rule.description !== description);
  }

  // Get all rules
  getRules(): ModerationRule[] {
    return [...this.rules];
  }
}

export const contentModeration = new ContentModerationService(); 