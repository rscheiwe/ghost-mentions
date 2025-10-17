Absolutely — here’s a complete **Product Requirements Document (PRD)** for your **Mention Input Component** project, ready to hand off to Codex or another internal builder team.

---

# 🧩 Product Requirements Document (PRD)

## Project: Mention Input Component (Shadcn-Compatible)

### Author

Richard S.

### Stakeholders

- **Product/UX:** Richard (spec & validation)
- **Engineering:** Codex Team
- **Design:** (Optional) Shadcn-compatible visual consistency

---

## 1. Overview

**Goal:**
Develop a modular, Shadcn-compatible React component package that enables “@mentions” and similar inline triggers (`@`, `#`, `/`, etc.) inside plain `<textarea>` or `PromptInput` elements (like in [Vercel’s `ai-elements`](https://github.com/vercel/ai-elements)).

The component must:

- Allow users to invoke contextual menus or dialogs by typing triggers like `@agent`.
- Support inserting atomic mention tokens that are visually styled but stored as text.
- Preserve mentions in the input after message submission.
- Exclude mention content from the actual message payload while preserving structured metadata.
- Support both **popup** and **dialog** selection modes.
- Serialize mentions optionally in Markdown (`@[Label](type:id)`).

---

## 2. Product Objectives

| Objective           | Description                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------- |
| 🧠 Enhance UX       | Provide structured references (agents, topics, datasets, etc.) within LLM chat input fields. |
| 💬 Integrate easily | Work seamlessly with Tailwind + Shadcn + ai-elements `PromptInput`.                          |
| 🧩 Headless-first   | Hook-based core (`useMentions`) with optional Shadcn UI wrappers.                            |
| 🪶 Lightweight      | No heavy editor dependencies (no TipTap/Lexical). Built on `textarea`.                       |
| 💾 Reusable         | Packaged as an installable component with Shadcn-compatible CLI installer.                   |

---

## 3. Functional Requirements

### 3.1. Core Hook: `useMentions`

**Responsibilities**

- Detect trigger characters (`@`, `#`, etc.) and open a menu/dialog.
- Manage mention tokens as `{ id, label, type, start, end, trigger }`.
- Handle atomistic deletion (whole-token deletion via backspace/delete).
- Persist tokens after send; remove or reflow text based on `persistOnSend` policy.
- Provide helpers for payload serialization:

  - `strip()` → plain text without tokens
  - `markdown()` → text with tokens serialized as `@[Label](type:id)`

- Maintain async fetching of mentionable entities (per trigger).
- Expose clean API for any textarea-based input.

**API**

```ts
const mention = useMentions({
  value, // controlled string
  onValueChange: setValue,
  triggers: {
    '@': { type: 'agent', fetch: queryAgents },
    '#': { type: 'tag', fetch: queryTags }
  },
  onSend: ({ text, mentions, markdown }) => {...},
  persistOnSend: 'keep' | 'prefix' | 'clear',
  picker: { mode: 'popup' | 'dialog' }
});
```

**Returned object**

```ts
{
  bind: { ref, value, onChange, onKeyDown, onSelect },
  tokens, // list of mention tokens
  highlights, // for overlay rendering
  menu: { open, items, query, trigger, select, close, anchorRect },
  strip, markdown
}
```

---

### 3.2. UI Components

#### a) `<MentionInput />`

- Wrapper around a `<textarea>` (or Vercel’s `<PromptInput>`).
- Integrates `useMentions`.
- Renders `MentionHighlights` overlay.
- Conditionally renders `MentionPopup` or `MentionDialog` depending on `picker.mode`.

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

---

#### b) `<MentionPopup />`

- Small dropdown near caret.
- Uses Shadcn **Popover** + plain list.
- Positions via caret coordinates (`anchorRect`).
- Displays search bar and selectable results.

#### c) `<MentionDialog />`

- Full modal selector using Shadcn **Dialog**.
- Used for wide or categorized mention sets.
- Includes search and filtering.

#### d) `<MentionHighlights />`

- Ghost overlay behind `<textarea>`.
- Styles mention ranges with Tailwind tokens (e.g., `bg-accent/40 rounded px-1`).
- Scrolls synchronously with textarea content.

---

## 4. UX / Behavior Specifications

| Event                         | Expected Behavior                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| Typing `@`                    | Opens menu/dialog for trigger `@`.                                                            |
| Typing more characters        | Filters `fetch` results (debounced).                                                          |
| Selecting a mention           | Inserts atomic token; adds trailing space if missing.                                         |
| Pressing **Enter**            | Submits input → sends payload with `text` (mentions stripped). Mentions **persist** visually. |
| Pressing **Shift+Enter**      | Inserts newline.                                                                              |
| Pressing **Backspace/Delete** | If inside or adjacent to a mention → deletes whole token.                                     |
| Selecting across mentions     | Deletes all intersected tokens.                                                               |
| Copy/paste                    | Copies mention label as plain text; pasting re-triggers detection.                            |
| Markdown serialization        | Available via `mention.markdown()`. Example: `@[Coder](agent:coder)`.                         |

---

## 5. Data Model

### Mention Token

```ts
{
  id: string;
  label: string;
  type: string; // e.g. 'agent' | 'tag'
  start: number;
  end: number;
  trigger: string; // '@', '#', etc.
}
```

### Payload on Send

```json
{
  "text": "Ask about performance.",
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
  "markdown": "Ask @[Coder](agent:coder) about performance."
}
```

---

## 6. Implementation Plan

### Phase 1 — Core Engine (mention-core)

- [ ] Implement `useMentions` hook.
- [ ] Add text diff/range logic.
- [ ] Add atomistic deletion handling.
- [ ] Add markdown serialization.
- [ ] Add async fetch + debounce per trigger.
- [ ] Unit tests (Vitest).

### Phase 2 — UI Layer (mention-react)

- [ ] `<MentionPopup>` with Shadcn Popover.
- [ ] `<MentionDialog>` with Shadcn Dialog.
- [ ] `<MentionHighlights>` overlay.
- [ ] `<MentionInput>` wrapper.
- [ ] Keyboard navigation, a11y labels.
- [ ] Integration tests.

### Phase 3 — Demo & DX

- [ ] Next.js demo app in `/apps/demo`.
- [ ] Tailwind + Shadcn theme consistency.
- [ ] Storybook for variations (popup vs dialog, dark mode).
- [ ] CLI scaffolder (`npx create-mention-input add mention-input`).

---

## 7. Technical Stack

| Layer       | Tools                             |
| ----------- | --------------------------------- |
| Build       | `tsup`, `pnpm` workspaces         |
| React       | 18+                               |
| Styling     | TailwindCSS, Shadcn/ui primitives |
| Popup/Modal | Radix UI Popover & Dialog         |
| Testing     | Vitest + React Testing Library    |
| Docs        | Storybook or Ladle                |
| Linting     | ESLint + Prettier (shadcn preset) |

---

## 8. Acceptance Criteria

✅ Mention detection & tokenization works for configured triggers
✅ Mentions persist after submit and are excluded from sent text
✅ Backspace/Delete atomism works as spec’d
✅ Both popup and dialog pickers available and functional
✅ Markdown serialization outputs correct `@[Label](type:id)` format
✅ Works seamlessly in both `<textarea>` and `PromptInput` contexts
✅ No third-party editor dependencies
✅ 100% TypeScript coverage with types exported

---

## 9. Stretch Goals

- Fuzzy search + keyboard navigation in menu.
- Virtualized long lists.
- Multi-trigger multi-type support in same input.
- Emoji or user avatars beside mentions.
- Markdown → mention rehydration (for persisted inputs).
- Copy/paste token preservation.

---

## 10. Deliverables

| Deliverable     | Description                                  | Owner |
| --------------- | -------------------------------------------- | ----- |
| `mention-core`  | Hook, types, utils                           | Codex |
| `mention-react` | UI layer: popup, dialog, highlights          | Codex |
| `demo/` app     | Integration with Tailwind + Shadcn           | Codex |
| Docs            | README + examples + PRD compliance checklist | Codex |
| Optional CLI    | Installer script for shadcn-like DX          | TBD   |

---

Would you like me to follow this with a **technical specification** (file structure + module interfaces + example test cases) to accompany the PRD for the engineering handoff? That’d make it even smoother for Codex.
