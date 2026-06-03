import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[mailer] SMTP not configured — emails will be logged to console.");
    }
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export async function sendMail({ to, subject, html, text, replyTo }: SendMailInput) {
  const from = process.env.SMTP_FROM ?? "no-reply@example.com";
  const t = getTransporter();
  if (!t) {
    console.debug("[mailer:stub]", { to, subject, text: text ?? html.replace(/<[^>]+>/g, " ").slice(0, 200) });
    return { messageId: "stub" };
  }
  return t.sendMail({ from, to, subject, html, text, replyTo });
}
