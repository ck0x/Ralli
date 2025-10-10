export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
          About Ralli
        </h1>
        <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
          <p>
            Ralli is a lightweight stringing order intake & workflow management
            system for badminton centers.
          </p>
          <p>
            The goal: reduce friction at the counter, improve communication, and
            prepare for an eventual sync-enabled backend. Everything you see is
            intentionally minimal so you can extend it quickly.
          </p>
        </div>
      </div>
    </div>
  );
}
