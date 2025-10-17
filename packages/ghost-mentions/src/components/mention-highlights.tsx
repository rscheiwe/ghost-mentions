"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import type { HighlightRange } from "../types";

export interface MentionHighlightsProps {
  overlay: HighlightRange[];
  textareaRef: RefObject<HTMLTextAreaElement>;
}

export function MentionHighlights({ overlay, textareaRef }: MentionHighlightsProps) {
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [textareaStyles, setTextareaStyles] = useState<React.CSSProperties>({});
  const [textareaValue, setTextareaValue] = useState('');

  // Copy textarea styles to highlighter (like SimpleMentionInput)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const computed = window.getComputedStyle(textarea);
    setTextareaStyles({
      padding: computed.padding,
      border: computed.border,
      font: computed.font,
      fontSize: computed.fontSize,
      fontFamily: computed.fontFamily,
      lineHeight: computed.lineHeight,
    });
  }, [textareaRef]);

  // Listen for input events to update immediately
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      setTextareaValue(textarea.value);
    };

    // Set initial value
    setTextareaValue(textarea.value);

    // Listen to input event for immediate updates during typing
    textarea.addEventListener('input', handleInput);
    return () => textarea.removeEventListener('input', handleInput);
  }, [textareaRef]);

  // Also sync when textarea value changes programmatically (e.g., mention insertion)
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Update if textarea.value differs from our state (prevents infinite loop)
    if (textarea.value !== textareaValue) {
      console.log('MentionHighlights: syncing value programmatically', textarea.value);
      setTextareaValue(textarea.value);
    }
  }, [overlay, textareaRef, textareaValue]); // Run when overlay changes (token added)

  // Sync scroll between textarea and highlighter (like SimpleMentionInput)
  useEffect(() => {
    const textarea = textareaRef.current;
    const highlighter = highlighterRef.current;
    if (!textarea || !highlighter) return;

    const handleScroll = () => {
      highlighter.scrollTop = textarea.scrollTop;
      highlighter.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener("scroll", handleScroll);
    return () => textarea.removeEventListener("scroll", handleScroll);
  }, [textareaRef]);

  // Render highlighted text (like SimpleMentionInput.renderHighlightedText)
  const renderHighlightedText = () => {
    const text = textareaValue;
    if (!text) return '';

    // Sort ranges by start position
    const sortedRanges = overlay.slice().sort((a, b) => a.start - b.start);

    let html = '';
    let lastIndex = 0;

    // Build HTML by iterating through ranges based on position
    sortedRanges.forEach((range) => {
      // Add text before this mention (escaped)
      const beforeText = text.substring(lastIndex, range.start);
      html += beforeText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Add the mention (highlighted and escaped)
      const mentionText = text.substring(range.start, range.end);
      const escapedMention = mentionText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      html += `<span class="mention-highlight">${escapedMention}</span>`;

      lastIndex = range.end;
    });

    // Add remaining text after last mention (escaped)
    const remainingText = text.substring(lastIndex);
    html += remainingText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return html;
  };

  return (
    <div
      ref={highlighterRef}
      className="mention-highlight-overlay"
      style={textareaStyles}
      dangerouslySetInnerHTML={{ __html: renderHighlightedText() }}
      aria-hidden="true"
    />
  );
}
