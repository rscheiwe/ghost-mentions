perfect — here’s the **technical specification** (TSPEC) that complements the PRD you’ll hand to Codex. it translates the functional spec into exact folder structure, interfaces, test requirements, and implementation steps.

---

# 🧱 Technical Specification

## Project: Mention Input Component (Shadcn-Compatible)

### Author

Richard S.

### Target Developer

Codex Team

### Version

v1.0 — Initial implementation

---

## 1. Repository Structure

We'll use a **pnpm workspace** monorepo layout:

```
mention-playground/
├─ pnpm-workspace.yaml
├─ packages/
│  ├─ mention-core/         # headless engine (useMentions + utils)
│  │  ├─ src/
│  │  │  ├─ use-mentions.ts
│  │  │  ├─ types.ts
│  │  │  ├─ utils/
│  │  │  │  ├─ caret.ts
│  │  │  │  ├─ diff.ts
│  │  │  │  └─ markdown.ts
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  ├─ mention-react/        # ui layer
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  │  ├─ mention-input.tsx
│  │  │  │  ├─ mention-popup.tsx
│  │  │  │  ├─ mention-dialog.tsx
│  │  │  │  └─ mention-highlights.tsx
│  │  │  ├─ styles/mention.css
│  │  ├─ package.json
│  │  └─ tsconfig.json
│
└─ apps/
   └─ demo/
      ├─ next.config.mjs
      ├─ app/
      │  └─ page.tsx
      ├─ components/
      └─ tailwind.config.ts
```

---

## 2. Core Module: `mention-core`

### 2.1. `useMentions.ts`

Implements the full hook logic already prototyped:

- Manages tokens, menus, deletion logic.
- Exposes:

  - `bind`: textarea bindings.
  - `tokens`: mention list.
  - `highlights`: for overlay.
  - `menu`: for popup/dialog UI.
  - `strip()` and `markdown()` helpers.

**Exports**

```ts
export function useMentions(config: UseMentionsConfig): UseMentionsResult;
```

### 2.2. `types.ts`

```ts
export type MentionEntity = { id: string; label: string; type: string };
export type MentionToken = MentionEntity & {
  start: number;
  end: number;
  trigger: string;
};
export type TriggerConfig = {
  type: string;
  fetch: (q: string) => Promise<MentionEntity[]>;
  minChars?: number;
  display?: (e: MentionEntity) => string;
};
export type Triggers = Record<string, TriggerConfig>;
export type PersistMode = "keep" | "prefix" | "clear";
export type PickerMode = "popup" | "dialog";
```

### 2.3. `utils/caret.ts`

Computes caret position (for popup placement):

```ts
export function getCaretRect(textarea: HTMLTextAreaElement): DOMRect;
```

Implementation: mirror div technique using the same font metrics as the textarea.

### 2.4. `utils/diff.ts`

Efficient diff function for tracking text changes and adjusting token ranges.

### 2.5. `utils/markdown.ts`

```ts
export function serializeMarkdown(text: string, tokens: MentionToken[]): string;
export function parseMarkdown(markdown: string): MentionToken[];
```

The second function (optional v1.1) can rehydrate mentions from markdown.

---

## 3. UI Module: `mention-react`

### 3.1. `<MentionInput />`

Encapsulates everything:

```tsx
<MentionInput
  value={value}
  onValueChange={setValue}
  triggers={{ '@': { type: 'agent', fetch: queryAgents } }}
  onSend={({ text, mentions, markdown }) => ...}
  persistOnSend="keep"
  picker={{ mode: "popup" }}
/>
```

Props interface:

```ts
export interface MentionInputProps {
  value: string;
  onValueChange: (v: string) => void;
  triggers: Triggers;
  onSend?: (p: {
    text: string;
    mentions: MentionToken[];
    markdown: string;
  }) => void;
  persistOnSend?: PersistMode;
  picker?: { mode: PickerMode };
}
```

### 3.2. `<MentionPopup />`

- Uses Shadcn **Popover**.
- Anchored to caret position.
- Displays filtered list.
- Handles keyboard navigation (Up/Down/Enter/Escape).

### 3.3. `<MentionDialog />`

- Uses Shadcn **Dialog**.
- Lists all possible mentions (grid or list layout).
- Supports search field inside dialog.

### 3.4. `<MentionHighlights />`

- Renders a ghost overlay using absolutely positioned `<div>` inside a `.relative` parent.
- Mirrors text scroll/line breaks.
- Each mention range becomes `<span>` with highlight class.

### 3.5. `styles/mention.css`

Tailwind utility-friendly custom CSS:

```css
.mention-highlight {
  @apply bg-accent/40 rounded px-1 text-accent-foreground;
}
```

---

## 4. Interface Diagram

```
MentionInput
│
├─ useMentions()
│   ├─ state: value, tokens, menu
│   ├─ handlers: onChange, onKeyDown, onSelect
│   ├─ helpers: strip(), markdown()
│
├─ MentionHighlights (visual overlay)
├─ MentionPopup | MentionDialog (selection UI)
│
└─ onSend() callback -> { text, mentions, markdown }
```

---

## 5. Integration Targets

| Integration                   | Description                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- |
| **PromptInput (ai-elements)** | Should accept the hook’s `.bind` handlers directly via prop spread.                                       |
| **Shadcn Components**         | Must use Shadcn’s `Popover` and `Dialog` primitives, styled with Tailwind.                                |
| **Theme Support**             | All tokens must be color-synced with Shadcn theme variables (`bg-accent`, `text-muted-foreground`, etc.). |

---

## 6. Tests

### 6.1. Unit Tests (Vitest)

| Test                   | File                   | Expected                                      |
| ---------------------- | ---------------------- | --------------------------------------------- |
| Token creation         | `use-mentions.test.ts` | Trigger `@` + select → token inserted         |
| Token deletion         | `use-mentions.test.ts` | Backspace inside mention removes entire token |
| Persist on send        | `use-mentions.test.ts` | `persistOnSend` modes behave correctly        |
| Markdown serialization | `markdown.test.ts`     | Returns correct `@[Label](type:id)` strings   |
| Strip function         | `use-mentions.test.ts` | Removes tokens cleanly                        |
| Range shifting         | `diff.test.ts`         | Edits shift token positions accurately        |

### 6.2. Component Tests (React Testing Library)

| Component               | Behavior                                         |
| ----------------------- | ------------------------------------------------ |
| `<MentionInput />`      | End-to-end typing, mention insertion, send event |
| `<MentionPopup />`      | Opens, filters, selects                          |
| `<MentionDialog />`     | Opens modal, filters, inserts token              |
| `<MentionHighlights />` | Renders correct highlights visually              |

---

## 7. Example Payload Validation

Typing:

```
Ask @Coder about performance
```

After selecting “Coder”:

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

## 8. Build & Dev

- Build: `tsup --format esm,cjs --dts`
- Dev: `pnpm --filter mention-react dev && pnpm --filter demo dev`
- Publish: `npm publish --access public`
- Demo App: `/apps/demo` — Next.js app using Tailwind + Shadcn.

---

## 9. Delivery Checklist (for Codex)

✅ `useMentions` fully implemented and typed
✅ Tests for all edge cases
✅ Popup and Dialog pickers both functional
✅ Highlight overlay matches token positions
✅ Works inside `<PromptInput>` and `<textarea>`
✅ Markdown serialization confirmed
✅ Shadcn styling parity checked (light/dark themes)
✅ `pnpm build` → all packages build cleanly
✅ Demo app runs on `pnpm dev`
✅ README.md with installation & usage instructions

---

## 10. Stretch Technical Goals (Optional v1.1)

- Add fuzzy search with `Fuse.js`
- Keyboard navigation for mention selection
- Virtualized long lists (`react-virtuoso`)
- Rehydrate mentions from Markdown
- Multi-user avatars in popup
- CLI installer: `npx create-mention-input add mention-input`

---

Would you like me to include a **README.md draft** for the repo next — with install instructions, usage examples, and developer setup (so Codex can bootstrap instantly)?
