"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { renderEmail } from "@/lib/emails/render";
import { WelcomeEmail, ResetPasswordEmail } from "@/lib/emails/templates";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(30),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CUSTOMER", "INVESTOR"]).default("CUSTOMER"),
});

export type AuthFormState = { ok: boolean; message?: string; errors?: Record<string, string[]> };

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export async function registerAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const data = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { ok: false, message: "An account already exists for this email." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      passwordHash,
      role: parsed.data.role,
      customerProfile: parsed.data.role === "CUSTOMER" ? { create: {} } : undefined,
      investorProfile: parsed.data.role === "INVESTOR" ? { create: {} } : undefined,
    },
  });

  const rawToken = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: hashToken(rawToken),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      purpose: "verify",
    },
  });
  const verifyUrl = `${siteUrl}/verify?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
  const { html, text } = await renderEmail(WelcomeEmail({ name: user.name ?? "there", verifyUrl }));
  try { await sendMail({ to: user.email, subject: "Welcome — verify your email", html, text }); } catch (e) { console.error(e); }

  return { ok: true, message: "Account created. Check your email to verify, then log in." };
}

export async function loginAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "");
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/post-login",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, message: err.type === "CredentialsSignin" ? "Invalid email or password." : "Could not sign in." };
    }
    throw err;
  }
}

const resetRequestSchema = z.object({ email: z.string().email() });

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const rawToken = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: hashToken(rawToken),
        expires: new Date(Date.now() + 1000 * 60 * 60),
        purpose: "reset",
      },
    });
    const resetUrl = `${siteUrl}/reset?token=${rawToken}&email=${encodeURIComponent(user.email)}`;
    const { html, text } = await renderEmail(ResetPasswordEmail({ resetUrl }));
    try { await sendMail({ to: user.email, subject: "Reset your password", html, text }); } catch (e) { console.error(e); }
  }
  return { ok: true, message: "If that email exists, a reset link has been sent." };
}

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
  password: z.string().min(8),
});

export async function resetPassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };
  const tokenHash = hashToken(parsed.data.token);
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: parsed.data.email, token: tokenHash } },
  });
  if (!record || record.purpose !== "reset" || record.expires < new Date()) {
    return { ok: false, message: "This reset link is invalid or expired." };
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { email: parsed.data.email }, data: { passwordHash } });
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: parsed.data.email, token: tokenHash } } });
  return { ok: true, message: "Password updated. You can now sign in." };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function verifyEmailAction(email: string, token: string): Promise<{ ok: boolean; message: string }> {
  const tokenHash = hashToken(token);
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: tokenHash } },
  });
  if (!record || record.purpose !== "verify" || record.expires < new Date()) {
    return { ok: false, message: "Verification link is invalid or expired." };
  }
  await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token: tokenHash } } });
  return { ok: true, message: "Email verified. You can now log in." };
}
