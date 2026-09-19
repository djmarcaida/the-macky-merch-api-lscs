-- LSCS Macky Merch API - Raw SQLite DDL Schema

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL CHECK ("price" > 0),
    "stock" INTEGER NOT NULL CHECK ("stock" >= 0),
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimized querying and sorting
CREATE INDEX IF NOT EXISTS "idx_Product_category" ON "Product" ("category");
CREATE INDEX IF NOT EXISTS "idx_Product_createdAt" ON "Product" ("createdAt");
