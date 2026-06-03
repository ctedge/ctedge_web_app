-- CreateEnum
CREATE TYPE "TestimonialRole" AS ENUM ('INVESTOR', 'CLIENT');

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "role" "TestimonialRole" NOT NULL,
    "quote" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_published_sortOrder_idx" ON "Testimonial"("published", "sortOrder");
