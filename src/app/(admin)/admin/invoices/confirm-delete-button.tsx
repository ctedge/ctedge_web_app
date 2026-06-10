"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({ confirmMessage, label = "Delete" }: { confirmMessage: string; label?: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {label}
    </Button>
  );
}
