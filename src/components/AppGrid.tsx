"use client";

import { useState, useMemo } from "react";
import { getCategoryForApp, getAllCategories, type AppIndex } from "@/lib/categories";

export default function AppGrid({ apps }: { apps: AppIndex[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "shortcuts">("name");

  const categories = useMemo(() => ["All", ...getAllCategories()], []);

  const filtered = useMemo(() => {
    let result = apps;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (category !== "All") {
      result = result.filter((a) => getCategoryForApp(a.slug) === category);
    }
    result = [...result].sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : b.shortcutCount - a.shortcutCount
    );
    return result;
  }, [apps, search, category, sortBy]);

  return (
    <div>
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search apps..."
          className="input input-bordered flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="select select-bordered"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "shortcuts")}
        >
          <option value="name">Sort: A-Z</option>
          <option value="shortcuts">Sort: Most Shortcuts</option>
        </select>
      </div>

      <p className="text-sm text-base-content/60 mb-4">
        Showing {filtered.length} of {apps.length} apps
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((app) => (
          <a
            key={app.slug}
            href={`/apps/${app.slug}`}
            className="card bg-base-200 hover:bg-base-300 transition-colors border border-base-300 hover:border-primary/50"
          >
            <div className="card-body p-4">
              <h3 className="card-title text-base">{app.name}</h3>
              <div className="flex items-center justify-between">
                <span className="badge badge-primary badge-sm">
                  {app.shortcutCount} shortcuts
                </span>
                <span className="badge badge-ghost badge-sm">
                  {getCategoryForApp(app.slug)}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          No apps found matching your search.
        </div>
      )}
    </div>
  );
}
