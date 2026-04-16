import AppGrid from "@/components/AppGrid";
import indexData from "@/data/index.json";
import type { AppIndex } from "@/lib/categories";

const apps = indexData as AppIndex[];
const totalShortcuts = apps.reduce((acc, a) => acc + a.shortcutCount, 0);

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            KeyCombo
          </span>
        </h1>
        <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
          Keyboard shortcut cheat sheets for {apps.length}+ apps.{" "}
          <span className="text-primary font-semibold">
            {totalShortcuts.toLocaleString()}
          </span>{" "}
          shortcuts and counting.
        </p>
      </div>

      {/* Stats */}
      <div className="stats stats-vertical sm:stats-horizontal shadow-lg bg-base-200 w-full mb-10">
        <div className="stat">
          <div className="stat-title">Apps</div>
          <div className="stat-value text-primary">{apps.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Shortcuts</div>
          <div className="stat-value text-secondary">
            {totalShortcuts.toLocaleString()}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">Categories</div>
          <div className="stat-value">11</div>
        </div>
      </div>

      {/* App Grid */}
      <AppGrid apps={apps} />
    </div>
  );
}
