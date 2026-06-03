CREATE TABLE "CompanySettings" (
  "id"        TEXT NOT NULL DEFAULT 'default',
  "name"      TEXT NOT NULL,
  "address"   TEXT NOT NULL,
  "phone"     TEXT NOT NULL,
  "email"     TEXT NOT NULL,
  "whatsapp"  TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "CompanySettings" ("id", "name", "address", "phone", "email", "whatsapp", "updatedAt")
VALUES (
  'default',
  'CT Edge',
  'Lagos, Nigeria',
  '+234 800 000 0000',
  'hello@example.com',
  '2348000000000',
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
