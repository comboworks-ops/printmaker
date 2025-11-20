import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SitePreviewPage({ params }: Props) {
  const { slug } = await params;

  const result = await fetchQuery(api.sites.publicGetSite, { slug });

  if (!result) {
    notFound();
  }

  const { site, pages } = result;
  const homePage = pages.find((page) => page.slug === "home") ?? pages[0];

  const theme = {
    primary: site.theme?.primary ?? "#09090b",
    accent: site.theme?.accent ?? "#f97316",
  };

  const hero = homePage?.content?.hero ?? {};
  const features: Array<{ title?: string; description?: string }> =
    Array.isArray(homePage?.content?.features)
      ? homePage?.content?.features
      : [];
  const cta = homePage?.content?.cta ?? {};

  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-10">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            {site.slug}
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900">{site.name}</h1>
        </div>
        <span className="text-sm text-zinc-500">
          Preview mode · {site.published ? "Published" : "Draft"}
        </span>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-24">
        {homePage ? (
          <div className="space-y-12">
            <section className="rounded-3xl border border-zinc-200 bg-zinc-50 px-8 py-16">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Home page preview
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-zinc-900">
                {hero.heading ?? "Untitled hero"}
              </h2>
              <p className="mt-4 text-lg text-zinc-600">
                {hero.subheading ??
                  "Use the builder to customize this section."}
              </p>
              {hero.ctaLabel && (
                <a
                  href={hero.ctaHref ?? "#"}
                  className="mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {hero.ctaLabel}
                </a>
              )}
            </section>
            <section className="rounded-3xl border border-zinc-200 bg-white px-8 py-16">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Key benefits
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {features.length > 0
                  ? features.map((feature, index) => (
                      <div
                        key={`${feature.title}-${index}`}
                        className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5"
                      >
                        <p className="text-sm font-semibold text-zinc-900">
                          {feature.title ?? "Untitled feature"}
                        </p>
                        <p className="mt-2 text-sm text-zinc-600">
                          {feature.description ??
                            "Add descriptions in the builder UI."}
                        </p>
                      </div>
                    ))
                  : Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-500"
                      >
                        Feature {index + 1}
                      </div>
                    ))}
              </div>
            </section>
            <section
              id="cta"
              className="rounded-3xl px-8 py-16 text-white"
              style={{ backgroundColor: theme.accent }}
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Call to action
              </p>
              <h3 className="mt-4 text-3xl font-semibold">
                {cta.heading ?? "Ready to publish?"}
              </h3>
              <p className="mt-3 text-base text-white/80">
                {cta.subheading ??
                  "Upgrade your plan or contact sales to finalize your launch."}
              </p>
              {cta.ctaLabel && (
                <a
                  href={cta.ctaHref ?? "#"}
                  className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-900"
                >
                  {cta.ctaLabel}
                </a>
              )}
            </section>
          </div>
        ) : (
          <section className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-8 py-16 text-center text-zinc-500">
            No page content yet. Add sections in the builder.
          </section>
        )}
      </main>
    </div>
  );
}
