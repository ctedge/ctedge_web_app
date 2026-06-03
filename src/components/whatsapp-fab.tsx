import Link from "next/link";

export function WhatsAppFab() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const clean = number.replace(/[^\d]/g, "");
  if (!clean) return null;
  const href = `https://wa.me/${clean}`;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M20.52 3.48A11.9 11.9 0 0 0 12.04 0C5.5 0 .17 5.33.17 11.86c0 2.1.55 4.13 1.6 5.93L0 24l6.39-1.68a11.87 11.87 0 0 0 5.65 1.44h.01c6.54 0 11.87-5.33 11.87-11.86 0-3.17-1.23-6.15-3.4-8.42zM12.05 21.5h-.01a9.6 9.6 0 0 1-4.9-1.34l-.35-.21-3.8 1 1.01-3.7-.23-.38a9.57 9.57 0 0 1-1.48-5.1c0-5.3 4.32-9.62 9.64-9.62 2.58 0 5 1 6.82 2.83a9.56 9.56 0 0 1 2.81 6.8c0 5.3-4.32 9.62-9.51 9.62zm5.57-7.2c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51l-.57-.01a1.1 1.1 0 0 0-.8.37c-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.48 1.7.62.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      </svg>
    </Link>
  );
}
