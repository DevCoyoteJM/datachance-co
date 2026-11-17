-- CreateTable
CREATE TABLE "Lottery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "playDays" TEXT NOT NULL,
    "hasSeries" BOOLEAN NOT NULL DEFAULT false,
    "hasZodiac" BOOLEAN NOT NULL DEFAULT false,
    "isBaloto" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Result" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lotteryId" INTEGER NOT NULL,
    "number" TEXT,
    "series" TEXT,
    "zodiacSign" TEXT,
    "balotas" TEXT,
    "superbalota" TEXT,
    "jackpot" TEXT,
    "drawDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Result_lotteryId_fkey" FOREIGN KEY ("lotteryId") REFERENCES "Lottery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lottery_slug_key" ON "Lottery"("slug");

-- CreateIndex
CREATE INDEX "Result_lotteryId_idx" ON "Result"("lotteryId");

-- CreateIndex
CREATE INDEX "Result_drawDate_idx" ON "Result"("drawDate");
