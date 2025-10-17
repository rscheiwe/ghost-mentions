"use client";

import { ReactNode } from "react";
import type { UseMentionsResult } from "../types";
import { MentionHighlights } from "./mention-highlights";
import { MentionPopup } from "./mention-popup";
import { MentionDialog } from "./mention-dialog";

export interface MentionContainerProps {
  mention: UseMentionsResult;
  children: ReactNode;
  mode?: "popup" | "dialog";
}

/**
 * Container that wraps your input with mention functionality
 *
 * @example
 * ```tsx
 * const mention = useMentions({ value, onValueChange, triggers });
 *
 * <MentionContainer mention={mention}>
 *   <PromptInput {...mention.bind} />
 * </MentionContainer>
 * ```
 */
export function MentionContainer({
  mention,
  children,
  mode = "popup"
}: MentionContainerProps) {
  return (
    <div className="relative" style={{ position: "relative" }}>
      <MentionHighlights
        overlay={mention.highlights}
        textareaRef={mention.bind.ref}
      />
      {children}
      {mode === "dialog" ? (
        <MentionDialog
          menu={mention.menu}
          onSelect={mention.insertMention}
          onClose={mention.closeMenu}
        />
      ) : (
        <MentionPopup
          menu={mention.menu}
          onSelect={(item) => mention.insertMention(item)}
        />
      )}
    </div>
  );
}
