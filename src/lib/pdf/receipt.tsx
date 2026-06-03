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
  section: { marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#64748b" },
  value: { fontWeight: 700 },
  amountBox: { marginTop: 24, padding: 16, backgroundColor: "#f0fdfa", borderRadius: 6 },
  amountLabel: { fontSize: 10, color: "#0f766e", textTransform: "uppercase", letterSpacing: 1 },
  amount: { fontSize: 22, fontWeight: 700, color: "#0f766e", marginTop: 4 },
  footer: { position: "absolute", left: 48, right: 48, bottom: 32, textAlign: "center", fontSize: 9, color: "#94a3b8", paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
});

export type ReceiptData = {
  receiptNumber: string;
  invoiceNumber: string;
  amount: number;
  payerName: string;
  issuedAt: Date;
  companyName: string;
  companyAddress?: string;
  note?: string;
};

export function ReceiptDocument(data: ReceiptData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>{data.companyName}</Text>
            {data.companyAddress ? <Text style={styles.subtitle}>{data.companyAddress}</Text> : null}
          </View>
          <View>
            <Text style={styles.title}>PAYMENT RECEIPT</Text>
            <Text style={styles.badge}>{data.receiptNumber}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Receipt number</Text>
            <Text style={styles.value}>{data.receiptNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice number</Text>
            <Text style={styles.value}>{data.invoiceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date issued</Text>
            <Text style={styles.value}>{data.issuedAt.toDateString()}</Text>
          </View>
          {data.payerName ? (
            <View style={styles.row}>
              <Text style={styles.label}>Received from</Text>
              <Text style={styles.value}>{data.payerName}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Amount received</Text>
          <Text style={styles.amount}>{formatNGN(data.amount)}</Text>
        </View>

        {data.note ? (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.label}>Note</Text>
            <Text style={{ marginTop: 4 }}>{data.note}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          Thank you for your payment. This receipt was generated electronically and is valid without a signature.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateReceiptPdf(data: ReceiptData): Promise<Buffer> {
  return await renderToBuffer(ReceiptDocument(data));
}
