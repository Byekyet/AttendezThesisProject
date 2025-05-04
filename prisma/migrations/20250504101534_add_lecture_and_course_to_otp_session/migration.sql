/*
  Warnings:

  - A unique constraint covering the columns `[userId,lectureId]` on the table `OtpSession` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `OtpSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lectureId` to the `OtpSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OtpSession" ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "lectureId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OtpSession_userId_lectureId_key" ON "OtpSession"("userId", "lectureId");

-- AddForeignKey
ALTER TABLE "OtpSession" ADD CONSTRAINT "OtpSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpSession" ADD CONSTRAINT "OtpSession_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;
