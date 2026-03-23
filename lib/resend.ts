import { Resend } from 'resend';

/**
 * Resend email utility.
 * Requires RESEND_API_KEY environment variable.
 */

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Email sending is disabled.');
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send a transactional email via Resend.
 * Returns the email ID on success, or null on failure.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<{ id: string } | null> {
  const client = getResendClient();
  if (!client) return null;

  try {
    const { data, error } = await client.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'tc@veteranbizcoach.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });

    if (error) {
      console.error('Resend error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
    return null;
  }
}
