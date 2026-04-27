import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 11, fontFamily: "Helvetica", color: "#0f172a", lineHeight: 1.5 },
  header: { marginBottom: 32, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#0f766e" },
  company: { fontSize: 18, fontWeight: 700 },
  subtitle: { fontSize: 10, color: "#64748b", marginTop: 2 },
  title: { fontSize: 22, fontWeight: 700, color: "#0f766e", marginTop: 24, marginBottom: 16, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  label: { color: "#64748b" },
  value: { fontWeight: 700 },
  body: { marginTop: 24, marginBottom: 24 },
  paragraph: { marginBottom: 12 },
  sig: { marginTop: 64, flexDirection: "row", justifyContent: "space-between" },
  sigBlock: { width: 200 },
  sigLine: { borderTopWidth: 1, borderTopColor: "#0f172a", paddingTop: 4, fontSize: 10, color: "#64748b" },
  footer: { position: "absolute", left: 56, right: 56, bottom: 32, textAlign: "center", fontSize: 9, color: "#94a3b8" },
});

export type AllocationData = {
  customerName: string;
  propertyTitle: string;
  propertyLocation: string;
  plotDetails?: string;
  allocationNumber: string;
  issuedAt: Date;
  companyName: string;
  companyAddress?: string;
};

export function AllocationDocument(data: AllocationData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.company}>{data.companyName}</Text>
          {data.companyAddress ? <Text style={styles.subtitle}>{data.companyAddress}</Text> : null}
        </View>

        <Text style={styles.title}>LETTER OF ALLOCATION</Text>

        <View style={{ marginBottom: 16 }}>
          <View style={styles.row}><Text style={styles.label}>Allocation number</Text><Text style={styles.value}>{data.allocationNumber}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.value}>{data.issuedAt.toDateString()}</Text></View>
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>Dear {data.customerName},</Text>
          <Text style={styles.paragraph}>
            We are pleased to formally allocate to you the property known as {data.propertyTitle}, situated at {data.propertyLocation}.
            {data.plotDetails ? ` ${data.plotDetails}` : ""}
          </Text>
          <Text style={styles.paragraph}>
            This allocation is made subject to the terms of the sale agreement executed between you and {data.companyName}, and to the
            full settlement of all sums due in respect of the property.
          </Text>
          <Text style={styles.paragraph}>
            Please retain this letter as evidence of your allocation. It will be required for the issuance of your Deed of Assignment
            and Certificate of Occupancy.
          </Text>
          <Text style={styles.paragraph}>Yours faithfully,</Text>
        </View>

        <View style={styles.sig}>
          <View style={styles.sigBlock}>
            <Text style={styles.sigLine}>Authorised signatory</Text>
            <Text style={{ marginTop: 4, fontWeight: 700 }}>{data.companyName}</Text>
          </View>
          <View style={styles.sigBlock}>
            <Text style={styles.sigLine}>Date</Text>
            <Text style={{ marginTop: 4 }}>{data.issuedAt.toDateString()}</Text>
          </View>
        </View>

        <Text style={styles.footer}>This letter is issued electronically and valid without a physical signature.</Text>
      </Page>
    </Document>
  );
}

export async function generateAllocationPdf(data: AllocationData): Promise<Buffer> {
  return await renderToBuffer(AllocationDocument(data));
}
