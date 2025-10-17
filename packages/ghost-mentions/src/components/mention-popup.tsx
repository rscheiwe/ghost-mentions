"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { MenuState } from "../types";

export interface MentionPopupProps {
  menu: MenuState;
  onSelect?: (item: any, index: number) => void;
}

export function MentionPopup({ menu, onSelect }: MentionPopupProps) {
  if (!menu.open || !menu.caretRect) return null;

  return (
    <DropdownMenu.Root open={menu.open} modal={false}>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          style={{
            position: "fixed",
            left: menu.caretRect.left,
            top: menu.caretRect.top + menu.caretRect.height + 4,
          }}
          className="z-50 min-w-[16rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {menu.loading ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              Loading...
            </div>
          ) : menu.items.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            <>
              {menu.items.map((item, index) => (
                <DropdownMenu.Item
                  key={item.id}
                  className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  data-selected={index === menu.selectedIndex}
                  onSelect={(e) => {
                    e.preventDefault();
                    onSelect?.(item, index);
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                  }}
                >
                  <span className="flex-1">{item.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {item.type}
                  </span>
                </DropdownMenu.Item>
              ))}
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
