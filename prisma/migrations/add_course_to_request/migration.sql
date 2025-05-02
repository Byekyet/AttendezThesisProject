-- First add courseId and scheduleId to Request model as nullable
ALTER TABLE "Request" ADD COLUMN "courseId" TEXT;
ALTER TABLE "Request" ADD COLUMN "scheduleId" TEXT;

-- Update RequestType enum to add new values
ALTER TYPE "RequestType" ADD VALUE IF NOT EXISTS 'RE_REGISTRATION';
ALTER TYPE "RequestType" ADD VALUE IF NOT EXISTS 'LEAVE';

-- Update existing requests to associate with the first course
-- We're assuming the first course is a valid default for existing requests
UPDATE "Request" 
SET "courseId" = (SELECT id FROM "Course" ORDER BY "createdAt" ASC LIMIT 1)
WHERE "courseId" IS NULL;

-- Now add the foreign key constraint between Request and Course
ALTER TABLE "Request" ADD CONSTRAINT "Request_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Finally, make courseId required (NOT NULL)
ALTER TABLE "Request" ALTER COLUMN "courseId" SET NOT NULL; 