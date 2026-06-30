-- CreateTable
CREATE TABLE "profile_views" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "referrer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_views_user_id_idx" ON "profile_views"("user_id");

-- CreateIndex
CREATE INDEX "profile_views_created_at_idx" ON "profile_views"("created_at");

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
