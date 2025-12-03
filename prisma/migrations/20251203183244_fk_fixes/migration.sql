-- DropForeignKey
ALTER TABLE "service_requests" DROP CONSTRAINT "service_requests_guest_id_fkey";

-- AlterTable
ALTER TABLE "service_requests" ALTER COLUMN "guest_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
