-- CreateEnum
CREATE TYPE "LinkType" AS ENUM ('LINK', 'HEADER');

-- AlterTable
ALTER TABLE "links" ADD COLUMN     "type" "LinkType" NOT NULL DEFAULT 'LINK',
ALTER COLUMN "url" DROP NOT NULL;
