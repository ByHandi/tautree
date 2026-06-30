-- AlterTable
ALTER TABLE "users" ADD COLUMN     "button_fill" TEXT NOT NULL DEFAULT 'solid',
ADD COLUMN     "button_shape" TEXT NOT NULL DEFAULT 'rounded';
