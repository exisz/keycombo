import { notFound } from "next/navigation";
import ShortcutTable from "@/components/ShortcutTable";
import appsData from "@/data/apps.json";
import { getCategoryForApp, type AppData } from "@/lib/categories";
import type { Metadata } from "next";

const apps = appsData as AppData[];

export function generateStaticParams() {
  return apps.map((app) => ({ slug: app.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return params.then(({ slug }) => {
    const app = apps.find((a) => a.slug === slug);
    if (!app) return { title: "Not Found" };
    return {
      title: `${app.name} Keyboard Shortcuts`,
      description: `${app.shortcutCount} keyboard shortcuts for ${app.name}. Complete cheat sheet with all categories.`,
    };
  });
}

export default async function AppPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = apps.find((a) => a.slug === slug);
  if (!app) notFound();

  const category = getCategoryForApp(app.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="breadcrumbs text-sm mb-4">
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/apps">Apps</a>
          </li>
          <li>{app.name}</li>
        </ul>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {app.name} Keyboard Shortcuts
        </h1>
        <div className="flex flex-wrap gap-2 items-center text-base-content/70">
          <span className="badge badge-primary">{app.shortcutCount} shortcuts</span>
          <span className="badge badge-ghost">{category}</span>
          <span className="badge badge-ghost">
            {app.sections.length} categories
          </span>
          {app.referenceUrl && (
            <a
              href={app.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary text-sm"
            >
              Official Reference ↗
            </a>
          )}
        </div>
      </div>

      <ShortcutTable sections={app.sections} appName={app.name} />
    </div>
  );
}
