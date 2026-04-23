import "server-only";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import type { NotificationType } from "@prisma/client";

type NotifyInput = {
  userId: string;
  title: string;
  body: string;
  type?: NotificationType;
  url?: string;
  email?: { subject: string; html: string; text?: string };
};

export async function notify({ userId, title, body, type = "INFO", url, email }: NotifyInput) {
  const notification = await prisma.notification.create({
    data: { userId, title, body, type, url },
  });
  if (email) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      try {
        await sendMail({ to: user.email, subject: email.subject, html: email.html, text: email.text });
      } catch (err) {
        console.error("[notify] failed to send email:", err);
      }
    }
  }
  return notification;
}

export async function notifyAdmins(input: Omit<NotifyInput, "userId">) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(admins.map((a) => notify({ ...input, userId: a.id })));
}
