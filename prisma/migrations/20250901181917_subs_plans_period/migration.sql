/*
  Warnings:

  - You are about to drop the column `price_monthly` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `price_yearly` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `razorpay_plan_id` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `period` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."subscription_plans" DROP COLUMN "price_monthly",
DROP COLUMN "price_yearly",
ADD COLUMN     "period" "public"."BillingCycle" NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."subscriptions" DROP COLUMN "razorpay_plan_id",
ADD COLUMN     "plan_id" TEXT NOT NULL;
