-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" SET DEFAULT 'user';

-- CreateTable
CREATE TABLE "LegalDocument" (
    "id" TEXT NOT NULL,
    "bron" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "datum" TIMESTAMP(3),
    "artikelNr" TEXT,
    "ecliNr" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "wetboek" TEXT,
    "rechtsgebied" TEXT,
    "embedding" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Boete" (
    "id" TEXT NOT NULL,
    "feitcode" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "bedrag" INTEGER NOT NULL,
    "punten" INTEGER,
    "wetsartikel" TEXT,
    "wetboek" TEXT,
    "geldigVan" TIMESTAMP(3) NOT NULL,
    "geldigTot" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Boete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jurisprudentie" (
    "id" TEXT NOT NULL,
    "ecli" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "samenvatting" TEXT,
    "volledigeTekst" TEXT NOT NULL,
    "instantie" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "uitspraakType" TEXT NOT NULL,
    "rechtsgebied" TEXT NOT NULL,
    "trefwoorden" TEXT NOT NULL,
    "wetsartikelen" TEXT NOT NULL,
    "embedding" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Jurisprudentie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParlementairStuk" (
    "id" TEXT NOT NULL,
    "nummer" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "kamer" TEXT NOT NULL,
    "vergaderjaar" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "indieners" TEXT NOT NULL,
    "onderwerp" TEXT,
    "embedding" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParlementairStuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataIngestLog" (
    "id" TEXT NOT NULL,
    "bron" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "documentsProcessed" INTEGER NOT NULL DEFAULT 0,
    "documentsAdded" INTEGER NOT NULL DEFAULT 0,
    "documentsUpdated" INTEGER NOT NULL DEFAULT 0,
    "documentsDeleted" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataIngestLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queryId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "tags" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT 'gray',
    "icon" TEXT NOT NULL DEFAULT 'folder',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryQuery" (
    "id" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "queryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "searchTerm" TEXT NOT NULL,
    "profession" TEXT NOT NULL DEFAULT 'algemeen',
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "answer" TEXT NOT NULL DEFAULT '',
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSetting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "questionNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemUpdates" BOOLEAN NOT NULL DEFAULT true,
    "favoriteNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalDocument_uri_key" ON "LegalDocument"("uri");

-- CreateIndex
CREATE INDEX "LegalDocument_bron_type_idx" ON "LegalDocument"("bron", "type");

-- CreateIndex
CREATE INDEX "LegalDocument_wetboek_idx" ON "LegalDocument"("wetboek");

-- CreateIndex
CREATE INDEX "LegalDocument_rechtsgebied_idx" ON "LegalDocument"("rechtsgebied");

-- CreateIndex
CREATE INDEX "LegalDocument_datum_idx" ON "LegalDocument"("datum");

-- CreateIndex
CREATE INDEX "LegalDocument_status_idx" ON "LegalDocument"("status");

-- CreateIndex
CREATE INDEX "LegalDocument_titel_idx" ON "LegalDocument"("titel");

-- CreateIndex
CREATE INDEX "LegalDocument_tekst_idx" ON "LegalDocument"("tekst");

-- CreateIndex
CREATE UNIQUE INDEX "Boete_feitcode_key" ON "Boete"("feitcode");

-- CreateIndex
CREATE INDEX "Boete_categorie_idx" ON "Boete"("categorie");

-- CreateIndex
CREATE INDEX "Boete_bedrag_idx" ON "Boete"("bedrag");

-- CreateIndex
CREATE INDEX "Boete_status_idx" ON "Boete"("status");

-- CreateIndex
CREATE INDEX "Boete_geldigVan_geldigTot_idx" ON "Boete"("geldigVan", "geldigTot");

-- CreateIndex
CREATE UNIQUE INDEX "Jurisprudentie_ecli_key" ON "Jurisprudentie"("ecli");

-- CreateIndex
CREATE INDEX "Jurisprudentie_instantie_idx" ON "Jurisprudentie"("instantie");

-- CreateIndex
CREATE INDEX "Jurisprudentie_datum_idx" ON "Jurisprudentie"("datum");

-- CreateIndex
CREATE INDEX "Jurisprudentie_rechtsgebied_idx" ON "Jurisprudentie"("rechtsgebied");

-- CreateIndex
CREATE INDEX "Jurisprudentie_titel_idx" ON "Jurisprudentie"("titel");

-- CreateIndex
CREATE INDEX "Jurisprudentie_samenvatting_idx" ON "Jurisprudentie"("samenvatting");

-- CreateIndex
CREATE UNIQUE INDEX "ParlementairStuk_nummer_key" ON "ParlementairStuk"("nummer");

-- CreateIndex
CREATE INDEX "ParlementairStuk_type_idx" ON "ParlementairStuk"("type");

-- CreateIndex
CREATE INDEX "ParlementairStuk_kamer_idx" ON "ParlementairStuk"("kamer");

-- CreateIndex
CREATE INDEX "ParlementairStuk_vergaderjaar_idx" ON "ParlementairStuk"("vergaderjaar");

-- CreateIndex
CREATE INDEX "ParlementairStuk_datum_idx" ON "ParlementairStuk"("datum");

-- CreateIndex
CREATE INDEX "ParlementairStuk_status_idx" ON "ParlementairStuk"("status");

-- CreateIndex
CREATE INDEX "DataIngestLog_bron_type_idx" ON "DataIngestLog"("bron", "type");

-- CreateIndex
CREATE INDEX "DataIngestLog_status_idx" ON "DataIngestLog"("status");

-- CreateIndex
CREATE INDEX "DataIngestLog_startedAt_idx" ON "DataIngestLog"("startedAt");

-- CreateIndex
CREATE INDEX "UserNote_userId_createdAt_idx" ON "UserNote"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserNote_tags_idx" ON "UserNote"("tags");

-- CreateIndex
CREATE INDEX "UserCategory_userId_sortOrder_idx" ON "UserCategory"("userId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "UserCategory_userId_name_key" ON "UserCategory"("userId", "name");

-- CreateIndex
CREATE INDEX "CategoryQuery_categoryId_idx" ON "CategoryQuery"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryQuery_queryId_categoryId_key" ON "CategoryQuery"("queryId", "categoryId");

-- CreateIndex
CREATE INDEX "UserFavorite_userId_createdAt_idx" ON "UserFavorite"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_userId_queryId_key" ON "UserFavorite"("userId", "queryId");

-- CreateIndex
CREATE INDEX "UserSearchHistory_userId_createdAt_idx" ON "UserSearchHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserSearchHistory_searchTerm_idx" ON "UserSearchHistory"("searchTerm");

-- CreateIndex
CREATE INDEX "AdminLog_adminId_createdAt_idx" ON "AdminLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminLog_action_idx" ON "AdminLog"("action");

-- CreateIndex
CREATE INDEX "AdminLog_createdAt_idx" ON "AdminLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- CreateIndex
CREATE INDEX "SystemSetting_isPublic_idx" ON "SystemSetting"("isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_questionId_key" ON "Favorite"("userId", "questionId");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSetting_userId_key" ON "NotificationSetting"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_type_idx" ON "ActivityLog"("type");

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCategory" ADD CONSTRAINT "UserCategory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryQuery" ADD CONSTRAINT "CategoryQuery_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryQuery" ADD CONSTRAINT "CategoryQuery_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "UserCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_queryId_fkey" FOREIGN KEY ("queryId") REFERENCES "Query"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSearchHistory" ADD CONSTRAINT "UserSearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSetting" ADD CONSTRAINT "NotificationSetting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
