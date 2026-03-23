export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-navy">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold text-text-inverse mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-lg text-text-inverse opacity-80">
          Please check your internet connection and try again.
        </p>
      </div>
    </main>
  );
}
