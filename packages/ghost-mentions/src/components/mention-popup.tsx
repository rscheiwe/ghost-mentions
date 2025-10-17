"use client";

import type { MenuState } from "../types";

export interface MentionPopupProps {
  menu: MenuState;
  onSelect?: (item: any, index: number) => void;
}

export function MentionPopup({ menu, onSelect }: MentionPopupProps) {
  if (!menu.open || !menu.caretRect) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: menu.caretRect.left,
        top: menu.caretRect.top + menu.caretRect.height + 4,
        zIndex: 9999,
        backgroundColor: "white",
        border: "2px solid red",
        padding: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
      }}
      className="w-64 rounded-md"
    >
      {menu.loading ? (
        <div className="px-2 py-1.5 text-sm text-gray-500">
          Loading...
        </div>
      ) : menu.items.length === 0 ? (
        <div className="px-2 py-1.5 text-sm text-gray-500">
          No results found
        </div>
      ) : (
        <div role="listbox" aria-label="Mention suggestions">
          {menu.items.map((item, index) => (
            <div
              key={item.id}
              role="option"
              aria-selected={index === menu.selectedIndex}
              data-selected={index === menu.selectedIndex}
              className="mention-popup-item"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect?.(item, index);
              }}
              onMouseEnter={() => {
                // Could update selectedIndex on hover
              }}
            >
              {item.label}
              <span className="ml-auto text-xs text-gray-500">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
