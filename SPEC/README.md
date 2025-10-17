# 🧩 Mention Input (Shadcn-Compatible)

A lightweight **React mention system** built for `textarea` and `PromptInput` fields.  
Designed to feel native in [Shadcn UI](https://ui.shadcn.com) + [Vercel AI Elements](https://github.com/vercel/ai-elements).

Supports:

- `@mentions`, `#tags`, `/commands`, etc.
- Popup or dialog pickers
- Markdown serialization (`@[Coder](agent:coder)`)
- Atomic deletion
- Persist-on-send behavior

---

## ✨ Features

- 🪶 **Headless hook:** `useMentions` – no dependency on any editor.
- 🧠 **Smart tokens:** mentions act atomically (delete/backspace-safe).
- 🧩 **UI layer:** `MentionPopup`, `MentionDialog`, and `MentionHighlights`.
- 🎨 **Shadcn-ready:** built with Radix primitives and Tailwind tokens.
- ⚡ **Zero dependencies:** no TipTap, no Lexical, no Draft.js.

---

## 🚀 Installation

```bash
# monorepo
pnpm add mention-core mention-react

# or standalone
npm install mention-core mention-react
```

For Tailwind + Shadcn projects, ensure your config includes:

```ts
content: [
  "./node_modules/mention-react/**/*.js",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
];
```

---

## 🧠 Core Usage

### 1. Hook + Textarea

```tsx
import { useState } from "react";
import { useMentions } from "mention-core";
import { MentionPopup, MentionHighlights } from "mention-react";

const queryAgents = async (q: string) =>
  ["Coder", "Researcher", "Designer"]
    .filter((a) => a.toLowerCase().includes(q.toLowerCase()))
    .map((a) => ({ id: a.toLowerCase(), label: a, type: "agent" }));

export default function ChatInput() {
  const [value, setValue] = useState("");
  const mention = useMentions({
    value,
    onValueChange: setValue,
    triggers: { "@": { type: "agent", fetch: queryAgents } },
    onSend: ({ text, mentions, markdown }) =>
      console.log({ text, mentions, markdown }),
    persistOnSend: "keep",
    picker: { mode: "popup" },
  });

  return (
    <div className="relative">
      <MentionHighlights
        overlay={mention.highlights}
        textareaRef={mention.bind.ref}
      />
      <textarea
        {...mention.bind}
        className="w-full rounded border p-3 resize-none"
        placeholder="Ask @coder about performance..."
      />
      <MentionPopup menu={mention.menu} />
    </div>
  );
}
```

---

### 2. Integration with Vercel’s `PromptInput`

```tsx
import { PromptInput } from "@vercel/ai-elements";
import { useMentions } from "mention-core";
import { MentionPopup } from "mention-react";

export default function AIChatPrompt() {
  const mention = useMentions({
    value,
    onValueChange: setValue,
    triggers: { "@": { type: "agent", fetch: queryAgents } },
    onSend: handleSend,
    picker: { mode: "dialog" },
  });

  return (
    <>
      <PromptInput {...mention.bind} />
      <MentionPopup menu={mention.menu} />
    </>
  );
}
```

---

## 🧩 Component Overview

| Component           | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `useMentions`       | Hook managing tokens, detection, deletion, and serialization. |
| `MentionPopup`      | Lightweight dropdown list near caret (uses Popover).          |
| `MentionDialog`     | Modal selector with search/filter.                            |
| `MentionHighlights` | Overlay to visually highlight tokens behind text.             |
| `MentionInput`      | All-in-one wrapper combining the above.                       |

---

## ⚙️ API Reference

### `useMentions(config)`

| Key             | Type                                     | Description                           |                    |                                  |
| --------------- | ---------------------------------------- | ------------------------------------- | ------------------ | -------------------------------- |
| `value`         | `string`                                 | Controlled value.                     |                    |                                  |
| `onValueChange` | `(v: string) => void`                    | Controlled setter.                    |                    |                                  |
| `triggers`      | `Record<string, TriggerConfig>`          | Trigger definitions (e.g., `@`, `#`). |                    |                                  |
| `onSend`        | `({ text, mentions, markdown }) => void` | Callback when user submits.           |                    |                                  |
| `persistOnSend` | `"keep"                                  | "prefix"                              | "clear"`           | How mentions persist after send. |
| `picker`        | `{ mode: "popup"                         | "dialog" }`                           | Selection UI mode. |                                  |

**TriggerConfig**

```ts
{
  type: string;                // logical type, e.g., "agent"
  fetch: (query: string) => Promise<MentionEntity[]>; // async provider
  minChars?: number;
}
```

**MentionEntity**

```ts
{
  id: string;
  label: string;
  type: string;
}
```

---

### Serialization Helpers

```ts
mention.strip(); // plain text without mentions
mention.markdown(); // "Ask @[Coder](agent:coder) about performance"
```

---

## 🧪 Local Development

1. Clone & install:

   ```bash
   git clone https://github.com/<your-org>/mention-input
   cd mention-input
   pnpm install
   ```

2. Run watch mode:

   ```bash
   pnpm dev
   ```

   This runs:

   - `tsup --watch` for packages
   - Next.js dev server for `/apps/demo`

3. Open the demo:

   ```
   http://localhost:3000
   ```

---

## 🧰 Folder Structure

```
packages/
  mention-core/    # headless logic
  mention-react/   # ui components
apps/
  demo/            # local Next.js app to test integration
```

---

## 🧾 Example Payload

Input:

```
Ask @Coder about performance
```

Output:

```json
{
  "text": "Ask about performance",
  "mentions": [
    {
      "id": "coder",
      "label": "Coder",
      "type": "agent",
      "start": 4,
      "end": 10,
      "trigger": "@"
    }
  ],
  "markdown": "Ask @[Coder](agent:coder) about performance"
}
```

---

## 🧱 Tests

Run all tests:

```bash
pnpm test
```

### Coverage

| Area  | Description                                    |
| ----- | ---------------------------------------------- |
| Hook  | tokenization, deletion, send persistence       |
| Utils | caret rect, diff, markdown serialization       |
| UI    | popup & dialog open/close, keyboard navigation |

---

## 🪶 Styling

Custom mention styling can be overridden via Tailwind:

```css
.mention-highlight {
  @apply bg-accent/30 text-accent-foreground rounded px-1;
}
```

---

## 🤝 Contributing

1. Fork and clone the repo.
2. Create a new branch:

   ```bash
   git checkout -b feat/your-feature
   ```

3. Run the demo app and iterate.
4. Submit a PR referencing the PRD/TSPEC.

---

## 📦 Publishing

```bash
cd packages/mention-core
npm publish --access public

cd ../mention-react
npm publish --access public
```

Optionally add an installer CLI later:

```bash
npx create-mention-input add mention-input
```

---

## 🧭 Roadmap

- [ ] Fuzzy search for popup
- [ ] Virtualized lists for large datasets
- [ ] Markdown → mention rehydration
- [ ] CLI scaffolder for Shadcn DX
- [ ] Emoji/Avatar mention support
- [ ] Mention suggestions from context

---

## 🪄 License

MIT © 2025 Bluebeam Studio / Richard S.
