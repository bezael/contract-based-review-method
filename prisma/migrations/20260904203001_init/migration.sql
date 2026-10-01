-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "rnc" TEXT NOT NULL,
    "email" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Factura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "clienteId" TEXT NOT NULL,
    "subtotalCent" INTEGER NOT NULL,
    "impuestoCent" INTEGER NOT NULL,
    "totalCent" INTEGER NOT NULL,
    "emitidaEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Factura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LineaFactura" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facturaId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitCent" INTEGER NOT NULL,
    "totalCent" INTEGER NOT NULL,
    CONSTRAINT "LineaFactura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_rnc_key" ON "Cliente"("rnc");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_numero_key" ON "Factura"("numero");
