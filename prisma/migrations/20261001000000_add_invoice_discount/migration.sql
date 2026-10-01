-- Add the whole-percentage discount to invoices, in basis points and cents.
ALTER TABLE "Invoice" ADD COLUMN "discountBps" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN "discountCents" INTEGER NOT NULL DEFAULT 0;
