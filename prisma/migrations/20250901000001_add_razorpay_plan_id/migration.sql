-- AlterTable
ALTER TABLE "subscription_plans" ADD COLUMN "razorpay_plan_id" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "razorpay_plan_id" TEXT;
