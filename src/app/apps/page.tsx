import AppGrid from "@/components/AppGrid";
import indexData from "@/data/index.json";
import type { Metadata } from "next";
import type { AppIndex } from "@/lib/categories";

const apps = indexData as AppIndex[];

export const metadata: Metadata = {
  title: "All Apps",
  description: `Browse keyboard shortcuts for ${apps.length}+ apps. Find cheat sheets for VS Code, Photoshop, Excel, Figma, and more.`,
};

export default function AppsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Apps</h1>
      <AppGrid apps={apps} />
    </div>
  );
}
