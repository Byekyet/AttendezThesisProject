-- Add courseId and scheduleId to Request model
ALTER TABLE "Request" ADD COLUMN "courseId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Request" ADD COLUMN "scheduleId" TEXT;

-- Add foreign key constraint between Request and Course
ALTER TABLE "Request" ADD CONSTRAINT "Request_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update RequestType enum to add new values
ALTER TYPE "RequestType" ADD VALUE 'RE_REGISTRATION';
ALTER TYPE "RequestType" ADD VALUE 'LEAVE';

-- After all existing data is migrated, remove the default constraint
ALTER TABLE "Request" ALTER COLUMN "courseId" DROP DEFAULT; 