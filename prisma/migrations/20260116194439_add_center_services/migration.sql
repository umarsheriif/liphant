-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'awaiting_assignment';

-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_teacher_id_fkey";

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "center_id" TEXT,
ADD COLUMN     "service_id" TEXT,
ALTER COLUMN "teacher_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "center_services" (
    "id" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT,
    "description_en" TEXT,
    "description_ar" TEXT,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "center_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_service_assignments" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_service_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_service_assignments_service_id_teacher_id_key" ON "teacher_service_assignments"("service_id", "teacher_id");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "center_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "center_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "center_services" ADD CONSTRAINT "center_services_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "center_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_service_assignments" ADD CONSTRAINT "teacher_service_assignments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "center_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_service_assignments" ADD CONSTRAINT "teacher_service_assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
