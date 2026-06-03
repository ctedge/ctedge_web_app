import Link from "next/link";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteDocument } from "@/server/actions/documents";
import { AssignDocumentForm } from "./assign-form";
import { ProofLink } from "@/app/(admin)/admin/invoices/proof-link";
import { format } from "date-fns";
import { Pagination, PAGE_SIZE, parsePage, buildPageHref } from "@/components/ui/pagination";

export const dynamic = "force-dynamic";

type Source = "DOCUMENT" | "PROOF" | "KYC_DOC";

type Row = {
  id: string;
  source: Source;
  kind: string;
  title: string;
  owner: { name: string | null; email: string | null; role: string };
  createdAt: Date | null;
  r2Key: string;
  deletable: boolean;
  sourceId?: string;
};

async function deleteDocumentAction(formData: FormData) {
  "use server";
  await deleteDocument(formData);
}

const FILTERS = ["ALL", "DOCUMENT", "PROOF", "KYC", "RECEIPT", "AGREEMENT", "ALLOCATION", "OTHER"] as const;
type Filter = (typeof FILTERS)[number];

function kindBadgeVariant(kind: string): "success" | "warning" | "danger" | "secondary" {
  if (kind === "PROOF") return "warning";
  if (kind === "RECEIPT" || kind === "ALLOCATION" || kind === "AGREEMENT") return "success";
  if (kind === "KYC") return "secondary";
  return "secondary";
}

export default async function AdminDocumentsPage({ searchParams }: { searchParams: Promise<{ kind?: string; page?: string }> }) {
  await requireRole("ADMIN");
  const { kind: rawKind, page: rawPage } = await searchParams;
  const filter: Filter = FILTERS.includes(rawKind as Filter) ? (rawKind as Filter) : "ALL";

  const [documents, proofInvoices, kycProfiles, users] = await Promise.all([
    prisma.document.findMany({ include: { owner: true }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({
      where: { proofKey: { not: null } },
      include: {
        purchase: { include: { customer: true } },
        investment: { include: { investor: true } },
      },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.investorProfile.findMany({
      where: { kycDocKeys: { isEmpty: false } },
      include: { user: true },
    }),
    prisma.user.findMany({ where: { role: { in: ["CUSTOMER", "INVESTOR"] } }, select: { id: true, name: true, email: true, role: true }, orderBy: { name: "asc" } }),
  ]);

  const rows: Row[] = [];

  for (const d of documents) {
    rows.push({
      id: `doc-${d.id}`,
      source: "DOCUMENT",
      kind: d.kind,
      title: d.title,
      owner: { name: d.owner.name, email: d.owner.email, role: d.owner.role },
      createdAt: d.createdAt,
      r2Key: d.r2Key,
      deletable: true,
      sourceId: d.id,
    });
  }

  for (const inv of proofInvoices) {
    if (!inv.proofKey) continue;
    const owner = inv.purchase?.customer ?? inv.investment?.investor;
    if (!owner) continue;
    rows.push({
      id: `proof-${inv.id}`,
      source: "PROOF",
      kind: "PROOF",
      title: `Proof for ${inv.number}`,
      owner: { name: owner.name, email: owner.email, role: owner.role },
      createdAt: inv.issuedAt,
      r2Key: inv.proofKey,
      deletable: false,
    });
  }

  for (const profile of kycProfiles) {
    profile.kycDocKeys.forEach((key, idx) => {
      rows.push({
        id: `kyc-${profile.id}-${idx}`,
        source: "KYC_DOC",
        kind: "KYC",
        title: key.split("/").pop() ?? `KYC document ${idx + 1}`,
        owner: { name: profile.user.name, email: profile.user.email, role: profile.user.role },
        createdAt: profile.user.createdAt,
        r2Key: key,
        deletable: false,
      });
    });
  }

  const filtered = filter === "ALL"
    ? rows
    : filter === "DOCUMENT"
      ? rows.filter((r) => r.source === "DOCUMENT")
      : rows.filter((r) => r.kind === filter);

  filtered.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(parsePage(rawPage), totalPages);
  const limited = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <PageHeader title="Documents" description="Every uploaded document across the platform — assigned files, payment proofs, and KYC submissions." />

      <Card className="mb-6">
        <CardHeader><CardTitle>Assign document</CardTitle></CardHeader>
        <CardContent>
          <AssignDocumentForm users={users} />
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={buildPageHref("/admin/documents", { kind: f === "ALL" ? undefined : f })}
            className={`rounded-full px-3 py-1 font-semibold ${filter === f ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {limited.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No documents match this filter.</p>
          ) : (
            <Table>
              <THead><TR><TH>Title</TH><TH>Owner</TH><TH>Kind</TH><TH>Source</TH><TH>Added</TH><TH className="text-right">Actions</TH></TR></THead>
              <TBody>
                {limited.map((r) => (
                  <TR key={r.id}>
                    <TD className="font-medium">
                      <div className="truncate">{r.title}</div>
                      <div className="truncate text-xs text-slate-400">{r.r2Key}</div>
                    </TD>
                    <TD>
                      <div>{r.owner.name ?? r.owner.email ?? "—"}</div>
                      <div className="text-xs text-slate-500">{r.owner.role}</div>
                    </TD>
                    <TD><Badge variant={kindBadgeVariant(r.kind)}>{r.kind}</Badge></TD>
                    <TD className="text-xs text-slate-500">{r.source === "DOCUMENT" ? "Document" : r.source === "PROOF" ? "Invoice proof" : "KYC submission"}</TD>
                    <TD>{r.createdAt ? format(r.createdAt, "MMM d, yyyy") : "—"}</TD>
                    <TD className="flex items-center justify-end gap-2">
                      <ProofLink proofKey={r.r2Key} label="View" />
                      {r.deletable && r.sourceId ? (
                        <form action={deleteDocumentAction}>
                          <input type="hidden" name="id" value={r.sourceId} />
                          <Button variant="ghost" size="sm" type="submit">Delete</Button>
                        </form>
                      ) : null}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            prevHref={buildPageHref("/admin/documents", { kind: filter === "ALL" ? undefined : filter, page: page - 1 })}
            nextHref={buildPageHref("/admin/documents", { kind: filter === "ALL" ? undefined : filter, page: page + 1 })}
          />
        </CardContent>
      </Card>
    </>
  );
}
