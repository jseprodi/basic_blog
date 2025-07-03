interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@yourblog.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'Your Blog';
  }

  // Send a new post notification
  async sendNewPostNotification(post: {
    id: number;
    title: string;
    excerpt?: string;
    author: { name: string };
  }, subscribers: string[]): Promise<void> {
    if (subscribers.length === 0) return;

    const template = this.getNewPostTemplate(post);
    
    for (const email of subscribers) {
      await this.sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    }
  }

  // Send comment notification to post author
  async sendCommentNotification(comment: {
    content: string;
    authorName: string;
    authorEmail: string;
  }, post: {
    id: number;
    title: string;
    author: { email: string; name: string };
  }): Promise<void> {
    const template = this.getCommentNotificationTemplate(comment, post);
    
    await this.sendEmail({
      to: post.author.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send comment approval notification
  async sendCommentApprovalNotification(comment: {
    content: string;
    authorName: string;
    authorEmail: string;
  }, post: {
    id: number;
    title: string;
  }): Promise<void> {
    const template = this.getCommentApprovalTemplate(comment, post);
    
    await this.sendEmail({
      to: comment.authorEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send welcome email to new subscribers
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const template = this.getWelcomeTemplate(name);
    
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const template = this.getPasswordResetTemplate(resetToken);
    
    await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send scheduled post reminder
  async sendScheduledPostReminder(post: {
    id: number;
    title: string;
    scheduledFor: Date;
  }, authorEmail: string): Promise<void> {
    const template = this.getScheduledPostReminderTemplate(post);
    
    await this.sendEmail({
      to: authorEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Generic email sending method
  private async sendEmail(emailData: EmailData): Promise<void> {
    try {
      // In production, you would use a service like SendGrid, Mailgun, or AWS SES
      // For now, we'll just log the email
      console.log('Email would be sent:', {
        to: emailData.to,
        from: emailData.from || this.fromEmail,
        subject: emailData.subject,
        html: emailData.html.substring(0, 100) + '...',
        text: emailData.text.substring(0, 100) + '...',
      });

      // Example with a hypothetical email service:
      // await emailService.send({
      //   to: emailData.to,
      //   from: emailData.from || this.fromEmail,
      //   subject: emailData.subject,
      //   html: emailData.html,
      //   text: emailData.text,
      // });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // Email templates
  private getNewPostTemplate(post: { id: number; title: string; excerpt?: string; author: { name: string } }): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
    
    return {
      subject: `New Post: ${post.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Blog Post</h1>
          <h2 style="color: #666;">${post.title}</h2>
          <p style="color: #888;">By ${post.author.name}</p>
          ${post.excerpt ? `<p style="color: #555;">${post.excerpt}</p>` : ''}
          <a href="${baseUrl}/post/${post.id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Read More
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            You're receiving this because you subscribed to our blog updates.
            <a href="${baseUrl}/unsubscribe" style="color: #3b82f6;">Unsubscribe</a>
          </p>
        </div>
      `,
      text: `
New Blog Post: ${post.title}
By ${post.author.name}

${post.excerpt || ''}

Read more: ${baseUrl}/post/${post.id}

---
You're receiving this because you subscribed to our blog updates.
Unsubscribe: ${baseUrl}/unsubscribe
      `,
    };
  }

  private getCommentNotificationTemplate(comment: { content: string; authorName: string }, post: { id: number; title: string; author: { name: string } }): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
    
    return {
      subject: `New Comment on "${post.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Comment</h1>
          <p style="color: #666;">Someone commented on your post "${post.title}"</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; color: #555;">"${comment.content}"</p>
            <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">— ${comment.authorName}</p>
          </div>
          <a href="${baseUrl}/post/${post.id}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Comment
          </a>
        </div>
      `,
      text: `
New Comment on "${post.title}"

"${comment.content}"
— ${comment.authorName}

View comment: ${baseUrl}/post/${post.id}
      `,
    };
  }

  private getCommentApprovalTemplate(comment: { content: string; authorName: string }, post: { id: number; title: string }): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
    
    return {
      subject: `Your comment has been approved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Comment Approved</h1>
          <p style="color: #666;">Your comment on "${post.title}" has been approved and is now visible.</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; color: #555;">"${comment.content}"</p>
            <p style="margin: 10px 0 0 0; color: #888; font-size: 14px;">— ${comment.authorName}</p>
          </div>
          <a href="${baseUrl}/post/${post.id}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Post
          </a>
        </div>
      `,
      text: `
Comment Approved

Your comment on "${post.title}" has been approved and is now visible.

"${comment.content}"
— ${comment.authorName}

View post: ${baseUrl}/post/${post.id}
      `,
    };
  }

  private getWelcomeTemplate(name?: string): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
    
    return {
      subject: `Welcome to Our Blog!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome${name ? `, ${name}` : ''}!</h1>
          <p style="color: #666;">Thank you for subscribing to our blog. You'll now receive notifications when we publish new posts.</p>
          <a href="${baseUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Visit Our Blog
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            <a href="${baseUrl}/unsubscribe" style="color: #3b82f6;">Unsubscribe</a> from these emails at any time.
          </p>
        </div>
      `,
      text: `
Welcome${name ? `, ${name}` : ''}!

Thank you for subscribing to our blog. You'll now receive notifications when we publish new posts.

Visit our blog: ${baseUrl}

---
Unsubscribe: ${baseUrl}/unsubscribe
      `,
    };
  }

  private getPasswordResetTemplate(resetToken: string): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
    
    return {
      subject: `Password Reset Request`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset</h1>
          <p style="color: #666;">You requested a password reset for your account.</p>
          <a href="${baseUrl}/reset-password?token=${resetToken}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 14px; margin-top: 20px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `
Password Reset Request

You requested a password reset for your account.

Reset your password: ${baseUrl}/reset-password?token=${resetToken}

If you didn't request this, you can safely ignore this email.
      `,
    };
  }

  private getScheduledPostReminderTemplate(post: { id: number; title: string; scheduledFor: Date }): EmailTemplate {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourblog.com';
    const scheduledTime = post.scheduledFor.toLocaleString();
    
    return {
      subject: `Scheduled Post Reminder: "${post.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Scheduled Post Reminder</h1>
          <p style="color: #666;">Your post "${post.title}" is scheduled to be published at ${scheduledTime}.</p>
          <a href="${baseUrl}/dashboard/edit/${post.id}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Edit Post
          </a>
        </div>
      `,
      text: `
Scheduled Post Reminder

Your post "${post.title}" is scheduled to be published at ${scheduledTime}.

Edit post: ${baseUrl}/dashboard/edit/${post.id}
      `,
    };
  }
}

export const emailService = new EmailService(); 