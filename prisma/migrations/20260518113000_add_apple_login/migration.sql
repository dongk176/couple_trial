ALTER TABLE "couple_court"."User"
ADD COLUMN "appleSub" TEXT,
ADD COLUMN "email" TEXT;

CREATE UNIQUE INDEX "User_appleSub_key" ON "couple_court"."User"("appleSub");
