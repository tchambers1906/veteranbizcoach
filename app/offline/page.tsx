import { Instagram, Facebook, Linkedin, Mail, WifiOff } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Instagram, href: 'https://instagram.com/miamitc', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/t.c.chambers.2025', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com/in/t-c-chambers-55b33223', label: 'LinkedIn' },
];

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-gold" />
          </div>
        </div>

        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text-inverse mb-4">
          You&apos;re offline right now.
        </h1>

        <p className="text-lg text-text-inverse/70 mb-8">
          Here&apos;s how to reach T.C. when you&apos;re back online.
        </p>

        {/* Email */}
        <a
          href="mailto:tc@veteranbizcoach.com"
          className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors mb-6"
        >
          <Mail className="w-5 h-5" />
          <span className="font-medium">tc@veteranbizcoach.com</span>
        </a>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-gold transition-colors"
              aria-label={social.label}
            >
              <social.icon className="w-6 h-6" />
            </a>
          ))}
        </div>

        {/* Browse note */}
        <div className="bg-white/5 border border-white/10 rounded-[var(--radius-card)] px-5 py-4">
          <p className="text-sm text-text-inverse/60">
            You can still browse content that was loaded before you went offline.
          </p>
        </div>
      </div>
    </main>
  );
}
