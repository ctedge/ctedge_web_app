import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addMonths } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@ctedge.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@1234";
  const adminHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminHash, role: "ADMIN", emailVerified: new Date() },
    create: {
      email: adminEmail,
      name: "Site Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // const customerHash = await bcrypt.hash("Customer123!", 10);
  // const customer = await prisma.user.upsert({
  //   where: { email: "customer@example.com" },
  //   update: {},
  //   create: {
  //     email: "customer@example.com",
  //     name: "Demo Customer",
  //     phone: "+2348000000001",
  //     passwordHash: customerHash,
  //     role: "CUSTOMER",
  //     emailVerified: new Date(),
  //     customerProfile: { create: { address: "1 Demo Street, Lagos" } },
  //   },
  // });

  // const investorHash = await bcrypt.hash("Investor123!", 10);
  // await prisma.user.upsert({
  //   where: { email: "investor@example.com" },
  //   update: {},
  //   create: {
  //     email: "investor@example.com",
  //     name: "Demo Investor",
  //     phone: "+2348000000002",
  //     passwordHash: investorHash,
  //     role: "INVESTOR",
  //     emailVerified: new Date(),
  //     investorProfile: { create: { kycStatus: "APPROVED" } },
  //   },
  // });

  // const landSeeds = [
  //   {
  //     slug: "emerald-gardens-lekki",
  //     title: "Emerald Gardens, Lekki Phase 2",
  //     location: "Lekki Phase 2, Lagos",
  //     plotSizeSqm: 500,
  //     priceOutright: 35000000,
  //     priceInstallment: 42000000,
  //     paymentPlans: [
  //       { months: 6, deposit: 10000000, monthly: 5500000, label: "6-month plan" },
  //       { months: 12, deposit: 10000000, monthly: 2700000, label: "12-month plan" },
  //     ],
  //     features: ["Gated estate", "24/7 security", "Tarred road", "Perimeter fence", "Water + power"],
  //     mapLat: 6.4281,
  //     mapLng: 3.5375,
  //   },
  //   {
  //     slug: "havens-park-ibeju",
  //     title: "Havens Park, Ibeju-Lekki",
  //     location: "Ibeju-Lekki, Lagos",
  //     plotSizeSqm: 600,
  //     priceOutright: 18000000,
  //     priceInstallment: 21000000,
  //     paymentPlans: [
  //       { months: 12, deposit: 4000000, monthly: 1500000, label: "12-month plan" },
  //     ],
  //     features: ["C of O", "Road network", "Street lights", "Drainage"],
  //     mapLat: 6.4423,
  //     mapLng: 4.0322,
  //   },
  //   {
  //     slug: "royal-heights-abuja",
  //     title: "Royal Heights, Lugbe",
  //     location: "Lugbe, Abuja",
  //     plotSizeSqm: 450,
  //     priceOutright: 22000000,
  //     priceInstallment: 26000000,
  //     paymentPlans: [
  //       { months: 9, deposit: 5000000, monthly: 2400000, label: "9-month plan" },
  //     ],
  //     features: ["R of O", "Water borehole", "Transformer"],
  //     mapLat: 8.9806,
  //     mapLng: 7.3986,
  //   },
  // ];

  // for (const l of landSeeds) {
  //   await prisma.landListing.upsert({
  //     where: { slug: l.slug },
  //     update: {},
  //     create: {
  //       ...l,
  //       status: "PUBLISHED",
  //       galleryKeys: [],
  //       seoTitle: `${l.title} for sale`,
  //       seoDescription: `${l.title} — ${l.plotSizeSqm}sqm plots from ₦${(l.priceOutright).toLocaleString()}.`,
  //     },
  //   });
  // }

  // const housingSeeds = [
  //   {
  //     slug: "4-bed-duplex-magodo",
  //     title: "4-Bedroom Duplex, Magodo GRA",
  //     type: "DUPLEX" as const,
  //     location: "Magodo GRA, Lagos",
  //     price: 180000000,
  //     bedrooms: 4,
  //     bathrooms: 5,
  //     description: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "A 4-bedroom duplex with BQ, ample parking, and serene environment." }] }] },
  //   },
  //   {
  //     slug: "3-bed-terrace-lekki",
  //     title: "3-Bedroom Terrace, Lekki Phase 1",
  //     type: "TERRACE" as const,
  //     location: "Lekki Phase 1, Lagos",
  //     price: 120000000,
  //     bedrooms: 3,
  //     bathrooms: 4,
  //     description: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Contemporary finishes in a prime location." }] }] },
  //   },
  // ];
  // for (const h of housingSeeds) {
  //   await prisma.housingListing.upsert({
  //     where: { slug: h.slug },
  //     update: {},
  //     create: {
  //       ...h,
  //       status: "PUBLISHED",
  //       galleryKeys: [],
  //       floorPlanKeys: [],
  //       paymentPlans: [{ months: 6, deposit: h.price * 0.4, monthly: Math.round(h.price * 0.1), label: "6-month plan" }],
  //     },
  //   });
  // }

  // const projectSeeds = [
  //   { slug: "emerald-gardens-dev", title: "Emerald Gardens — Phase 1", status: "ONGOING" as const, location: "Lekki", description: "Ongoing infrastructure works at Emerald Gardens." },
  //   { slug: "havens-park-complete", title: "Havens Park — Handover", status: "COMPLETED" as const, location: "Ibeju-Lekki", description: "Fully completed estate with allocated plots.", completionDate: new Date("2024-06-01") },
  //   { slug: "royal-heights-upcoming", title: "Royal Heights — Upcoming", status: "UPCOMING" as const, location: "Abuja", description: "Launching Q3 2026." },
  // ];
  // for (const p of projectSeeds) {
  //   await prisma.project.upsert({
  //     where: { slug: p.slug },
  //     update: {},
  //     create: { ...p, galleryKeys: [] },
  //   });
  // }

  // await prisma.investmentProject.upsert({
  //   where: { slug: "emerald-gardens-bond" },
  //   update: {},
  //   create: {
  //     slug: "emerald-gardens-bond",
  //     title: "Emerald Gardens Development Bond",
  //     description: "Fund the phase 1 build-out of Emerald Gardens and earn 18% annual ROI on a 12-month tenor. Asset-backed and secured against subdivided plots held in escrow.",
  //     minAmount: 1000000,
  //     roiPercent: 18,
  //     durationMonths: 12,
  //     maturityDate: addMonths(new Date(), 12),
  //     totalTarget: 250000000,
  //     totalRaised: 80000000,
  //     status: "OPEN",
  //     galleryKeys: [],
  //     docKeys: [],
  //   },
  // });

  // const land = await prisma.landListing.findUnique({ where: { slug: "emerald-gardens-lekki" } });
  // if (land) {
  //   const existingPurchase = await prisma.purchase.findFirst({
  //     where: { customerId: customer.id, listingType: "LAND", listingId: land.id },
  //   });
  //   if (!existingPurchase) {
  //     const total = Number(land.priceInstallment ?? land.priceOutright ?? 0);
  //     const purchase = await prisma.purchase.create({
  //       data: {
  //         customerId: customer.id,
  //         listingType: "LAND",
  //         listingId: land.id,
  //         totalPrice: total,
  //         paymentMode: "INSTALLMENT",
  //       },
  //     });
  //     const deposit = 10000000;
  //     const months = 6;
  //     const monthly = Math.round((total - deposit) / months);
  //     await prisma.installment.create({ data: { purchaseId: purchase.id, dueDate: new Date(), amount: deposit, status: "PAID", paidAt: new Date() } });
  //     for (let i = 1; i <= months; i++) {
  //       await prisma.installment.create({
  //         data: { purchaseId: purchase.id, dueDate: addMonths(new Date(), i), amount: monthly, status: i === 1 ? "DUE" : "PENDING" },
  //       });
  //     }
  //     await prisma.invoice.create({
  //       data: {
  //         number: `INV-DEMO-${Math.floor(Math.random() * 9000 + 1000)}`,
  //         target: "PURCHASE",
  //         purchaseId: purchase.id,
  //         amount: monthly,
  //         status: "UNPAID",
  //         dueAt: addMonths(new Date(), 1),
  //       },
  //     });
  //   }
  // }

  console.log("✅ Seed complete.");
  console.log(`   Admin:   ${adminEmail} / ${adminPassword}`);
  console.log(`   Customer: customer@example.com / Customer123!`);
  console.log(`   Investor: investor@example.com / Investor123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
