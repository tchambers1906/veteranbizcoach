import { NextResponse } from 'next/server';
import { CHATBOT_SYSTEM_PROMPT } from '@/lib/chatbotSystemPrompt';
import { stripHtml, getClientIp } from '@/lib/api-utils';

/* ------------------------------------------------------------------ */
/*  Chatbot-specific rate limiter (10 requests per IP per minute)      */
/* ------------------------------------------------------------------ */

const chatbotRateStore = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_HITS = 10;

function isChatbotRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = chatbotRateStore.get(ip) ?? [];
  const recent = timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (recent.length >= MAX_HITS) {
    chatbotRateStore.set(ip, recent);
    return true;
  }

  recent.push(now);
  chatbotRateStore.set(ip, recent);
  return false;
}

/* ------------------------------------------------------------------ */
/*  Static fallback responses (when ANTHROPIC_API_KEY is not set)      */
/* ------------------------------------------------------------------ */

const STATIC_RESPONSES: Record<string, string> = {
  'starting a business': 'The Superpower Program is built for exactly that. 8 weeks, 6 deliverables, 100% online. Want to join the waitlist? Head to /resources?waitlist=superpower',
  'getting funded': 'T.C. has helped entrepreneurs access capital using 0% interest strategies he personally tested. Want to talk through your situation? Book at /book?session=funding',
  'website': 'T.C. builds AI-powered websites and PWAs for hospitality and service businesses. Book a discovery call at /book?session=website',
  'pwa': 'T.C. builds AI-powered websites and PWAs for hospitality and service businesses. Book a discovery call at /book?session=website',
  'villa': 'If your villa is affected by Indonesia\'s new OTA regulations, Meta Traffic is your direct booking alternative. Book at /book?session=villa',
  'booking': 'If your villa is affected by Indonesia\'s new OTA regulations, Meta Traffic is your direct booking alternative. Book at /book?session=villa',
  'funding': 'T.C. has helped entrepreneurs access capital using 0% interest strategies he personally tested. Want to talk through your situation? Book at /book?session=funding',
  'credit': 'T.C. has helped entrepreneurs access capital using 0% interest strategies he personally tested. Want to talk through your situation? Book at /book?session=funding',
  'superpower': 'The Superpower Program helps you identify your strongest marketable skill and build a business around it in 8 weeks. Join the waitlist at /resources?waitlist=superpower',
  'ai': 'T.C. builds custom GPTs and AI-powered platforms for businesses. Book an AI strategy session at /book?session=ai-strategy',
  'gpt': 'T.C. builds custom GPTs trained on your methodology. They work as lead magnets, onboarding tools, and 24/7 product extensions. Book at /book?session=ai-strategy',
  'something else': 'The best next step is a free 30-minute strategy call. T.C. comes prepared with ideas. Book at /book?session=strategy',
};

function getStaticResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const [key, response] of Object.entries(STATIC_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return 'The best next step is a free strategy call at /book. T.C. will come prepared with ideas.';
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    if (isChatbotRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment.' },
        { status: 429 },
      );
    }

    let body: { message?: string; history?: Array<{ role: string; content: string }>; locale?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const rawMessage = body?.message;
    if (!rawMessage || typeof rawMessage !== 'string') {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 },
      );
    }

    const message = stripHtml(rawMessage).trim().slice(0, 500);
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required.' },
        { status: 400 },
      );
    }

    const locale = stripHtml(String(body?.locale ?? 'en')).trim();

    // Validate and sanitize history
    const rawHistory = Array.isArray(body?.history) ? body.history : [];
    const history = rawHistory
      .filter(
        (h) =>
          h &&
          typeof h === 'object' &&
          (h.role === 'user' || h.role === 'assistant') &&
          typeof h.content === 'string',
      )
      .slice(-10)
      .map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: stripHtml(h.content).trim().slice(0, 1000),
      }));

    // --- Static fallback when no API key ---
    if (!process.env.ANTHROPIC_API_KEY) {
      const reply = getStaticResponse(message);
      return NextResponse.json({ reply, source: 'static' });
    }

    // --- Live Claude response via Emergent proxy (OpenAI-compatible) ---
    const localeContext =
      locale === 'id'
        ? 'The visitor is using Bahasa Indonesia. Respond in Bahasa Indonesia.'
        : locale === 'es'
          ? 'The visitor is using Spanish. Respond in Spanish.'
          : 'Respond in English.';

    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      { role: 'system', content: CHATBOT_SYSTEM_PROMPT + '\n\n' + localeContext },
      ...history,
      { role: 'user', content: message },
    ];

    const proxyUrl = process.env.LLM_PROXY_URL || 'https://integrations.emergentagent.com/llm/chat/completions';

    const llmResponse = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      throw new Error(`LLM API ${llmResponse.status}: ${errText.slice(0, 200)}`);
    }

    const llmData = await llmResponse.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const reply = llmData.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('Empty response from LLM');
    }

    return NextResponse.json({ reply, source: 'claude' });
  } catch (error) {
    console.error('[chatbot] API error:', error instanceof Error ? error.message : 'Unknown');

    return NextResponse.json(
      {
        reply: 'I am having trouble connecting right now. You can book directly at /book or email tc@veteranbizcoach.com.',
        source: 'error',
      },
      { status: 200 },
    );
  }
}
