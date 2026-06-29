-- CreateTable
CREATE TABLE "click_events" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "click_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "click_events_link_id_idx" ON "click_events"("link_id");

-- CreateIndex
CREATE INDEX "click_events_created_at_idx" ON "click_events"("created_at");

-- AddForeignKey
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
