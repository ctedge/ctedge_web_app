import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { formatNGN } from "@/lib/money";
import { PDF_FONT_FAMILY } from "./font";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: PDF_FONT_FAMILY, color: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  company: { fontSize: 16, fontWeight: 700 },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 2 },
  title: { fontSize: 20, fontWeight: 700, color: "#0f766e", textAlign: "right" },
  badge: { fontSize: 10, color: "#0f766e", textAlign: "right", marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#64748b" },
  value: { fontWeight: 700 },
  amountBox: { marginTop: 24, padding: 16, backgroundColor: "#f0fdfa", borderRadius: 6 },
  amountLabel: { fontSize: 10, color: "#0f766e", textTransform: "uppercase", letterSpacing: 1 },
  amount: { fontSize: 22, fontWeight: 700, color: "#0f766e", marginTop: 4 },
  bank: { marginTop: 24, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6 },
  bankTitle: { fontSize: 12, fontWeight: 700, marginBottom: 8 },
  footer: { position: "absolute", left: 48, right: 48, bottom: 32, textAlign: "center", fontSize: 9, color: "#94a3b8", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
});

export type InvoiceData = {
  invoiceNumber: string;
  amount: number;
  issuedAt: Date;
  dueAt?: Date | null;
  customerName: string;
  companyName: string;
  companyAddress?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  notes?: string | null;
};

export function InvoiceDocument(data: InvoiceData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>{data.companyName}</Text>
            {data.companyAddress ? <Text style={styles.subtitle}>{data.companyAddress}</Text> : null}
          </View>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.badge}>{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <View style={styles.row}>
            <Text style={styles.label}>Billed to</Text>
            <Text style={styles.value}>{data.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date issued</Text>
            <Text style={styles.value}>{data.issuedAt.toDateString()}</Text>
          </View>
          {data.dueAt ? (
            <View style={styles.row}>
              <Text style={styles.label}>Due date</Text>
              <Text style={styles.value}>{data.dueAt.toDateString()}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount due</Text>
          <Text style={styles.amount}>{formatNGN(data.amount)}</Text>
        </View>

        {data.bankName ? (
          <View style={styles.bank}>
            <Text style={styles.bankTitle}>Bank transfer details</Text>
            <View style={styles.row}><Text style={styles.label}>Bank</Text><Text style={styles.value}>{data.bankName}</Text></View>
            {data.bankAccountName ? <View style={styles.row}><Text style={styles.label}>Account name</Text><Text style={styles.value}>{data.bankAccountName}</Text></View> : null}
            {data.bankAccountNumber ? <View style={styles.row}><Text style={styles.label}>Account number</Text><Text style={styles.value}>{data.bankAccountNumber}</Text></View> : null}
            <View style={styles.row}><Text style={styles.label}>Reference</Text><Text style={styles.value}>{data.invoiceNumber}</Text></View>
          </View>
        ) : null}

        {data.notes ? (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Notes</Text>
            <Text style={{ marginTop: 4 }}>{data.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Please make payment by the due date. Include the invoice number as your transfer reference.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return await renderToBuffer(InvoiceDocument(data));
}
