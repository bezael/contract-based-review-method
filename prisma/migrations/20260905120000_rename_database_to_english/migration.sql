-- Rename database tables and columns to English.
ALTER TABLE "Cliente" RENAME TO "Customer";
ALTER TABLE "Factura" RENAME TO "Invoice";
ALTER TABLE "LineaFactura" RENAME TO "InvoiceLine";

ALTER TABLE "Customer" RENAME COLUMN "nombre" TO "name";
ALTER TABLE "Customer" RENAME COLUMN "rnc" TO "taxId";
ALTER TABLE "Customer" RENAME COLUMN "creadoEn" TO "createdAt";

ALTER TABLE "Invoice" RENAME COLUMN "numero" TO "number";
ALTER TABLE "Invoice" RENAME COLUMN "estado" TO "status";
ALTER TABLE "Invoice" RENAME COLUMN "clienteId" TO "customerId";
ALTER TABLE "Invoice" RENAME COLUMN "subtotalCent" TO "subtotalCents";
ALTER TABLE "Invoice" RENAME COLUMN "impuestoCent" TO "taxCents";
ALTER TABLE "Invoice" RENAME COLUMN "totalCent" TO "totalCents";
ALTER TABLE "Invoice" RENAME COLUMN "emitidaEn" TO "issuedAt";
ALTER TABLE "Invoice" RENAME COLUMN "creadoEn" TO "createdAt";

ALTER TABLE "InvoiceLine" RENAME COLUMN "facturaId" TO "invoiceId";
ALTER TABLE "InvoiceLine" RENAME COLUMN "descripcion" TO "description";
ALTER TABLE "InvoiceLine" RENAME COLUMN "cantidad" TO "quantity";
ALTER TABLE "InvoiceLine" RENAME COLUMN "precioUnitCent" TO "unitPriceCents";
ALTER TABLE "InvoiceLine" RENAME COLUMN "totalCent" TO "totalCents";

DROP INDEX "Cliente_rnc_key";
CREATE UNIQUE INDEX "Customer_taxId_key" ON "Customer"("taxId");
DROP INDEX "Factura_numero_key";
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

UPDATE "Invoice"
SET "status" = CASE "status"
  WHEN 'BORRADOR' THEN 'DRAFT'
  WHEN 'EMITIDA' THEN 'ISSUED'
  WHEN 'PAGADA' THEN 'PAID'
  WHEN 'ANULADA' THEN 'VOIDED'
  ELSE "status"
END;
