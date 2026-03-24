import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="bg-navy min-h-screen flex items-center justify-center">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-heading font-extrabold text-[34px] lg:text-[48px] leading-[1.1] text-white mb-6">
          This page doesn&apos;t exist. But your business can.
        </h1>
        <p className="font-body text-[18px] text-off-white/70 mb-10">
          Here&apos;s where to go from here.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/en/book"
            className="font-body text-[16px] text-teal hover:text-teal-dark transition-colors underline underline-offset-2"
          >
            Book a Strategy Call
          </Link>
          <span className="hidden sm:inline text-white/30">|</span>
          <Link
            href="/en/quiz"
            className="font-body text-[16px] text-teal hover:text-teal-dark transition-colors underline underline-offset-2"
          >
            Take the Quiz
          </Link>
          <span className="hidden sm:inline text-white/30">|</span>
          <Link
            href="/en"
            className="font-body text-[16px] text-teal hover:text-teal-dark transition-colors underline underline-offset-2"
          >
            Go Home
          </Link>
        </div>

        <Link
          href="/en"
          className="inline-flex items-center justify-center font-heading font-semibold text-base bg-gold text-navy px-8 py-4 rounded-lg min-h-[44px] hover:brightness-110 transition-all"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
