// App category mapping
const CATEGORIES: Record<string, string[]> = {
  "Design": ["adobe-photoshop", "adobe-lightroom", "adobe-xd", "affinity-designer", "affinity-photo", "figma", "framer-x", "gimp", "origami", "sketch", "sketchup", "webflow"],
  "Development": ["android-studio", "arduino", "chrome-devtools", "iterm", "notepad-plus-plus", "phpstorm", "postman", "putty", "sequel-pro", "sublime-text", "table-plus", "vs-code", "xcode"],
  "Productivity": ["1password", "airtable", "asana", "evernote", "monday", "notion", "obsidian", "quip", "roam", "ticktick", "todoist", "trello"],
  "Communication": ["discord", "kanbanmail", "microsoft-teams", "missive", "outlook", "skype", "slack", "superhuman", "telegram", "zoom-mac", "zoom-windows"],
  "Media": ["apple-music", "audacity", "blender", "guitar-pro", "netflix", "soundcloud", "spotify", "unity-3d", "vlc", "youtube"],
  "Browsers": ["brave", "firefox", "google-chrome", "vivaldi"],
  "Office": ["excel", "gmail", "google-drive", "wordpress"],
  "Version Control": ["bitbucket", "github", "gitlab", "jira"],
  "System": ["finder", "code-editor-ios", "dropbox", "feedly", "filezilla", "pocket", "proto-io", "reddit", "shopify", "transmit", "twitter"],
  "Games": ["apex-legends", "fortnite"],
};

export function getCategoryForApp(slug: string): string {
  for (const [cat, slugs] of Object.entries(CATEGORIES)) {
    if (slugs.includes(slug)) return cat;
  }
  return "Other";
}

export function getAllCategories(): string[] {
  return Object.keys(CATEGORIES);
}

export type AppIndex = {
  slug: string;
  name: string;
  shortcutCount: number;
  categories: string[];
};

export type AppShortcut = {
  description: string;
  keys: string[];
};

export type AppSection = {
  category: string;
  shortcuts: AppShortcut[];
};

export type AppData = {
  slug: string;
  name: string;
  title: string;
  shortcutCount: number;
  referenceUrl: string | null;
  sections: AppSection[];
};
