# 🧩 Ghost Mentions

A lightweight **React mention system** built for `textarea` and `PromptInput` fields.
Designed to feel native in [Shadcn UI](https://ui.shadcn.com) + [Vercel AI Elements](https://github.com/vercel/ai-elements).

[![CI](https://github.com/yourusername/ghost-mentions/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/ghost-mentions/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🪶 **Headless hook:** `useMentions` – no dependency on any rich text editor
- 🧠 **Smart tokens:** Mentions act atomically (delete/backspace-safe)
- 🧩 **UI components:** `MentionPopup`, `MentionDialog`, and `MentionHighlights`
- 🎨 **Shadcn-ready:** Built with Radix primitives and Tailwind design tokens
- ⚡ **Zero heavy dependencies:** No TipTap, Lexical, or Draft.js
- 🔧 **TypeScript:** Fully typed with comprehensive interfaces
- 🧪 **Well tested:** Unit tests + component tests included

## 🚀 Quick Start

### Installation

```bash
pnpm add ghost-mentions-core ghost-mentions-react
# or
npm install ghost-mentions-core ghost-mentions-react
# or
yarn add ghost-mentions-core ghost-mentions-react
```

### Basic Usage

```tsx
import { useState } from "react";
import { MentionInput } from "ghost-mentions-react";
import type { Triggers } from "ghost-mentions-core";

const triggers: Triggers = {
  "@": {
    type: "agent",
    fetch: async (query) => {
      // Your API call here
      return [
        { id: "1", label: "Coder", type: "agent" },
        { id: "2", label: "Designer", type: "agent" },
      ];
    },
  },
};

function ChatInput() {
  const [value, setValue] = useState("");

  return (
    <MentionInput
      value={value}
      onValueChange={setValue}
      triggers={triggers}
      onSend={({ text, mentions, markdown }) => {
        console.log({ text, mentions, markdown });
      }}
      className="w-full rounded-md border px-3 py-2"
      placeholder="Type @ to mention someone..."
    />
  );
}
```

## 📦 Packages

This is a monorepo containing:

- **`ghost-mentions-core`** - Headless hook and utilities
- **`ghost-mentions-react`** - React UI components
- **Demo app** - Next.js showcase (see `/apps/demo`)

## 🧠 Core Hook Usage

For more control, use the headless hook directly:

```tsx
import { useMentions } from "ghost-mentions-core";
import { MentionPopup, MentionHighlights } from "ghost-mentions-react";

function CustomInput() {
  const [value, setValue] = useState("");

  const mention = useMentions({
    value,
    onValueChange: setValue,
    triggers: {
      "@": { type: "agent", fetch: fetchAgents },
      "#": { type: "tag", fetch: fetchTags },
    },
    onSend: ({ text, mentions, markdown }) => {
      console.log("Sent:", { text, mentions, markdown });
    },
    persistOnSend: "keep", // or "prefix" | "clear"
    picker: { mode: "popup" }, // or "dialog"
  });

  return (
    <div className="relative">
      <MentionHighlights
        overlay={mention.highlights}
        textareaRef={mention.bind.ref}
      />
      <textarea {...mention.bind} className="..." />
      <MentionPopup menu={mention.menu} onSelect={mention.insertMention} />
    </div>
  );
}
```

## ⚙️ API Reference

### `useMentions(config)`

| Prop              | Type                                     | Description                              |
| ----------------- | ---------------------------------------- | ---------------------------------------- |
| `value`           | `string`                                 | Controlled text value                    |
| `onValueChange`   | `(v: string) => void`                    | Value change handler                     |
| `triggers`        | `Record<string, TriggerConfig>`          | Trigger definitions (e.g., `@`, `#`)     |
| `onSend`          | `({ text, mentions, markdown }) => void` | Called when user presses Enter           |
| `persistOnSend`   | `"keep" \| "prefix" \| "clear"`          | How mentions persist after send          |
| `picker.mode`     | `"popup" \| "dialog"`                    | UI mode for mention selection            |

### TriggerConfig

```ts
{
  type: string;                // Entity type (e.g., "agent", "tag")
  fetch: (query: string) => Promise<MentionEntity[]>;
  minChars?: number;           // Minimum chars to trigger (default: 0)
  display?: (entity: MentionEntity) => string; // Custom display
}
```

### MentionEntity

```ts
{
  id: string;
  label: string;
  type: string;
}
```

### Returned Methods

| Method         | Description                                       |
| -------------- | ------------------------------------------------- |
| `bind`         | Props to spread onto textarea                     |
| `tokens`       | Current mention tokens                            |
| `highlights`   | Ranges for visual overlay                         |
| `menu`         | State for popup/dialog                            |
| `strip()`      | Get plain text without mentions                   |
| `markdown()`   | Get markdown format: `@[Label](type:id)`          |

## 🎨 Components

### `<MentionInput />`

All-in-one component combining hook + UI.

```tsx
<MentionInput
  value={value}
  onValueChange={setValue}
  triggers={triggers}
  onSend={handleSend}
  className="..."
  placeholder="Type @ to mention..."
  rows={4}
/>
```

### `<MentionPopup />`

Lightweight dropdown anchored to caret.

```tsx
<MentionPopup menu={mention.menu} onSelect={mention.insertMention} />
```

### `<MentionDialog />`

Modal dialog with search.

```tsx
<MentionDialog
  menu={mention.menu}
  onSelect={mention.insertMention}
  onClose={mention.closeMenu}
/>
```

### `<MentionHighlights />`

Ghost overlay for visual highlighting.

```tsx
<MentionHighlights
  overlay={mention.highlights}
  textareaRef={mention.bind.ref}
/>
```

## 🧪 Development

### Prerequisites

- Node.js 18+
- pnpm 8+

### Setup

```bash
git clone https://github.com/yourusername/ghost-mentions
cd ghost-mentions
pnpm install
```

### Run Demo

```bash
pnpm dev
# Opens http://localhost:3000
```

### Build Packages

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

## 📝 Example Output

**Input:**
```
Ask @Coder about #performance
```

**Output:**
```json
{
  "text": "Ask about",
  "mentions": [
    {
      "id": "coder",
      "label": "Coder",
      "type": "agent",
      "trigger": "@",
      "start": 4,
      "end": 10
    },
    {
      "id": "perf",
      "label": "performance",
      "type": "tag",
      "trigger": "#",
      "start": 17,
      "end": 29
    }
  ],
  "markdown": "Ask @[Coder](agent:coder) about #[performance](tag:perf)"
}
```

## 🎯 Design Decisions

### Why textarea-first?

- Works with existing form libraries
- Native mobile keyboard support
- No WYSIWYG complexity
- Accessible by default

### Why ghost highlights?

- Non-intrusive visual feedback
- Doesn't interfere with typing
- Works with any textarea styling

### Why atomistic deletion?

- Predictable UX (delete whole mention at once)
- Prevents partial mentions
- Matches Slack/Discord behavior

## 🗺️ Roadmap

- [ ] Fuzzy search for popup
- [ ] Virtualized lists for large datasets
- [ ] Markdown → mention rehydration
- [ ] Emoji/Avatar mention support
- [ ] Mention suggestions from context
- [ ] CLI scaffolder (`npx create-ghost-mentions`)

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📄 License

MIT © 2025 Richard S.

---

**Made with 🧠 for Shadcn + AI workflows**
