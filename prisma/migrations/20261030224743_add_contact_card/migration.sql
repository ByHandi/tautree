-- AlterTable
ALTER TABLE "users" ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "contact_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contact_org" TEXT,
ADD COLUMN     "contact_phone" TEXT,
ADD COLUMN     "contact_title" TEXT;
