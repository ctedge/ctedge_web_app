-- Drop duplicate Purchase rows (keep earliest per customer+listing) so the unique index can be created.
DELETE FROM "Purchase" p
USING "Purchase" q
WHERE p."customerId" = q."customerId"
  AND p."listingType" = q."listingType"
  AND p."listingId" = q."listingId"
  AND p."startedAt" > q."startedAt";

-- One reservation per (customer, listing).
CREATE UNIQUE INDEX "uniq_customer_listing"
  ON "Purchase" ("customerId", "listingType", "listingId");

-- One active (PENDING or APPROVED) investment per (investor, project). REJECTED rows are excluded so the user can re-apply.
CREATE UNIQUE INDEX "uniq_active_investment"
  ON "Investment" ("investorId", "projectId")
  WHERE status IN ('PENDING', 'APPROVED');
