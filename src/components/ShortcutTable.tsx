"use client";

import { useState, useMemo } from "react";
import type { AppSection } from "@/lib/categories";

function KeyCap({ label }: { label: string }) {
  return (
    <kbd className="kbd kbd-sm bg-base-300 border-base-content/20 shadow-md min-w-[2rem] text-center">
      {label}
    </kbd>
  );
}

function ShortcutRow({ description, keys }: { description: string; keys: string[] }) {
  return (
    <tr className="hover:bg-base-200/50">
      <td className="py-2 pr-4">{description}</td>
      <td className="py-2">
        <div className="flex items-center gap-1 flex-wrap">
          {keys.map((key, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-base-content/30 text-xs">+</span>}
              <KeyCap label={key} />
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

export default function ShortcutTable({
  sections,
  appName,
}: {
  sections: AppSection[];
  appName: string;
}) {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filteredSections = useMemo(() => {
    return sections
      .filter((s) => !activeSection || s.category === activeSection)
      .map((s) => ({
        ...s,
        shortcuts: search
          ? s.shortcuts.filter(
              (sc) =>
                sc.description.toLowerCase().includes(search.toLowerCase()) ||
                sc.keys.some((k) => k.toLowerCase().includes(search.toLowerCase()))
            )
          : s.shortcuts,
      }))
      .filter((s) => s.shortcuts.length > 0);
  }, [sections, search, activeSection]);

  const totalShown = filteredSections.reduce((acc, s) => acc + s.shortcuts.length, 0);

  return (
    <div>
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder={`Search ${appName} shortcuts...`}
          className="input input-bordered flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Section tabs */}
      {sections.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`btn btn-sm ${!activeSection ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveSection(null)}
          >
            All ({sections.reduce((a, s) => a + s.shortcuts.length, 0)})
          </button>
          {sections.map((s) => (
            <button
              key={s.category}
              className={`btn btn-sm ${activeSection === s.category ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setActiveSection(s.category === activeSection ? null : s.category)}
            >
              {s.category} ({s.shortcuts.length})
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-base-content/60 mb-4">
        {totalShown} shortcuts
        {search && ` matching "${search}"`}
      </p>

      {/* Tables */}
      {filteredSections.map((section) => (
        <div key={section.category} className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-primary">
            {section.category}
          </h2>
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th className="w-1/2">Action</th>
                  <th>Shortcut</th>
                </tr>
              </thead>
              <tbody>
                {section.shortcuts.map((sc, i) => (
                  <ShortcutRow key={i} {...sc} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {filteredSections.length === 0 && (
        <div className="text-center py-12 text-base-content/50">
          No shortcuts found matching &quot;{search}&quot;.
        </div>
      )}
    </div>
  );
}
