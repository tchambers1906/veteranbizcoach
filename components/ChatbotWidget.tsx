'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/analytics';
import { MessageCircle, X, Send } from 'lucide-react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function ChatbotWidget() {
  const t = useTranslations('chatbot');
  const locale = useLocale();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Email capture state
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---------------------------------------------------------------- */
  /*  Auto-trigger logic: 15s OR 50% scroll, whichever first          */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (dismissed || autoTriggered) return;

    const timer = setTimeout(() => {
      if (!dismissed && !autoTriggered) {
        setIsOpen(true);
        setAutoTriggered(true);
        track('chatbot_opened', { trigger_type: 'auto', locale });
      }
    }, 15_000);

    const handleScroll = () => {
      if (dismissed || autoTriggered) return;
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPercent >= 0.5) {
        setIsOpen(true);
        setAutoTriggered(true);
        track('chatbot_opened', { trigger_type: 'scroll', locale });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dismissed, autoTriggered, locale]);

  /* ---------------------------------------------------------------- */
  /*  ESC key close                                                   */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWidget();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ---------------------------------------------------------------- */
  /*  Focus trap                                                      */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) focusable[0].focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen, messages.length]);

  /* ---------------------------------------------------------------- */
  /*  Scroll to bottom on new messages                                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* ---------------------------------------------------------------- */
  /*  Actions                                                         */
  /* ---------------------------------------------------------------- */
  const closeWidget = useCallback(() => {
    setIsOpen(false);
    setDismissed(true);
    toggleRef.current?.focus();
  }, []);

  const openWidget = () => {
    setIsOpen(true);
    track('chatbot_opened', { trigger_type: 'click', locale });
  };

  /* ---------------------------------------------------------------- */
  /*  Send message to API                                             */
  /* ---------------------------------------------------------------- */
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      const userMsg: ChatMessage = { role: 'user', content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setIsLoading(true);

      // Show email capture after 2nd user message
      const userCount = messages.filter((m) => m.role === 'user').length + 1;
      if (userCount >= 2 && emailStatus === 'idle') {
        setShowEmailCapture(true);
      }

      track('cta_clicked', {
        cta_label: trimmed,
        section_id: 'chatbot',
        pillar: 'chatbot',
        locale,
      });

      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: messages,
            locale,
          }),
        });

        const data = await response.json();

        if (data.reply) {
          setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        } else if (data.error) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'I am having trouble connecting. Book directly at /book or email tc@veteranbizcoach.com.',
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'I am having trouble connecting. Book directly at /book or email tc@veteranbizcoach.com.',
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [isLoading, messages, locale, emailStatus],
  );

  const handleQuickReply = (key: string) => {
    const label = t(`quickReplies.${key}`);
    sendMessage(label);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Email capture                                                   */
  /* ---------------------------------------------------------------- */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailStatus('loading');
    try {
      const res = await fetch('/api/chatbot-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), context: messages.map((m) => m.content).join(' | '), locale }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailStatus('sent');
        setShowEmailCapture(false);
        track('chatbot_lead_captured', { locale });
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Link detection in assistant messages                            */
  /* ---------------------------------------------------------------- */
  const renderMessageContent = (content: string) => {
    // Convert /path links to clickable buttons
    const parts = content.split(/(\/[a-z][a-z0-9?=&/-]*)/gi);
    return parts.map((part, i) => {
      if (/^\/[a-z]/i.test(part)) {
        return (
          <button
            key={i}
            onClick={() => {
              track('cta_clicked', { cta_label: part, section_id: 'chatbot', pillar: 'chatbot', locale });
              router.push(`/${locale}${part}`);
              closeWidget();
            }}
            className="text-teal underline underline-offset-2 hover:brightness-110 transition-colors"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const QUICK_REPLIES = ['business', 'funded', 'website', 'villa', 'other'] as const;

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */
  return (
    <>
      {/* Toggle button */}
      {!isOpen && (
        <button
          ref={toggleRef}
          onClick={openWidget}
          aria-label={t('toggleLabel')}
          aria-expanded={false}
          className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-teal text-white rounded-full shadow-lg flex items-center justify-center hover:brightness-110 transition-all motion-safe:animate-pulse"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Expanded panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t('header')}
          className="fixed bottom-6 right-6 z-[999] w-[380px] max-w-[calc(100vw-2rem)] bg-navy rounded-2xl shadow-xl overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100vh - 3rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
            <span className="font-heading font-semibold text-[16px] text-gold">{t('header')}</span>
            <button
              onClick={closeWidget}
              aria-label={t('close')}
              className="w-11 h-11 flex items-center justify-center text-off-white/60 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 280 }}>
            {/* Greeting */}
            <div className="flex justify-start">
              <div
                className="font-body text-[14px] leading-[1.6] text-off-white/90 px-[14px] py-[10px] max-w-[85%]"
                style={{
                  backgroundColor: '#1A1A2E',
                  borderRadius: '16px 16px 16px 4px',
                }}
              >
                {t('greeting')}
              </div>
            </div>

            {/* Quick replies (only when no messages yet) */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2">
                {QUICK_REPLIES.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleQuickReply(key)}
                    className="font-body text-[13px] bg-teal/15 text-teal border border-teal/30 px-3.5 py-2 rounded-full hover:bg-teal/25 transition-all"
                  >
                    {t(`quickReplies.${key}`)}
                  </button>
                ))}
              </div>
            )}

            {/* Conversation messages */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="font-body text-[14px] leading-[1.6] px-[14px] py-[10px] max-w-[85%]"
                  style={
                    msg.role === 'user'
                      ? {
                          backgroundColor: '#C9A84C',
                          color: '#0A1628',
                          borderRadius: '16px 16px 4px 16px',
                        }
                      : {
                          backgroundColor: '#1A1A2E',
                          color: '#F8F9FA',
                          borderRadius: '16px 16px 16px 4px',
                        }
                  }
                >
                  {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1.5 px-[14px] py-[12px]"
                  style={{
                    backgroundColor: '#1A1A2E',
                    borderRadius: '16px 16px 16px 4px',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-teal motion-safe:animate-bounce"
                    style={{ animationDelay: '0ms', animationDuration: '600ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-teal motion-safe:animate-bounce"
                    style={{ animationDelay: '150ms', animationDuration: '600ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-teal motion-safe:animate-bounce"
                    style={{ animationDelay: '300ms', animationDuration: '600ms' }}
                  />
                </div>
              </div>
            )}

            {/* Email capture (after 2+ user messages) */}
            {showEmailCapture && emailStatus !== 'sent' && (
              <div
                className="px-3 py-3 rounded-xl"
                style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="font-body text-[13px] text-off-white/60 mb-2">{t('emailPrompt')}</p>
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <label htmlFor="chatbot-email" className="sr-only">
                    {t('emailLabel')}
                  </label>
                  <input
                    id="chatbot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    maxLength={254}
                    required
                    className="flex-1 bg-navy border border-white/10 rounded-lg px-3 py-2 font-body text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-teal/50"
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'loading'}
                    className="font-body text-[13px] bg-gold text-navy px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-60 whitespace-nowrap"
                  >
                    {emailStatus === 'loading' ? '...' : t('emailButton')}
                  </button>
                </form>
                {emailStatus === 'error' && (
                  <p className="font-body text-[12px] text-red-400 mt-1">{t('emailError')}</p>
                )}
              </div>
            )}

            {emailStatus === 'sent' && (
              <div className="bg-teal/10 rounded-xl px-4 py-3">
                <p className="font-body text-[14px] text-teal">{t('emailConfirmation')}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Ask a question..."
              maxLength={500}
              className="flex-1 font-body text-[14px] text-off-white placeholder:text-white/30 px-4 py-[10px] rounded-full focus:outline-none transition-colors"
              style={{
                backgroundColor: '#1A1A2E',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#C9A84C';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-teal text-white transition-opacity disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
