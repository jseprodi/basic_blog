interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface PageViewEvent {
  page_title: string;
  page_location: string;
  page_referrer?: string;
}

class AnalyticsService {
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    
    // Initialize Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      this.isInitialized = true;
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    this.initialize();

    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });
    }

    // Send to your own analytics endpoint
    this.sendToAnalytics({
      type: 'event',
      data: event,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
    });
  }

  // Track page views
  trackPageView(pageView: PageViewEvent) {
    this.initialize();

    // Send to Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: pageView.page_title,
        page_location: pageView.page_location,
        page_referrer: pageView.page_referrer,
      });
    }

    // Send to your own analytics endpoint
    this.sendToAnalytics({
      type: 'pageview',
      data: pageView,
      timestamp: new Date().toISOString(),
      session_id: this.getSessionId(),
    });
  }

  // Track user engagement
  trackEngagement(action: string, label?: string, value?: number) {
    this.trackEvent({
      event: 'engagement',
      category: 'user_interaction',
      action,
      label,
      value,
    });
  }

  // Track search events
  trackSearch(query: string, resultsCount: number) {
    this.trackEvent({
      event: 'search',
      category: 'search',
      action: 'search',
      label: query,
      value: resultsCount,
      custom_parameters: {
        search_term: query,
        results_count: resultsCount,
      },
    });
  }

  // Track post interactions
  trackPostView(postId: number, postTitle: string) {
    this.trackEvent({
      event: 'post_view',
      category: 'content',
      action: 'view',
      label: postTitle,
      value: postId,
      custom_parameters: {
        post_id: postId,
        post_title: postTitle,
      },
    });
  }

  trackPostShare(postId: number, postTitle: string, platform: string) {
    this.trackEvent({
      event: 'post_share',
      category: 'social',
      action: 'share',
      label: platform,
      value: postId,
      custom_parameters: {
        post_id: postId,
        post_title: postTitle,
        platform,
      },
    });
  }

  // Track comment interactions
  trackCommentSubmit(postId: number, commentLength: number) {
    this.trackEvent({
      event: 'comment_submit',
      category: 'engagement',
      action: 'submit',
      label: `post_${postId}`,
      value: commentLength,
      custom_parameters: {
        post_id: postId,
        comment_length: commentLength,
      },
    });
  }

  // Track form interactions
  trackFormStart(formName: string) {
    this.trackEvent({
      event: 'form_start',
      category: 'form',
      action: 'start',
      label: formName,
    });
  }

  trackFormComplete(formName: string, timeSpent: number) {
    this.trackEvent({
      event: 'form_complete',
      category: 'form',
      action: 'complete',
      label: formName,
      value: timeSpent,
      custom_parameters: {
        form_name: formName,
        time_spent: timeSpent,
      },
    });
  }

  trackFormError(formName: string, errorType: string) {
    this.trackEvent({
      event: 'form_error',
      category: 'form',
      action: 'error',
      label: errorType,
      custom_parameters: {
        form_name: formName,
        error_type: errorType,
      },
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, rating: string) {
    this.trackEvent({
      event: 'performance',
      category: 'performance',
      action: metric,
      label: rating,
      value: Math.round(value),
      custom_parameters: {
        metric_name: metric,
        metric_value: value,
        metric_rating: rating,
      },
    });
  }

  // Track error events
  trackError(error: Error, context?: string) {
    this.trackEvent({
      event: 'error',
      category: 'error',
      action: 'error',
      label: error.message,
      custom_parameters: {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        context,
      },
    });
  }

  // Track user preferences
  trackPreferenceChange(preference: string, value: string) {
    this.trackEvent({
      event: 'preference_change',
      category: 'user_preferences',
      action: 'change',
      label: preference,
      custom_parameters: {
        preference_name: preference,
        preference_value: value,
      },
    });
  }

  private sendToAnalytics(data: any) {
    // Send to your analytics endpoint
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch(console.error);

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', data);
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}

export const analytics = new AnalyticsService(); 