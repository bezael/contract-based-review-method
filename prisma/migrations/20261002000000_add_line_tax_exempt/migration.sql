-- Add the per-line tax exemption flag. Existing lines stay taxable.
ALTER TABLE "InvoiceLine" ADD COLUMN "taxExempt" BOOLEAN NOT NULL DEFAULT false;
