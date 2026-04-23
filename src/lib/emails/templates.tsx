import * as React from "react";
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from "@react-email/components";

const company = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Company";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const wrapperStyle = { backgroundColor: "#f4f4f5", padding: "24px", fontFamily: "Inter, Arial, sans-serif" };
const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "32px",
  maxWidth: "560px",
  margin: "0 auto",
  border: "1px solid #e5e7eb",
};
const buttonStyle = {
  background: "#0f766e",
  color: "#ffffff",
  padding: "12px 20px",
  borderRadius: "8px",
  textDecoration: "none",
  display: "inline-block",
  fontWeight: 600,
};

function Shell({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={wrapperStyle}>
        <Container style={cardStyle}>
          <Heading as="h2" style={{ color: "#0f172a", marginTop: 0 }}>{company}</Heading>
          {children}
          <Section>
            <Text style={{ color: "#64748b", fontSize: "12px", marginTop: 32 }}>
              &copy; {new Date().getFullYear()} {company}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function WelcomeEmail({ name, verifyUrl }: { name: string; verifyUrl: string }) {
  return (
    <Shell preview={`Welcome to ${company}`}>
      <Heading as="h3">Welcome, {name} 👋</Heading>
      <Text>Thanks for creating an account with {company}. Please verify your email to get started.</Text>
      <Link href={verifyUrl} style={buttonStyle}>Verify email</Link>
      <Text style={{ color: "#64748b", fontSize: 12, marginTop: 24 }}>
        If the button doesn&apos;t work, paste this into your browser: {verifyUrl}
      </Text>
    </Shell>
  );
}

export function VerifyEmail({ verifyUrl }: { verifyUrl: string }) {
  return (
    <Shell preview="Verify your email">
      <Heading as="h3">Verify your email</Heading>
      <Text>Click below to confirm this is your email address.</Text>
      <Link href={verifyUrl} style={buttonStyle}>Verify email</Link>
    </Shell>
  );
}

export function ResetPasswordEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <Shell preview="Reset your password">
      <Heading as="h3">Reset your password</Heading>
      <Text>We received a request to reset your password. This link expires in 1 hour.</Text>
      <Link href={resetUrl} style={buttonStyle}>Reset password</Link>
      <Text style={{ color: "#64748b", fontSize: 12 }}>Didn&apos;t request this? You can safely ignore this email.</Text>
    </Shell>
  );
}

export function InvoiceEmail({ invoiceNumber, amount, dueAt, invoiceUrl }: {
  invoiceNumber: string;
  amount: string;
  dueAt?: string;
  invoiceUrl: string;
}) {
  return (
    <Shell preview={`Invoice ${invoiceNumber}`}>
      <Heading as="h3">Invoice {invoiceNumber}</Heading>
      <Text>Amount due: <strong>{amount}</strong>{dueAt ? ` • Due ${dueAt}` : ""}</Text>
      <Text>Please complete an offline bank transfer to the details provided and upload your proof of payment.</Text>
      <Link href={invoiceUrl} style={buttonStyle}>View invoice</Link>
    </Shell>
  );
}

export function ReceiptEmail({ receiptNumber, amount, receiptUrl }: {
  receiptNumber: string;
  amount: string;
  receiptUrl: string;
}) {
  return (
    <Shell preview="Payment received">
      <Heading as="h3">Payment received ✅</Heading>
      <Text>We&apos;ve confirmed your payment of <strong>{amount}</strong>. Receipt number: {receiptNumber}.</Text>
      <Link href={receiptUrl} style={buttonStyle}>Download receipt</Link>
    </Shell>
  );
}

export function ReminderEmail({ title, body, ctaUrl }: { title: string; body: string; ctaUrl?: string }) {
  return (
    <Shell preview={title}>
      <Heading as="h3">{title}</Heading>
      <Text>{body}</Text>
      {ctaUrl ? <Link href={ctaUrl} style={buttonStyle}>View details</Link> : null}
    </Shell>
  );
}

export function InvestmentApprovedEmail({ projectTitle, amount, dashboardUrl }: {
  projectTitle: string;
  amount: string;
  dashboardUrl: string;
}) {
  return (
    <Shell preview={`Your investment in ${projectTitle} is approved`}>
      <Heading as="h3">Investment approved 🎉</Heading>
      <Text>Your investment of <strong>{amount}</strong> in <strong>{projectTitle}</strong> has been approved.</Text>
      <Link href={dashboardUrl} style={buttonStyle}>Open investor dashboard</Link>
    </Shell>
  );
}

export function LeadNoticeEmail({ lead }: { lead: { name: string; phone: string; email?: string; interest?: string; source?: string; note?: string } }) {
  return (
    <Shell preview={`New lead: ${lead.name}`}>
      <Heading as="h3">New lead captured</Heading>
      <Text><strong>{lead.name}</strong> &middot; {lead.phone}{lead.email ? ` &middot; ${lead.email}` : ""}</Text>
      {lead.interest ? <Text>Interest: {lead.interest}</Text> : null}
      {lead.source ? <Text>Source: {lead.source}</Text> : null}
      {lead.note ? <Text>Note: {lead.note}</Text> : null}
      <Link href={`${baseUrl}/admin/customers`} style={buttonStyle}>View in admin</Link>
    </Shell>
  );
}

export function InspectionNoticeEmail({ booking }: { booking: { name: string; phone: string; preferredDate: string; listingTitle: string } }) {
  return (
    <Shell preview={`Inspection booking: ${booking.listingTitle}`}>
      <Heading as="h3">New inspection booking</Heading>
      <Text><strong>{booking.name}</strong> &middot; {booking.phone}</Text>
      <Text>Listing: {booking.listingTitle}</Text>
      <Text>Preferred date: {booking.preferredDate}</Text>
      <Link href={`${baseUrl}/admin`} style={buttonStyle}>Open admin</Link>
    </Shell>
  );
}
