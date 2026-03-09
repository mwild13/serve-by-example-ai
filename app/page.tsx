export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#163828]">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-6 rounded-full border border-[#b8932f] px-4 py-1 text-sm tracking-[0.2em] text-[#b8932f] uppercase">
          Hospitality Training Platform
        </div>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Serve By Example AI
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-[#315543] md:text-xl">
          AI-powered bartending, hospitality and management training designed
          to help staff learn faster, build confidence, and perform better in
          real-world venue environments.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button className="rounded-full bg-[#163828] px-8 py-4 text-white transition hover:opacity-90">
            Start Free Demo
          </button>
          <button className="rounded-full border border-[#163828] px-8 py-4 text-[#163828] transition hover:bg-[#163828] hover:text-white">
            View Training Modules
          </button>
        </div>

        <div className="mt-16 grid w-full max-w-5xl gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-[#d8d2c4] bg-white p-6 text-left shadow-sm">
            <h3 className="text-xl font-semibold">Bartending Training</h3>
            <p className="mt-3 text-[#4a5e53]">
              Learn cocktails, spirits, service flow and practical bar knowledge.
            </p>
          </div>

          <div className="rounded-3xl border border-[#d8d2c4] bg-white p-6 text-left shadow-sm">
            <h3 className="text-xl font-semibold">Sales Training</h3>
            <p className="mt-3 text-[#4a5e53]">
              Improve upselling, customer interaction and on-floor confidence.
            </p>
          </div>

          <div className="rounded-3xl border border-[#d8d2c4] bg-white p-6 text-left shadow-sm">
            <h3 className="text-xl font-semibold">Management Training</h3>
            <p className="mt-3 text-[#4a5e53]">
              Build leadership skills, team standards and venue decision-making.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
