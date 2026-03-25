export default function Home() {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-200/40 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-blue-200/40 blur-2xl" />

        <p className="mb-3 inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
          Medical Content Platform
        </p>
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Professional dashboard to manage and publish medical gallery assets
        </h1>
        <p className="mt-4 max-w-2xl text-slate-600">
          Upload, organize, and review medical files with a clean workflow built for teams.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/admin"
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-700"
          >
            Open Admin Panel
          </a>
          <a
            href="/gallery"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            View Gallery
          </a>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Structured Uploads",
            body: "Capture title, category, and files with a reliable upload pipeline.",
          },
          {
            title: "Fast Gallery View",
            body: "Browse all media in a responsive grid optimized for every screen size.",
          },
          {
            title: "Secure Cloud Storage",
            body: "Assets are stored via Cloudinary and persisted with MongoDB metadata.",
          },
        ].map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
