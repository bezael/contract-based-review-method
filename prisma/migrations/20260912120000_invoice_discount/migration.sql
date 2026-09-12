-- AlterTable: per-invoice discount, applied to the subtotal before tax.
-- Both columns default to 0, so existing invoices keep their totals.
ALTER TABLE "Invoice" ADD COLUMN "discountBps" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;
