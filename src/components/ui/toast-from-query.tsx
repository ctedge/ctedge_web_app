"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  messages?: {
    saved?: string;
    created?: string;
    success?: string;
    error?: string;
  };
};

const KEYS = ["success", "error", "saved", "created"] as const;

export function ToastFromQuery({ messages }: Props) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;

    const success = params.get("success") ?? params.get("saved") ?? params.get("created");
    const error = params.get("error");

    let didFire = false;

    if (error) {
      toast.error(messages?.error ?? error);
      didFire = true;
    } else if (success) {
      const msg =
        (params.has("saved") && messages?.saved) ||
        (params.has("created") && messages?.created) ||
        messages?.success ||
        "Saved.";
      toast.success(msg);
      didFire = true;
    }

    if (didFire) {
      fired.current = true;
      const next = new URLSearchParams(params.toString());
      KEYS.forEach((k) => next.delete(k));
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }
  }, [params, pathname, router, messages]);

  return null;
}
